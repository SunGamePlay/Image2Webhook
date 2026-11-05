"""Image2Webhook app.

Serves a clean web UI. When the user uploads images, each one is POSTed
individually to the configured n8n webhook (via N8N_WEBHOOK_URL in .env).
The webhook's response is not awaited by the browser — this app forwards
each image in the background and stores the webhook body in SQLite.

Run:
    uvicorn app:app --reload --port 8000
"""

import asyncio
import hashlib
import hmac
import json
import logging
import os
import re
import secrets
import sqlite3
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional

import httpx
from fastapi import Depends, FastAPI, File, HTTPException, Request, Response, UploadFile
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("image2webhook")

BASE_DIR = Path(__file__).resolve().parent
MAX_UPLOAD_BYTES = 20 * 1024 * 1024  # 20 MB
WEBHOOK_TIMEOUT = 600.0  # n8n workflows can take time to process
SHUTDOWN_TIMEOUT = 60.0  # seconds to wait for in-flight webhook calls on shutdown
SESSION_DAYS = 14
SESSION_COOKIE = "i2w_session"
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".svg"}




def load_env(path: Path) -> dict:
    """Minimal .env parser (KEY=VALUE lines, # comments)."""
    env = {}
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            env[key.strip()] = value.strip().strip('"').strip("'")
    return env


_env = load_env(BASE_DIR / ".env")
_config = load_env(BASE_DIR / ".config")
DEVELOPER_MODE = (
    os.environ.get("DEVELOPER_MODE")
    or _config.get("DEVELOPER_MODE", "")
).strip().lower() in {"1", "true", "yes", "on"}
WEBHOOK_URL = (
    os.environ.get("N8N_WEBHOOK_URL")
    or os.environ.get("n8n_webhook_url")
    or _env.get("N8N_WEBHOOK_URL")
    or _env.get("n8n_webhook_url", "")
).strip()
APP_USERNAME = (
    os.environ.get("APP_USERNAME") or _env.get("APP_USERNAME", "admin")
).strip() or "admin"
APP_PASSWORD = (
    os.environ.get("APP_PASSWORD") or _env.get("APP_PASSWORD", "changeme")
).strip() or "changeme"
APP_SECRET = (
    os.environ.get("APP_SECRET") or _env.get("APP_SECRET", "")
).strip() or secrets.token_hex(32)
_data_dir_raw = (
    os.environ.get("DATA_DIR") or _env.get("DATA_DIR", "")
).strip()
DATA_DIR = Path(_data_dir_raw) if _data_dir_raw else (BASE_DIR / "data")
DB_PATH = DATA_DIR / "results.db"
IMAGES_DIR = DATA_DIR / "images"
COOKIE_SECURE = (
    os.environ.get("COOKIE_SECURE") or _env.get("COOKIE_SECURE", "")
).strip().lower() in {"1", "true", "yes", "on"}

_http_client: Optional[httpx.AsyncClient] = None
_pending_sends: set[asyncio.Task] = set()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application resources across its lifecycle."""
    global _http_client
    _http_client = httpx.AsyncClient(timeout=WEBHOOK_TIMEOUT)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    _init_db()
    _seed_shared_user()
    if not WEBHOOK_URL:
        logger.warning("N8N_WEBHOOK_URL is not configured. Uploads will fail until configured.")
    if APP_PASSWORD == "changeme":
        logger.warning("APP_PASSWORD is still the default. Change it in .env before production use.")
    yield
    if _pending_sends:
        logger.info("Waiting for %d pending upload(s) to complete...", len(_pending_sends))
        done, pending = await asyncio.wait(_pending_sends, timeout=SHUTDOWN_TIMEOUT)
        for task in pending:
            task.cancel()
    await _http_client.aclose()


app = FastAPI(title="Image2Webhook", lifespan=lifespan)
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")


# ---------- database ----------

def _connect() -> sqlite3.Connection:
    """Open the results database, creating the data directory if needed."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _ensure_column(conn: sqlite3.Connection, table: str, column: str, decl: str) -> None:
    """Add a column when an older database is missing it."""
    existing = {row["name"] for row in conn.execute(f"PRAGMA table_info({table})").fetchall()}
    if column not in existing:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {decl}")


