<div align="middle">

# Image2Webhook · Dental Lab Order Recognition

<a href="README.md"><img src="https://img.shields.io/badge/English-1a1a2e?style=for-the-badge"></a>
<a href="README-tc.md"><img src="https://img.shields.io/badge/繁體中文-1a1a2e?style=for-the-badge"></a>
<a href="README-sc.md"><img src="https://img.shields.io/badge/简体中文-1a1a2e?style=for-the-badge"></a>

<img src="https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python 3.9+" />
<a href="https://n8n.io/"><img src="https://img.shields.io/badge/n8n-Integration-EA4B71?style=flat-square&logo=n8n&logoColor=white" alt="n8n" /></a>
<img src="https://img.shields.io/badge/ASGI-Uvicorn-2C5BB4?style=flat-square&logo=gunicorn&logoColor=white" alt="Uvicorn" />
<a href="https://github.com/astral-sh/uv"><img src="https://img.shields.io/badge/Packager-uv-DE5FE9?style=flat-square&logo=astral&logoColor=white" alt="uv" /></a>

Upload dental lab order images in bulk, forward them to n8n for recognition and English-to-Chinese translation, and verify the Chinese results in the browser.

</div>

---

## Overview

| Page | Description |
|------|-------------|
| **Login** | Shared-account login; requires accepting the data-use disclaimer (R&D use only, do not upload sensitive data) |
| **Upload Images** | Drag-and-drop multiple images; processing progress bar and per-image timing; R&D disclaimer banner at the top |
| **Comparison Editor** | Side-by-side image and dental lab form editor; image viewer with zoom/pan/rotate, dynamic form templates, and live JSON drawer |

After uploading, each image is sent to n8n in the background; the browser polls job status, so it doesn't have to wait for the webhook to finish before returning.

Recognition results support two JSON shapes:

- **Flat n8n output**: `Order_ID`, `Due_Date`, `Shade`, `Teeth_Arch`, `Material`, `Stage`, `Production`, `Manufacturing_Specs`, etc.
- **Nested lab order structure**: `DentalLabOrder` (used to populate the Chinese lab order form)

Flat results are automatically mapped to the form preview and to the Chinese columns of the summary table / Excel.

---

## Requirements

