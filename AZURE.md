# Azure deployment & update runbook (Image2Webhook)

Instructions for a human or coding agent to keep the **live** platform updated.
Do **not** rely on local `az login` on unmanaged Linux — HKPC Conditional Access blocks Azure CLI there. Use **Azure Cloud Shell** (portal) instead.

---

## Live environment (production)

| Item | Value |
|------|--------|
| Client URL | https://i2w-app-6291a5.azurewebsites.net |
| Health check | https://i2w-app-6291a5.azurewebsites.net/api/health |
| Resource group | `rg-image2webhook` |
| Region | `eastasia` |
| App Service plan | `plan-image2webhook` (Linux, **B1**, **1 instance**) |
| Web App name | `i2w-app-6291a5` |
| Container registry | `i2w6291a5` |
| Current image tag (first deploy) | `image2webhook:v1` |
| Data on disk | `DATA_DIR=/home/image2webhook` (`results.db` + `images/`) |
| Login user | from App Setting `APP_USERNAME` (seeded from `.env`; was `admin` at first deploy) |

Outbound IPs (for n8n IP allowlists; may change if the app is recreated):

```text
20.187.252.161,20.239.14.97,20.24.113.8,20.255.118.167,20.255.43.1,20.239.28.211,52.139.156.0,52.139.157.114,52.139.157.140,52.139.159.196,52.139.159.252,52.184.90.49,20.189.104.97
```

Verify after any change:

```bash
curl -s https://i2w-app-6291a5.azurewebsites.net/api/health
# expect: {"status":"ok","webhook_configured":true}
```

---

## Hard constraints (do not violate)

1. **Single instance only** — SQLite, uploaded images, and in-process webhook tasks are local to one container. Never enable autoscale or raise instance count.
2. **Single Uvicorn worker** — see `Dockerfile` (`--workers 1`).
3. **Secrets stay out of the image** — set via App Service Application Settings / Cloud Shell `export`, never bake `.env` into the image or commit it.
4. **Persistent storage** — keep `WEBSITES_ENABLE_APP_SERVICE_STORAGE=true` and `DATA_DIR=/home/image2webhook`. Deleting the Web App wipes `/home`.
5. **Local Azure CLI** on the developer Linux box is blocked by org Conditional Access (`AADSTS53003`). Prefer Cloud Shell for all `az` commands.

---

## Repo files involved