def _init_db() -> None:
    """Create tables if they do not exist, and migrate new columns."""
    conn = _connect()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS webhook_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                image_name TEXT NOT NULL,
                saved_at TEXT NOT NULL,
                http_status INTEGER NOT NULL,
                response_body TEXT NOT NULL
            )
            """
        )
        _ensure_column(conn, "webhook_results", "image_path", "TEXT")
        _ensure_column(conn, "webhook_results", "order_no", "TEXT")
        _ensure_column(conn, "webhook_results", "arrival_date", "TEXT")
        _ensure_column(conn, "webhook_results", "shade", "TEXT")
        _ensure_column(conn, "webhook_results", "order_json", "TEXT")
        _ensure_column(conn, "webhook_results", "user_id", "INTEGER")
        _ensure_column(conn, "webhook_results", "job_id", "INTEGER")
        _ensure_column(conn, "webhook_results", "duration_ms", "INTEGER")
        _ensure_column(conn, "jobs", "uuid", "TEXT")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS callback_payloads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT,
                json_count INTEGER NOT NULL,
                payload_json TEXT NOT NULL,
                source_ip TEXT,
                saved_at TEXT NOT NULL
            )
            """
        )
        # Migrate the dev-era table (job_id/image_name/branch columns) to the
        # uuid-keyed schema. It only holds test rows, so recreate it.
        _cb_cols = {row["name"] for row in conn.execute("PRAGMA table_info(callback_payloads)").fetchall()}
        if "uuid" not in _cb_cols and _cb_cols:
            conn.execute("DROP TABLE callback_payloads")
            conn.execute(
                """
                CREATE TABLE callback_payloads (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    uuid TEXT,
                    json_count INTEGER NOT NULL,
                    payload_json TEXT NOT NULL,
                    source_ip TEXT,
                    saved_at TEXT NOT NULL
                )
                """
            )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                image_name TEXT NOT NULL,
                image_path TEXT,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                started_at TEXT,
                finished_at TEXT,
                result_id INTEGER,
                error TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
            """
        )
        conn.commit()
    finally:
        conn.close()


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _hash_password(password: str, salt: Optional[str] = None) -> str:
    """Return salt$hash using PBKDF2-HMAC-SHA256 (stdlib only)."""
    if salt is None:
        salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        200_000,
    ).hex()
    return f"{salt}${digest}"


def _verify_password(password: str, stored: str) -> bool:
    try:
        salt, _digest = stored.split("$", 1)
    except ValueError:
        return False
    return hmac.compare_digest(_hash_password(password, salt), stored)


def _seed_shared_user() -> None:
    """Upsert the shared account from .env so APP_PASSWORD stays authoritative."""
    password_hash = _hash_password(APP_PASSWORD)
    now = _now_iso()
    conn = _connect()
    try:
        row = conn.execute(
            "SELECT id FROM users WHERE username = ?", (APP_USERNAME,)
        ).fetchone()
        if row:
            conn.execute(
                "UPDATE users SET password_hash = ?, is_active = 1 WHERE id = ?",
                (password_hash, row["id"]),
            )
        else:
            conn.execute(
                """
                INSERT INTO users (username, password_hash, created_at, is_active)
                VALUES (?, ?, ?, 1)
                """,
                (APP_USERNAME, password_hash, now),
            )
        conn.commit()
        logger.info("Shared account ready: username=%s", APP_USERNAME)
    finally:
        conn.close()


# ---------- auth ----------

class LoginBody(BaseModel):
    username: str
    password: str
    disclaimer_accepted: bool = False


class GalleryUpdateBody(BaseModel):
    uuid: str
    jsons: list[Any]


def _create_session(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=SESSION_DAYS)
    conn = _connect()
    try:
        conn.execute(
            """
            INSERT INTO sessions (token, user_id, created_at, expires_at)
            VALUES (?, ?, ?, ?)
            """,
            (token, user_id, now.isoformat(), expires.isoformat()),
        )
        conn.commit()
    finally:
        conn.close()
    return token


def _get_user_for_token(token: Optional[str]) -> Optional[dict]:
    if not token:
        return None
    now = datetime.now(timezone.utc).isoformat()
    conn = _connect()
    try:
        row = conn.execute(
            """
            SELECT u.id, u.username, s.expires_at
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token = ? AND u.is_active = 1
            """,
            (token,),
        ).fetchone()
        if not row:
            return None
        if row["expires_at"] < now:
            conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
            conn.commit()
            return None
        return {"id": row["id"], "username": row["username"]}
    finally:
        conn.close()


def _set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=SESSION_DAYS * 24 * 3600,
        path="/",
    )


def _clear_session_cookie(response: Response) -> None:
    response.delete_cookie(
        key=SESSION_COOKIE,
        path="/",
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
    )


async def require_user(request: Request) -> dict:
    """Dependency: require a valid session cookie."""
    token = request.cookies.get(SESSION_COOKIE)
    user = _get_user_for_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="未登录或会话已过期")
    return user


# ---------- image / order helpers ----------

def _safe_filename(filename: str) -> str:
    """Keep a readable basename while stripping path and unsafe characters."""
    name = Path(filename or "upload.jpg").name
    name = re.sub(r"[^\w.\-]+", "_", name, flags=re.UNICODE)
    return name or "upload.jpg"


def _store_image(filename: str, data: bytes) -> str:
    """Write the uploaded image under data/images/ and return its stored basename."""
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    safe = _safe_filename(filename)
    stem = Path(safe).stem
    suffix = Path(safe).suffix.lower() or ".jpg"
    stored = f"{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S')}_{uuid.uuid4().hex[:8]}_{stem}{suffix}"
    (IMAGES_DIR / stored).write_bytes(data)
    return stored


def _decode_body(body: str):
    """Return parsed JSON when the webhook body is JSON, otherwise the raw text."""
    try:
        return json.loads(body)
    except json.JSONDecodeError:
        return body


def _looks_like_order(obj: Any) -> bool:
    """True when the object has the DentalLabOrder shape used by the lab form."""
    if not isinstance(obj, dict):
        return False
    return any(
        key in obj
        for key in (
            "orderInfo",
            "shadeAndRequirements",
            "toothChartSection",
            "header",
            "workshopCheckArea",
        )
    )


def _looks_like_flat(obj: Any) -> bool:
    """True when the object is the flat n8n Chinese extraction payload."""
    if not isinstance(obj, dict):
        return False
    return any(
        key in obj
        for key in ("Order_ID", "Manufacturing_Specs", "Teeth_Arch", "Shade", "Due_Date")
    )


def _parse_specs_meta(specs: str) -> tuple[str, str]:
    """Pull 到货 / 条码 snippets embedded inside Manufacturing_Specs."""
    arrival = ""
    barcode = ""
    if not specs:
        return arrival, barcode
    m = re.search(r"到货\s*[：:]\s*([^；;\n]+)", specs)
    if m:
        arrival = m.group(1).strip()
    m = re.search(r"条码\s*[：:]\s*([^；;\n]+)", specs)
    if m:
        barcode = m.group(1).strip()
    return arrival, barcode


def _blankish(value: Any) -> bool:
    text = str(value or "").strip()
    return text == "" or text in ("未指定", "Unspecified", "None", "null")


def _flat_to_order(flat: dict) -> dict:
    """Map flat n8n Chinese fields into a DentalLabOrder for the lab form viewer."""
    specs = str(flat.get("Manufacturing_Specs") or "").strip()
    due = str(flat.get("Due_Date") or "").strip()
    arrival_from_specs, barcode = _parse_specs_meta(specs)
    arrival = due if not _blankish(due) else arrival_from_specs
    teeth = str(flat.get("Teeth_Arch") or "").strip()
    material = str(flat.get("Material") or "").strip()
    stage = str(flat.get("Stage") or "").strip()
    production = str(flat.get("Production") or "").strip()

    note_parts = []
    if not _blankish(teeth):
        note_parts.append(f"牙位：{teeth}")
    if not _blankish(material):
        note_parts.append(f"材料：{material}")
    if not _blankish(stage):
        note_parts.append(f"阶段：{stage}")
    if not _blankish(production):
        note_parts.append(f"生产：{production}")

    return {
        "header": {"formCode": "", "topRightBox": ""},
        "orderInfo": {
            "orderNo": str(flat.get("Order_ID") or "").strip(),
            "arrivalDate": arrival,
            "rescheduleDate": "",
        },
        "toothChartSection": {
            "quadrants": {
                "upperRight": "",
                "upperLeft": "",
                "lowerRight": "",
                "lowerLeft": teeth if not _blankish(teeth) else "",
            },
            "pCount": "",
            "mCount": "",
            "ponticDesign": {"saddleType": False, "unilateralType": False},
            "barcode": barcode,
        },
        "marginAndConnection": {
            "porcelainMargin": "",
            "metalOcclusal": "",
            "singleCrown": "",
            "connectedCrown": "",
        },
        "metalMarginAndSpace": {
            "metalMargin": {"none": False, "lingual": False, "lingualMm": ""},
            "insufficientSpace": {
                "metalOcclusal": False,
                "trimOpposing": False,
                "trimAbutment": False,
            },
        },
        "stainingAndWeight": {
            "staining": {"light": False, "medium": False},
            "openBiteMm": {"mm07": False, "mm05": False},
            "castingWeight": "",
            "milledMetalWeight": "",
        },
        "shadeAndRequirements": {
            "shade": str(flat.get("Shade") or "").strip(),
            "ceramicBlock": "",
            "toothShadeZones": {"incisal": "", "body": "", "cervical": ""},
            "pictureViewed": False,
            "orderRequirements": specs,
        },
        "retentionMethod": {"screwRetained": False, "cementRetained": False},
        "workshopCheckArea": {
            "handArticulation": False,
            "closeFittingRemovableDie": False,
            "sendModelTogether": False,
            "doctorArticulated": False,
            "doctorTrimmedMargin": False,
            "printReferenceModel": False,
            "trimAbutment": False,
            "trimAbutmentNote": "",
            "trimOpposing": False,
            "trimOpposingNote": "",
            "addPinkPorcelain": False,
            "addPinkPorcelainChart": {
                "upperRight": "",
                "upperLeft": "",
                "lowerRight": "",
                "lowerLeft": "",
            },
        },
        "modelAndReview": {
            "modelLine1": material if not _blankish(material) else "",
            "modelLine2": " / ".join(
                p for p in (stage if not _blankish(stage) else "", production if not _blankish(production) else "") if p
            ),
            "reviewAreaNotes": "；".join(note_parts),
            "transcribedBy": "",
            "reviewedBy": "",
        },
        "implantAccessories": {
            "abutmentAndScrew": "",
            "impressionCopingAndScrew": "",
            "analog": "",
            "gingivalMask": "",
            "other": "",
        },
        "attachments": {
            "upperJaw": False,
            "lowerJaw": False,
            "biteWax": False,
            "oldTeeth": False,
            "pictures": False,
            "articulator": False,
            "impressionTray": False,
            "metalPins": False,
        },
    }


def _extract_flat(parsed: Any) -> Optional[dict]:
    """Return the flat n8n Chinese payload when present."""
    body = parsed
    if isinstance(body, str):
        try:
            body = json.loads(body)
        except json.JSONDecodeError:
            return None
    if isinstance(body, list):
        if len(body) == 1 and isinstance(body[0], dict):
            body = body[0]
        else:
            for item in body:
                flat = _extract_flat(item)
                if flat:
                    return flat
            return None
    if not isinstance(body, dict):
        return None
    if _looks_like_flat(body):
        return body
    for key in ("json", "data", "result", "output", "body"):
        nested = body.get(key)
        if nested is not None:
            flat = _extract_flat(nested)
            if flat:
                return flat
    return None


def _unwrap_order(parsed: Any) -> Optional[dict]:
    """Extract a DentalLabOrder from nested lab JSON or flat n8n Chinese fields."""
    body = parsed
    if isinstance(body, str):
        try:
            body = json.loads(body)
        except json.JSONDecodeError:
            return None

    if isinstance(body, list):
        if len(body) == 1:
            body = body[0]
        else:
            for item in body:
                order = _unwrap_order(item)
                if order:
                    return order
            return None

    if not isinstance(body, dict):
        return None

    if _looks_like_order(body):
        return body

    if _looks_like_flat(body):
        return _flat_to_order(body)

    nested = body.get("json")
    if isinstance(nested, dict) and _looks_like_order(nested):
        return nested
    if isinstance(nested, dict) and _looks_like_flat(nested):
        return _flat_to_order(nested)

    for key in ("data", "result", "output", "body"):
        nested = body.get(key)
        if isinstance(nested, dict) and _looks_like_order(nested):
            return nested
        if isinstance(nested, dict) and _looks_like_flat(nested):
            return _flat_to_order(nested)
        if isinstance(nested, (list, dict, str)):
            order = _unwrap_order(nested)
            if order:
                return order

    return None


def _order_list_fields(order: Optional[dict], fallback: Any = None) -> tuple[str, str, str]:
    """Pull the columns shown in the processed list from a DentalLabOrder."""
    if order:
        order_info = order.get("orderInfo") or {}
        shade_info = order.get("shadeAndRequirements") or {}
        return (
            str(order_info.get("orderNo") or ""),
            str(order_info.get("arrivalDate") or ""),
            str(shade_info.get("shade") or ""),
        )
    if isinstance(fallback, dict):
        return (
            str(fallback.get("Order_ID") or fallback.get("orderNo") or ""),
            str(fallback.get("Due_Date") or fallback.get("arrivalDate") or ""),
            str(fallback.get("Shade") or fallback.get("shade") or ""),
        )
    return "", "", ""


def _duration_ms(started_at: Optional[str], finished_at: Optional[str]) -> Optional[int]:
    if not started_at or not finished_at:
        return None
    try:
        start = datetime.fromisoformat(started_at)
        end = datetime.fromisoformat(finished_at)
        return max(0, int((end - start).total_seconds() * 1000))
    except ValueError:
        return None


def _is_image(content_type: Optional[str], filename: Optional[str]) -> bool:
    """Check if the uploaded file is an image by content type or file extension."""
    if content_type and content_type.startswith("image/"):
        return True
    if filename and Path(filename).suffix.lower() in ALLOWED_EXTENSIONS:
        return True
    return False


# ---------- jobs ----------

def _create_job(user_id: int, image_name: str, image_path: str, job_uuid: str) -> int:
    now = _now_iso()
    conn = _connect()
    try:
        cur = conn.execute(
            """
            INSERT INTO jobs (user_id, image_name, image_path, status, created_at, uuid)
            VALUES (?, ?, ?, 'queued', ?, ?)
            """,
            (user_id, image_name, image_path, now, job_uuid),
        )
        conn.commit()
        return int(cur.lastrowid)
    finally:
        conn.close()


def _update_job(
    job_id: int,
    *,
    status: Optional[str] = None,
    started_at: Optional[str] = None,
    finished_at: Optional[str] = None,
    result_id: Optional[int] = None,
    error: Optional[str] = None,
) -> None:
    fields: list[str] = []
    values: list[Any] = []
    if status is not None:
        fields.append("status = ?")
        values.append(status)
    if started_at is not None:
        fields.append("started_at = ?")
        values.append(started_at)
    if finished_at is not None:
        fields.append("finished_at = ?")
        values.append(finished_at)
    if result_id is not None:
        fields.append("result_id = ?")
        values.append(result_id)
    if error is not None:
        fields.append("error = ?")
        values.append(error)
    if not fields:
        return
    values.append(job_id)
    conn = _connect()
    try:
        conn.execute(f"UPDATE jobs SET {', '.join(fields)} WHERE id = ?", values)
        conn.commit()
    finally:
        conn.close()


def _row_to_job(row: sqlite3.Row) -> dict:
    duration = _duration_ms(row["started_at"], row["finished_at"])
    image_path = row["image_path"]
    return {
        "id": row["id"],
        "uuid": row["uuid"] if "uuid" in row.keys() else None,
        "user_id": row["user_id"],
        "image_name": row["image_name"],
        "image_path": image_path,
        "image_url": f"/api/images/{image_path}" if image_path else None,
        "status": row["status"],
        "created_at": row["created_at"],
        "started_at": row["started_at"],
        "finished_at": row["finished_at"],
        "result_id": row["result_id"],
        "error": row["error"] or "",
        "duration_ms": duration,
    }


def _save_result(
    image_name: str,
    http_status: int,
    response_body: str,
    image_path: Optional[str] = None,
    user_id: Optional[int] = None,
    job_id: Optional[int] = None,
    duration_ms: Optional[int] = None,
) -> int:
    """Store one webhook response; return the new result id."""
    saved_at = _now_iso()
    parsed = _decode_body(response_body)
    order = _unwrap_order(parsed)
    order_no, arrival_date, shade = _order_list_fields(order, fallback=parsed)
    order_json = json.dumps(order, ensure_ascii=False) if order else None

    conn = _connect()
    try:
        cur = conn.execute(
            """
            INSERT INTO webhook_results (
                image_name, saved_at, http_status, response_body,
                image_path, order_no, arrival_date, shade, order_json,
                user_id, job_id, duration_ms
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                image_name,
                saved_at,
                http_status,
                response_body,
                image_path,
                order_no,
                arrival_date,
                shade,
                order_json,
                user_id,
                job_id,
                duration_ms,
            ),
        )
        conn.commit()
        return int(cur.lastrowid)
    finally:
        conn.close()