- Python 3.9+
- [uv](https://github.com/astral-sh/uv) (recommended) or pip
- A configured n8n webhook (receives images and returns extracted Chinese JSON)

---

## Installation

```bash
git clone https://github.com/SunGamePlay/Image2Webhook.git
cd Image2Webhook
python3 -m venv .venv
source .venv/bin/activate
uv sync
cp .env.example .env
```

Edit `.env`:

```env
# Required: n8n webhook
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id

# Shared login (written to the users table at startup; password changes take effect after restart)
APP_USERNAME=admin
APP_PASSWORD=changeme
APP_SECRET=replace-with-a-long-random-string

# Optional (see the Azure deployment section below): DATA_DIR, COOKIE_SECURE
```

Optional: Qdrant / Azure OpenAI related variables are used by the terminology library (see `.env.example`); they are not required by the main web flow.

**Please change the default password before production use.**

---

## Running

```bash
# Recommended (when the venv is activated)
.venv/bin/uvicorn app:app --reload --host 127.0.0.1 --port 8000

# Or
uv run uvicorn app:app --reload --port 8000
```

Open in your browser: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

Health check (no login required):

```bash
curl -s http://127.0.0.1:8000/api/health
```

---

## Usage Flow

1. Log in and accept the **data-use disclaimer**
2. Drag lab order images into **Upload Images** and send
3. Watch the batch completion count and per-image timing in the progress area; when done, click **Go to Review**
4. In **Comparison Editor**, inspect and edit the results alongside the source images
5. In **Settings**, hide pages or review panels as needed (settings are stored server-side and apply to all logged-in sessions)

---

## Main API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check (public) |
| `POST` | `/api/login` | Login (requires `disclaimer_accepted: true`) |
| `POST` | `/api/logout` | Logout |
| `GET` | `/api/me` | Current session |
| `POST` | `/api/upload` | Upload a single image, returns `job_id` |
| `GET` | `/api/jobs?ids=` | Job status and timing |
| `GET` | `/api/results` | Saved recognition results |
| `GET` | `/api/results/export` | Download Excel |
| `GET` / `PUT` | `/api/settings` | Display settings |
| `GET` | `/api/images/{name}` | Uploaded source image |
| `GET` | `/form` | Chinese lab order form page (embedded in the review page) |

Except for `/`, `/api/health`, and login-related endpoints, all business APIs require a login Cookie.

---

## Data & Directories

| Path | Description |
|------|-------------|
| `data/results.db` | SQLite: users, sessions, jobs, results (root directory overridable via `DATA_DIR`) |
| `data/images/` | Uploaded source images |
| `frontend/` | Modular React.js frontend (Vite + TypeScript + Zustand + Tailwind) |

---

## Tech Stack

- **Backend**: FastAPI + Uvicorn + SQLite + httpx

---

## Azure Deployment (Public Access)

**Live environment and future updates (complete handbook for maintainers / agents): see [AZURE.md](AZURE.md).**

Publish this app as a **single** Linux container on Azure App Service. Clients access it via the public HTTPS URL; Uvicorn inside the container still calls the externally reachable `N8N_WEBHOOK_URL`.

**Hard constraint: run 1 instance and 1 Uvicorn worker.** SQLite, uploaded images, and background webhook jobs are all bound to the local process/disk; enabling autoscaling or multiple replicas will split data and sessions.

Default recommended region: `eastasia` (Hong Kong). The global Azure hostname is `*.azurewebsites.net`; if you use Azure China (21Vianet), the CLI cloud is `AzureChinaCloud` and the hostname is `*.chinacloudsites.cn`.

**Routine releases (recommended):** After the one-time OIDC / Secrets setup in [AZURE.md — GitHub Actions](AZURE.md#github-actions-cicd), just `git push` to `main` and Actions will build in ACR and update the live Web App. App Settings are still maintained in Azure only. The Cloud Shell flow is kept for the first deployment and rollbacks.

### Prerequisites

- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) logged in (`az login`), **or** use **Azure Cloud Shell** in the portal (recommended when your machine is blocked by Conditional Access)
- `Dockerfile` at the repository root (already provided in this repo)
- The n8n webhook must be reachable from the App Service **outbound** (browsers never connect to n8n directly)

### Cloud Shell Quick Release (first time / fallback)

1. Generate the keys to paste on your local machine (do not commit `.env`):

```bash
./scripts/print-azure-exports.sh
```

2. Upload `image2webhook-azure-upload.tgz` (or a source archive containing the `Dockerfile`) to Cloud Shell, extract it, and enter the directory.
3. In Cloud Shell, paste the `export …` lines from step 1, then run:

```bash
bash scripts/azure-cloud-shell-deploy.sh
```

The script creates the resource group, ACR, B1 plan, and single-instance Web App, builds the image, and prints the public URL. Always keep **1 instance**.

### One-shot Resource Creation and First Release

Replace the placeholders below with your values, then run:

```bash
# Variables (adjust as needed)
RG=rg-image2webhook
LOC=eastasia
ACR=acrimage2webhook   # Globally unique; lowercase letters and digits only
PLAN=plan-image2webhook
APP=app-image2webhook  # Globally unique; URL = https://$APP.azurewebsites.net
IMAGE=image2webhook:v1

az group create --name "$RG" --location "$LOC"

az acr create --resource-group "$RG" --name "$ACR" --sku Basic --admin-enabled true

# Build the image on the Azure side (no local Docker required)
az acr build --registry "$ACR" --image "$IMAGE" .

az appservice plan create \
  --name "$PLAN" \
  --resource-group "$RG" \
  --location "$LOC" \
  --is-linux \
  --sku B1

ACR_LOGIN=$(az acr show -n "$ACR" --query loginServer -o tsv)
ACR_USER=$(az acr credential show -n "$ACR" --query username -o tsv)
ACR_PASS=$(az acr credential show -n "$ACR" --query "passwords[0].value" -o tsv)

az webapp create \
  --resource-group "$RG" \
  --plan "$PLAN" \
  --name "$APP" \
  --deployment-container-image-name "$ACR_LOGIN/$IMAGE"

az webapp config container set \
  --resource-group "$RG" \
  --name "$APP" \
  --docker-custom-image-name "$ACR_LOGIN/$IMAGE" \
  --docker-registry-server-url "https://$ACR_LOGIN" \
  --docker-registry-server-user "$ACR_USER" \
  --docker-registry-server-password "$ACR_PASS"

# Required app settings (never bake secrets into the image)
az webapp config appsettings set \
  --resource-group "$RG" \
  --name "$APP" \
  --settings \
    N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook/your-webhook-id" \
    APP_USERNAME="admin" \
    APP_PASSWORD="replace-with-a-strong-password" \
    APP_SECRET="$(openssl rand -hex 32)" \
    DATA_DIR="/home/image2webhook" \
    COOKIE_SECURE="true" \
    WEBSITES_PORT="8000" \
    WEBSITES_ENABLE_APP_SERVICE_STORAGE="true" \
    WEBSITES_CONTAINER_START_TIME_LIMIT="600"

az webapp update --resource-group "$RG" --name "$APP" --https-only true
az webapp config set \
  --resource-group "$RG" \
  --name "$APP" \
  --always-on true \
  --generic-configurations '{"healthCheckPath":"/api/health"}'

az webapp restart --resource-group "$RG" --name "$APP"
```

### Verification and Client Access

```bash
curl -s "https://$APP.azurewebsites.net/api/health"
# Expected: {"status":"ok","webhook_configured":true}
```

Share this URL (or a custom domain) with clients; they log in with the shared account from App Settings and accept the data-use disclaimer.

If n8n whitelists callers by IP, add this Web App's outbound IPs to the whitelist:

```bash
az webapp show --resource-group "$RG" --name "$APP" --query outboundIpAddresses -o tsv
```

Outbound IPs may change after scaling or recreating the app; consider a NAT Gateway if you need fixed IPs.

### Updating the Image

```bash
az acr build --registry "$ACR" --image image2webhook:v2 .
az webapp config container set \
  --resource-group "$RG" \
  --name "$APP" \
  --docker-custom-image-name "$ACR_LOGIN/image2webhook:v2"
az webapp restart --resource-group "$RG" --name "$APP"
```

The SQLite database and images under `DATA_DIR=/home/image2webhook` survive restarts and image swaps (as long as the app is not deleted and `WEBSITES_ENABLE_APP_SERVICE_STORAGE=true`). Deleting the Web App wipes `/home`; back up `results.db` and `images/` via Kudu / `az webapp ssh` before major changes.

### Optional: Custom Domain

Bind a custom domain to the Web App in the portal and enable an **App Service managed certificate** (free HTTPS). Once bound, point clients at that domain.

---

## Disclaimer & Security Notes

This system is for **R&D use only**. Do not upload patient privacy information or other sensitive data. Uploaded content and recognition results must not be used for clinical care, production release, or any other official business.