| Path | Role |
|------|------|
| `Dockerfile` | Production image (Python 3.12, one Uvicorn on `:8000`) |
| `.dockerignore` | Excludes `.env`, `data/`, `.venv`, etc. |
| `app.py` | Honors `DATA_DIR`, `COOKIE_SECURE`, `N8N_WEBHOOK_URL`, login env vars |
| `.github/workflows/deploy-azure.yml` | **CI** — on push to `main`, ACR build + point Web App + restart (see [GitHub Actions](#github-actions-cicd)) |
| `scripts/print-azure-exports.sh` | **Local** — prints `export` lines from `.env` to paste into Cloud Shell |
| `scripts/azure-cloud-shell-deploy.sh` | **First-time** create + deploy (new RG/ACR/app). Do **not** re-run blindly against prod (it may create a *new* suffix). Prefer the update commands below for the existing app. |
| `image2webhook-azure-upload.tgz` | Optional small upload pack for Cloud Shell (regenerate after code changes) |

Required App Settings on the Web App:

- `N8N_WEBHOOK_URL`
- `APP_USERNAME` / `APP_PASSWORD` / `APP_SECRET`
- `DATA_DIR=/home/image2webhook`
- `COOKIE_SECURE=true`
- `WEBSITES_PORT=8000`
- `WEBSITES_ENABLE_APP_SERVICE_STORAGE=true`
- `WEBSITES_CONTAINER_START_TIME_LIMIT=600`


---

## Agent checklist before updating

1. Read this file and confirm target is **`i2w-app-6291a5`** / **`rg-image2webhook`** / **`i2w6291a5`**.
2. Identify change type: **code/image** vs **app settings only** vs **both**.
3. For **code/image**: prefer push to `main` (GitHub Actions) once secrets exist; otherwise prepare Cloud Shell [Update A](#update-a--application-code-ui--fastapi--dockerfile). Settings-only still needs Cloud Shell / Portal.
4. Never print or commit `.env` secrets into chat logs or git.
5. After deploy: health URL must return `webhook_configured: true` if n8n should work.
6. Remind: keep **1 instance**.

---

## GitHub Actions (CI/CD)

After one-time Azure + GitHub secret setup, routine **code** updates are: commit → `git push` to `main` → Actions builds in ACR → Web App pulls the new tag → restart. App Settings (`N8N_WEBHOOK_URL`, passwords, `DATA_DIR`, storage flag) stay in Azure; the workflow never writes them.

Cloud Shell [Update A](#update-a--application-code-ui--fastapi--dockerfile) remains the fallback if Actions auth breaks.

### Day-to-day

1. Change code locally (files that trigger the workflow: `Dockerfile`, `.dockerignore`, `requirements.txt`, `app.py`, `static/**`, or the workflow itself).
2. Commit and push to `main` on `https://github.com/SunGamePlay/Image2Webhook`.
3. Watch **Actions** → **Deploy Azure**.
4. Confirm health: `curl -s https://i2w-app-6291a5.azurewebsites.net/api/health`

Image tags are `image2webhook:sha-<7-char-commit>`. The first Actions run fails until the secrets below exist.

### One-time setup (Cloud Shell or Portal)

Local `az` on unmanaged Linux is blocked by HKPC Conditional Access — use **Azure Cloud Shell**. If app-registration create is admin-locked, use Portal → Microsoft Entra ID → App registrations (same values).

```bash
# GitHub repo for federated credential subject
GH_REPO=SunGamePlay/Image2Webhook
RG=rg-image2webhook
APP_NAME=sp-image2webhook-gha

# 1) App registration + service principal
APP_ID=$(az ad app create --display-name "$APP_NAME" --query appId -o tsv)
az ad sp create --id "$APP_ID" >/dev/null

# 2) Federated credential for GitHub Actions on main
OBJECT_ID=$(az ad app show --id "$APP_ID" --query id -o tsv)
az ad app federated-credential create --id "$OBJECT_ID" --parameters "{
  \"name\": \"github-main\",
  \"issuer\": \"https://token.actions.githubusercontent.com\",
  \"subject\": \"repo:${GH_REPO}:ref:refs/heads/main\",
  \"audiences\": [\"api://AzureADTokenExchange\"]
}"

# 3) Contributor on the resource group only (not subscription-wide)
SUB_ID=$(az account show --query id -o tsv)
TENANT_ID=$(az account show --query tenantId -o tsv)
az role assignment create \
  --assignee "$APP_ID" \
  --role Contributor \
  --scope "/subscriptions/${SUB_ID}/resourceGroups/${RG}"

echo
echo "Add these as GitHub repo Secrets (Settings → Secrets and variables → Actions):"
echo "  AZURE_CLIENT_ID       = $APP_ID"
echo "  AZURE_TENANT_ID       = $TENANT_ID"
echo "  AZURE_SUBSCRIPTION_ID = $SUB_ID"
```

GitHub secrets are **IDs only** (OIDC). Do **not** create or store a client secret for this flow.

Order: create secrets first, then push the commit that adds/updates `.github/workflows/deploy-azure.yml` so the first run can log in.

### Rollback via ACR tags

Same as [Rollback](#rollback), using a previous `image2webhook:sha-…` (or older `v1` / `v2`) tag:

```bash
az acr repository show-tags -n i2w6291a5 --repository image2webhook -o table
```

---

## Update A — application code (UI / FastAPI / Dockerfile)

Use when `app.py`, `static/`, `requirements.txt`, or `Dockerfile` change — **or** use [GitHub Actions](#github-actions-cicd) instead of Cloud Shell.

### A1. Local: rebuild upload package (recommended)

From the project root:

```bash
tar -czf image2webhook-azure-upload.tgz \
  --exclude='.git' --exclude='.venv' --exclude='data' --exclude='.env' \
  --exclude='.cursor' --exclude='__pycache__' \
  --exclude='Diversify_Document_test_dataset' --exclude='*.xlsx' \
  --exclude='image2webhook-azure-upload.tgz' \
  Dockerfile .dockerignore requirements.txt app.py static \
  scripts/azure-cloud-shell-deploy.sh scripts/print-azure-exports.sh AZURE.md

./scripts/print-azure-exports.sh   # only if settings also need refresh; else skip
```

### A2. Cloud Shell: upload, build, point Web App at new tag

User uploads `image2webhook-azure-upload.tgz` into Cloud Shell, then:

```bash
cd ~
mkdir -p image2webhook && cd image2webhook
tar -xzf ~/image2webhook-azure-upload.tgz   # or ~/clouddrive/... if uploaded there

RG=rg-image2webhook
ACR=i2w6291a5
APP=i2w-app-6291a5
# bump tag every release
IMAGE=image2webhook:v2

ACR_LOGIN=$(az acr show -n "$ACR" --query loginServer -o tsv)

az acr build --registry "$ACR" --image "$IMAGE" .

az webapp config container set \
  --resource-group "$RG" \
  --name "$APP" \
  --docker-custom-image-name "$ACR_LOGIN/$IMAGE"

az webapp restart --resource-group "$RG" --name "$APP"

curl -s "https://$APP.azurewebsites.net/api/health"
```

After a successful release, update the “Current image tag” row in this file’s live table (`v2`, `v3`, …).

**Data note:** `/home/image2webhook` (DB + images) survives image swap and restart. It does **not** survive deleting the Web App.

---

## Update B — settings only (webhook URL, password, etc.)

No image rebuild. In Cloud Shell:

```bash
RG=rg-image2webhook
APP=i2w-app-6291a5

# Example: rotate password and webhook (paste real values in Cloud Shell only)
az webapp config appsettings set \
  --resource-group "$RG" \
  --name "$APP" \
  --settings \
    N8N_WEBHOOK_URL="https://..." \
    APP_PASSWORD="..."

az webapp restart --resource-group "$RG" --name "$APP"
```

`APP_PASSWORD` / `APP_USERNAME` are re-seeded into SQLite on startup — restart is required after changing them.

To inspect current setting **names** (values are sensitive):

```bash
az webapp config appsettings list -g rg-image2webhook -n i2w-app-6291a5 -o table
```

---

## Update C — first-time deploy (new environment only)

Only when creating a **new** RG/app (not for routine updates of `i2w-app-6291a5`):

1. Local: `./scripts/print-azure-exports.sh` → paste exports into Cloud Shell.
2. Upload package → `bash scripts/azure-cloud-shell-deploy.sh`
3. Script prints a new `APP` / `ACR` / URL — record them in a new section of this file (or replace the live table if intentionally replacing prod).

---

## Backup before risky changes

```bash
# Cloud Shell / Kudu SSH into the app, then copy off-box:
# /home/image2webhook/results.db
# /home/image2webhook/images/
az webapp ssh --resource-group rg-image2webhook --name i2w-app-6291a5
```

Or use Portal → Web App → **SSH** / **Advanced Tools (Kudu)** → download those paths.

---

## Rollback

Point the Web App back at a previous ACR tag, then restart:

```bash
RG=rg-image2webhook
ACR=i2w6291a5
APP=i2w-app-6291a5
ACR_LOGIN=$(az acr show -n "$ACR" --query loginServer -o tsv)

az webapp config container set \
  --resource-group "$RG" \
  --name "$APP" \
  --docker-custom-image-name "$ACR_LOGIN/image2webhook:v1"

az webapp restart --resource-group "$RG" --name "$APP"
```

List tags: `az acr repository show-tags -n i2w6291a5 --repository image2webhook -o table`

---

## What the agent should tell the user after an update

- New health-check result
- Client URL (unchanged unless app renamed)
- New image tag used
- Whether app settings were changed (not the secret values)
- Reminder that uploaded images/DB were preserved (or not, if Web App was recreated)

---

## Related docs

- Product / local run: [README.md](README.md)
- Env template: [.env.example](.env.example)