def _save_callback_payload(
    job_uuid: Optional[str],
    json_count: int,
    payload: Any,
    source_ip: Optional[str],
) -> int:
    """Store the raw JSON payload returned by the n8n webhook (no processing)."""
    conn = _connect()
    try:
        cursor = conn.execute(
            """
            INSERT INTO callback_payloads
                (uuid, json_count, payload_json, source_ip, saved_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                job_uuid,
                json_count,
                json.dumps(payload, ensure_ascii=False),
                source_ip,
                _now_iso(),
            ),
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


async def _send_to_webhook(
    filename: str,
    data: bytes,
    content_type: str,
    image_path: Optional[str] = None,
    user_id: Optional[int] = None,
    job_id: Optional[int] = None,
    job_uuid: Optional[str] = None,
) -> None:
    """POST one image to the webhook in the background, logging any errors."""
    started_at = _now_iso()
    if job_id is not None:
        _update_job(job_id, status="processing", started_at=started_at)

    if not WEBHOOK_URL or _http_client is None:
        logger.error("Cannot forward '%s': webhook URL or HTTP client unavailable", filename)
        finished_at = _now_iso()
        if job_id is not None:
            _update_job(
                job_id,
                status="failed",
                finished_at=finished_at,
                error="webhook URL or HTTP client unavailable",
            )
        return

    files = {"image": (filename, data, content_type)}
    params = None
    if job_uuid is not None:
        # Let n8n echo the image UUID back in the webhook callback so the
        # returned JSONs can be linked to this upload.
        params = {"uuid": job_uuid}
    try:
        response = await _http_client.post(WEBHOOK_URL, files=files, params=params)
        finished_at = _now_iso()
        duration = _duration_ms(started_at, finished_at)
        result_id = _save_result(
            filename,
            response.status_code,
            response.text,
            image_path=image_path,
            user_id=user_id,
            job_id=job_id,
            duration_ms=duration,
        )
        ok = 200 <= response.status_code < 300
        if job_id is not None:
            _update_job(
                job_id,
                status="done" if ok else "failed",
                finished_at=finished_at,
                result_id=result_id,
                error="" if ok else f"HTTP {response.status_code}",
            )
        if ok:
            logger.info("Successfully delivered '%s' to webhook (HTTP %d)", filename, response.status_code)
        else:
            logger.warning("Webhook returned error HTTP %d for '%s'", response.status_code, filename)
    except httpx.HTTPError as exc:
        finished_at = _now_iso()
        duration = _duration_ms(started_at, finished_at)
        err_name = type(exc).__name__
        result_id = _save_result(
            filename, 0, err_name, image_path=image_path,
            user_id=user_id, job_id=job_id, duration_ms=duration,
        )
        if job_id is not None:
            _update_job(
                job_id, status="failed", finished_at=finished_at,
                result_id=result_id, error=err_name,
            )
        logger.warning("Network error delivering '%s' to webhook: %s", filename, err_name)
    except Exception as exc:
        finished_at = _now_iso()
        duration = _duration_ms(started_at, finished_at)
        err_name = type(exc).__name__
        result_id = _save_result(
            filename, 0, err_name, image_path=image_path,
            user_id=user_id, job_id=job_id, duration_ms=duration,
        )
        if job_id is not None:
            _update_job(
                job_id, status="failed", finished_at=finished_at,
                result_id=result_id, error=err_name,
            )
        logger.error("Unexpected error delivering '%s' to webhook: %s", filename, err_name)


def _fire_to_webhook(
    filename: str,
    data: bytes,
    content_type: str,
    image_path: Optional[str] = None,
    user_id: Optional[int] = None,
    job_id: Optional[int] = None,
    job_uuid: Optional[str] = None,
) -> None:
    """Schedule a background webhook send without blocking the response."""
    task = asyncio.create_task(
        _send_to_webhook(
            filename, data, content_type,
            image_path=image_path, user_id=user_id, job_id=job_id, job_uuid=job_uuid,
        )
    )
    _pending_sends.add(task)
    task.add_done_callback(_pending_sends.discard)


def _no_cache_file(path: Path, media_type: str = "text/html; charset=utf-8") -> FileResponse:
    """Serve a static HTML file with headers that prevent stale browser caches."""
    return FileResponse(
        path,
        media_type=media_type,
        headers={
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    )


# ---------- routes ----------

@app.get("/")
def index() -> FileResponse:
    """Serve the single-page web UI."""
    dist_index = BASE_DIR / "static" / "dist" / "index.html"
    if not dist_index.is_file():
        raise HTTPException(
            status_code=503,
            detail="Frontend build not found. Run 'npm run build' inside frontend/.",
        )
    return _no_cache_file(dist_index)


@app.get("/api/gallery")
def gallery_data(user: dict = Depends(require_user)) -> dict:
    """All stored images (newest first) with their associated n8n JSONs."""
    conn = _connect()
    try:
        rows = conn.execute(
            """
            SELECT uuid, image_name, image_path, status, created_at, finished_at
            FROM jobs
            ORDER BY id DESC
            LIMIT 500
            """
        ).fetchall()
        payload_rows = conn.execute(
            """
            SELECT uuid, payload_json
            FROM callback_payloads
            ORDER BY id ASC
            """
        ).fetchall()
    finally:
        conn.close()

    # Group payloads by uuid. A single upload may receive more than one
    # callback (e.g. 2 JSONs per branch); concatenate in arrival order.
    by_uuid: dict[str, list] = {}
    for row in payload_rows:
        key = row["uuid"]
        if not key:
            continue
        try:
            payload = json.loads(row["payload_json"])
        except json.JSONDecodeError:
            continue
        jsons = payload.get("jsons") if isinstance(payload, dict) else payload
        if isinstance(jsons, list):
            by_uuid.setdefault(key, []).extend(jsons)

    items = []
    for row in rows:
        image_path = row["image_path"]
        jsons = by_uuid.get(row["uuid"], []) if row["uuid"] else []
        items.append({
            "uuid": row["uuid"] or "",
            "job_uuid": row["uuid"] or "",
            "image_name": row["image_name"],
            "image_url": f"/api/images/{image_path}" if image_path else None,
            "status": row["status"],
            "created_at": row["created_at"],
            "finished_at": row["finished_at"],
            "json_count": len(jsons),
            "jsons": jsons,
        })
    return {"items": items}


@app.post("/api/gallery/update")
def gallery_update(body: GalleryUpdateBody, user: dict = Depends(require_user)) -> dict:
    """Update persisted JSON(s) for a given job UUID."""
    if not body.uuid:
        raise HTTPException(status_code=400, detail="Missing uuid")
    if not isinstance(body.jsons, list):
        raise HTTPException(status_code=400, detail="jsons must be a list")

    conn = _connect()
    try:
        now = _now_iso()
        payload_data = {"uuid": body.uuid, "jsons": body.jsons}
        payload_str = json.dumps(payload_data, ensure_ascii=False)
        conn.execute("DELETE FROM callback_payloads WHERE uuid = ?", (body.uuid,))
        conn.execute(
            """
            INSERT INTO callback_payloads (uuid, json_count, payload_json, saved_at)
            VALUES (?, ?, ?, ?)
            """,
            (body.uuid, len(body.jsons), payload_str, now),
        )
        conn.commit()
        return {"ok": True, "count": len(body.jsons), "uuid": body.uuid}
    finally:
        conn.close()


@app.delete("/api/gallery/{item_uuid}")
def delete_gallery_item(item_uuid: str, user: dict = Depends(require_user)) -> dict:
    """Delete an uploaded image and its associated jobs, payloads, and results."""
    if not item_uuid:
        raise HTTPException(status_code=400, detail="Missing uuid")

    conn = _connect()
    try:
        jobs = conn.execute(
            "SELECT id, image_path FROM jobs WHERE uuid = ?", (item_uuid,)
        ).fetchall()

        # Delete image file from disk if present
        for job in jobs:
            image_path = job["image_path"]
            if image_path:
                file_path = IMAGES_DIR / image_path
                try:
                    if file_path.is_file():
                        file_path.unlink()
                except OSError as e:
                    logger.warning("Could not delete image file %s: %s", file_path, e)

        job_ids = [job["id"] for job in jobs]
        if job_ids:
            placeholders = ",".join("?" for _ in job_ids)
            conn.execute(f"DELETE FROM webhook_results WHERE job_id IN ({placeholders})", job_ids)

        conn.execute("DELETE FROM jobs WHERE uuid = ?", (item_uuid,))
        conn.execute("DELETE FROM callback_payloads WHERE uuid = ?", (item_uuid,))
        conn.commit()
        return {"ok": True, "uuid": item_uuid}
    finally:
        conn.close()


@app.get("/gallery")
def gallery_page(user: dict = Depends(require_user)) -> RedirectResponse:
    """Legacy route: the comparison editor now lives in the main SPA at /."""
    return RedirectResponse(url="/#gallery", status_code=302)


@app.get("/api/health")
def health() -> dict:
    """Basic health check and configuration status."""
    return {
        "status": "ok",
        "webhook_configured": bool(WEBHOOK_URL),
    }


@app.get("/api/config")
def app_config(user: dict = Depends(require_user)) -> dict:
    """Expose non-secret app settings to the UI (e.g. developer mode)."""
    return {"developer_mode": DEVELOPER_MODE}


@app.get("/api/me")
def me(request: Request) -> dict:
    """Return the current session user, or authenticated=false."""
    token = request.cookies.get(SESSION_COOKIE)
    user = _get_user_for_token(token)
    if not user:
        return {"authenticated": False}
    return {"authenticated": True, "id": user["id"], "username": user["username"]}


@app.post("/api/login")
def login(body: LoginBody, response: Response) -> dict:
    """Authenticate with the shared account after accepting the disclaimer."""
    if not body.disclaimer_accepted:
        raise HTTPException(status_code=400, detail="请先阅读并同意数据使用说明")
    username = (body.username or "").strip()
    password = body.password or ""
    conn = _connect()
    try:
        row = conn.execute(
            "SELECT id, username, password_hash, is_active FROM users WHERE username = ?",
            (username,),
        ).fetchone()
    finally:
        conn.close()
    if not row or not row["is_active"] or not _verify_password(password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    token = _create_session(row["id"])
    _set_session_cookie(response, token)
    return {"ok": True, "username": row["username"]}


@app.post("/api/logout")
def logout(request: Request, response: Response) -> dict:
    """End the current session."""
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        conn = _connect()
        try:
            conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
            conn.commit()
        finally:
            conn.close()
    _clear_session_cookie(response)
    return {"ok": True}


@app.get("/api/images/{stored_name}")
def get_image(stored_name: str, user: dict = Depends(require_user)) -> FileResponse:
    """Serve a previously uploaded source image by its stored basename."""
    if "/" in stored_name or "\\" in stored_name or stored_name.startswith("."):
        raise HTTPException(status_code=400, detail="Invalid image name")
    path = IMAGES_DIR / stored_name
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(path)


@app.get("/api/jobs")
def list_jobs(
    ids: Optional[str] = None,
    user: dict = Depends(require_user),
) -> list:
    """Return job status rows. Pass ?ids=1,2,3 to filter; otherwise recent jobs."""
    conn = _connect()
    try:
        if ids:
            id_list: list[int] = []
            for part in ids.split(","):
                part = part.strip()
                if part.isdigit():
                    id_list.append(int(part))
            if not id_list:
                return []
            placeholders = ",".join("?" for _ in id_list)
            rows = conn.execute(
                f"""
                SELECT id, user_id, image_name, image_path, status,
                       created_at, started_at, finished_at, result_id, error
                FROM jobs
                WHERE id IN ({placeholders})
                ORDER BY id ASC
                """,
                id_list,
            ).fetchall()
        else:
            rows = conn.execute(
                """
                SELECT id, user_id, image_name, image_path, status,
                       created_at, started_at, finished_at, result_id, error
                FROM jobs
                ORDER BY id DESC
                LIMIT 100
                """
            ).fetchall()
        return [_row_to_job(row) for row in rows]
    finally:
        conn.close()


@app.post("/api/webhook/callback")
async def webhook_callback(request: Request) -> dict:
    """Receive the JSON payload(s) returned by the n8n pipeline.

    The n8n workflow POSTs {uuid, jsons: [...]} where uuid is the image
    UUID assigned at upload time and jsons holds the 2 or 4 extracted JSON
    objects (each on a different schema; no Fixed/Removable classification).
    Per the current task split this endpoint only persists the raw payload
    to the callback_payloads table and does not process the JSON.
    """
    try:
        payload = await request.json()
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    # The n8n workflow echoes only the image UUID plus the JSONs (2 or 4 of
    # them, each on a different schema). Also accept a bare array with the
    # uuid in the query string.
    job_uuid: Optional[str] = None
    if isinstance(payload, dict):
        if isinstance(payload.get("uuid"), str) and payload["uuid"]:
            job_uuid = payload["uuid"]
        jsons = payload.get("jsons")
    else:
        job_uuid = request.query_params.get("uuid") or None
        jsons = payload

    if not isinstance(jsons, list) or not 1 <= len(jsons) <= 10:
        raise HTTPException(
            status_code=400,
            detail="Expected a JSON array of 1-10 objects (typically 2 or 4)",
        )

    source_ip = request.client.host if request.client else None
    result_id = _save_callback_payload(job_uuid, len(jsons), payload, source_ip)
    logger.info(
        "Saved n8n callback payload #%d (%d JSONs, uuid=%s)",
        result_id, len(jsons), job_uuid,
    )
    return {"ok": True, "id": result_id, "count": len(jsons), "uuid": job_uuid}


@app.post("/api/upload")
async def upload(
    file: UploadFile = File(...),
    user: dict = Depends(require_user),
) -> dict:
    """Accept one image, create a job, and hand it to the webhook without waiting."""
    if not WEBHOOK_URL:
        raise HTTPException(status_code=500, detail="N8N_WEBHOOK_URL is not configured in .env")

    filename = file.filename or "upload.jpg"
    content_type = file.content_type or "application/octet-stream"

    if not _is_image(file.content_type, file.filename):
        raise HTTPException(status_code=415, detail="Unsupported media type: only images are allowed")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image too large (max 20 MB)")

    image_path = _store_image(filename, data)
    job_uuid = str(uuid.uuid4())
    job_id = _create_job(user["id"], filename, image_path, job_uuid)
    _fire_to_webhook(
        filename, data, content_type,
        image_path=image_path, user_id=user["id"], job_id=job_id, job_uuid=job_uuid,
    )
    return {
        "ok": True,
        "filename": filename,
        "image_path": image_path,
        "job_id": job_id,
        "uuid": job_uuid,
    }
