<div align="middle">

# Image2Webhook · 技工單識別

<a href="README.md"><img src="https://img.shields.io/badge/English-1a1a2e?style=for-the-badge"></a>
<a href="README-tc.md"><img src="https://img.shields.io/badge/繁體中文-1a1a2e?style=for-the-badge"></a>
<a href="README-sc.md"><img src="https://img.shields.io/badge/简体中文-1a1a2e?style=for-the-badge"></a>

<img src="https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python 3.9+" />
<a href="https://n8n.io/"><img src="https://img.shields.io/badge/n8n-Integration-EA4B71?style=flat-square&logo=n8n&logoColor=white" alt="n8n" /></a>
<img src="https://img.shields.io/badge/ASGI-Uvicorn-2C5BB4?style=flat-square&logo=gunicorn&logoColor=white" alt="Uvicorn" />
<a href="https://github.com/astral-sh/uv"><img src="https://img.shields.io/badge/Packager-uv-DE5FE9?style=flat-square&logo=astral&logoColor=white" alt="uv" /></a>

批量上傳技工單圖片，轉發到 n8n 識別與英譯中，並在網頁中核對中文結果。

</div>

---

## 功能概覽

| 頁面 | 說明 |
|------|------|
| **登入** | 共享帳號登入；須勾選數據使用說明（研發用途、請勿上傳敏感資料） |
| **上傳圖片** | 多圖拖放上傳；處理進度條與每張耗時；頂部研發免責提示 |
| **比對編輯器** | 圖片與技工單左右分欄比对編輯器；支援縮放/旋轉原圖、多種表單範本切換與即時 JSON 編輯 |

上傳後每張圖在背景發往 n8n；瀏覽器透過任務輪詢查看狀態，無需等待 webhook 完成再返回。

識別結果支援兩種 JSON：

- **扁平 n8n 輸出**：`Order_ID`、`Due_Date`、`Shade`、`Teeth_Arch`、`Material`、`Stage`、`Production`、`Manufacturing_Specs` 等
- **巢狀技工單結構**：`DentalLabOrder`（用於填充中文技工單表單）

扁平結果會自動映射到表單預覽與總表 / Excel 的中文欄。

---

## 環境要求

- Python 3.9+
- [uv](https://github.com/astral-sh/uv)（推薦）或 pip
- 已設定的 n8n webhook（接收圖片並返回中文提取 JSON）

---

## 安裝

```bash
git clone https://github.com/SunGamePlay/Image2Webhook.git
cd Image2Webhook
python3 -m venv .venv
source .venv/bin/activate
uv sync
cp .env.example .env
```

編輯 `.env`：

```env
# 必填：n8n webhook
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id

# 共享登入（啟動時寫入 users 表；修改密碼後重啟即生效）
APP_USERNAME=admin
APP_PASSWORD=changeme
APP_SECRET=replace-with-a-long-random-string

# 可選（Azure 部署見下文）：DATA_DIR、COOKIE_SECURE
```

可選：Qdrant / Azure OpenAI 相關變數用於術語庫（見 `.env.example`），網頁主流程不強制依賴。

**請在正式使用前修改預設密碼。**

---

## 執行

```bash
# 推薦（已啟用 venv 時）
.venv/bin/uvicorn app:app --reload --host 127.0.0.1 --port 8000

# 或
uv run uvicorn app:app --reload --port 8000
```

瀏覽器開啟： [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

健康檢查（無需登入）：

```bash
curl -s http://127.0.0.1:8000/api/health
```

---

## 使用流程

1. 登入並勾選 **數據使用說明**
2. 在 **上傳圖片** 中拖入技工單圖片並送出
3. 在進度區查看批次完成數與每張耗時；完成後可 **去核對**
4. 在 **比對編輯器** 對照原圖檢查與編輯識別結果
5. 在 **設定** 中按需要隱藏頁面或核對面板（設定儲存在伺服器端，對所有登入 session 生效）

---

## 主要 API

| 方法 | 路徑 | 說明 |
|------|------|------|
| `GET` | `/api/health` | 健康檢查（公開） |
| `POST` | `/api/login` | 登入（需 `disclaimer_accepted: true`） |
| `POST` | `/api/logout` | 登出 |
| `GET` | `/api/me` | 目前 session |
| `POST` | `/api/upload` | 上傳單張圖片，返回 `job_id` |
| `GET` | `/api/jobs?ids=` | 任務狀態與耗時 |
| `GET` | `/api/results` | 已儲存識別結果 |
| `GET` | `/api/results/export` | 下載 Excel |
| `GET` / `PUT` | `/api/settings` | 顯示設定 |
| `GET` | `/api/images/{name}` | 已上傳原圖 |
| `GET` | `/form` | 中文技工單表單頁（嵌入核對頁） |

除 `/`、`/api/health`、登入相關外，業務介麵需登入 Cookie。

---

## 數據與目錄

| 路徑 | 說明 |
|------|------|
| `data/results.db` | SQLite：使用者、session、任務、結果（可用 `DATA_DIR` 覆寫根目錄） |
| `data/images/` | 上傳原圖 |
| `frontend/` | 模組化 React.js 前端 (Vite + TypeScript + Zustand + Tailwind) |

---

## 技術堆疊

- **後端**：FastAPI + Uvicorn + SQLite + httpx
- **前端**：原生 HTML / CSS / JS（無建置步驟）
- **整合**：n8n webhook；可選 Qdrant + Azure OpenAI 術語庫

---

## Azure 部署（公網存取）

**線上環境與後續更新（給維護者 / Agent 的完整手冊）：見 [AZURE.md](AZURE.md)。**

將本應用以 **單一** Linux 容器發佈到 Azure App Service。客戶端透過 HTTPS 公網 URL 存取；容器內 Uvicorn 仍呼叫外網可達的 `N8N_WEBHOOK_URL`。

**硬性約束：只跑 1 個 instance、1 個 Uvicorn worker。** SQLite、上傳圖片與背景 webhook 任務都綁在本機 process/磁碟上，開啟自動擴縮容或多副本會拆分數據與 session。

預設區域建議：`eastasia`（香港）。全域 Azure 主機名為 `*.azurewebsites.net`；若使用 Azure 中國（21Vianet），CLI cloud 為 `AzureChinaCloud`，主機名為 `*.chinacloudsites.cn`。

**日常發版（推薦）：** 完成 [AZURE.md — GitHub Actions](AZURE.md#github-actions-cicd) 中的一次性 OIDC / Secrets 後，向 `main` `git push` 即可由 Actions 在 ACR 建置並更新線上 Web App。App Settings 仍只在 Azure 中維護。Cloud Shell 流程保留作首次部署與回退。

### 前置條件

- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) 已登入（`az login`），**或**使用門戶中的 **Azure Cloud Shell**（本機被 Conditional Access 攔截時推薦）
- 儲存庫根目錄含 `Dockerfile`（本倉庫已提供）
- n8n webhook 對 App Service **出站**可達（瀏覽器不會直連 n8n）

### Cloud Shell 快速發佈（首次 / 回退）

1. 本機產生要貼上的金鑰（不要提交 `.env`）：

```bash
./scripts/print-azure-exports.sh
```

2. 將 `image2webhook-azure-upload.tgz`（或含 `Dockerfile` 的原始碼包）上傳到 Cloud Shell，解壓後進入目錄。
3. 在 Cloud Shell 貼上第 1 步的 `export …` 列，然後執行：

```bash
bash scripts/azure-cloud-shell-deploy.sh
```

腳本會建立資源群組、ACR、B1 方案與單 instance Web App，建置映像並印出公網 URL。全程保持 **1 個 instance**。

### 一鍵式資源建立與首次發佈

將下列佔位符換成你的值後執行：

```bash
# 變數（按需修改）
RG=rg-image2webhook
LOC=eastasia
ACR=acrimage2webhook   # 全域唯一、僅小寫字母與數字
PLAN=plan-image2webhook
APP=app-image2webhook  # 全域唯一；URL = https://$APP.azurewebsites.net
IMAGE=image2webhook:v1

az group create --name "$RG" --location "$LOC"

az acr create --resource-group "$RG" --name "$ACR" --sku Basic --admin-enabled true

# 在 Azure 側建置映像（本機可不裝 Docker）
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

# 必填應用設定（勿把金鑰寫進映像）
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

### 驗證與客戶端存取

```bash
curl -s "https://$APP.azurewebsites.net/api/health"
# 期望: {"status":"ok","webhook_configured":true}
```

把該 URL（或自訂網域）交給客戶端；使用 App Settings 中的共享帳號登入，並勾選數據使用說明。

若 n8n 依呼叫端 IP 白名單放行，將本 Web App 的出站 IP 加入白名單：

```bash
az webapp show --resource-group "$RG" --name "$APP" --query outboundIpAddresses -o tsv
```

出站 IP 在擴縮容或重建應用後可能改變；需要固定 IP 時再考慮 NAT Gateway。

### 更新映像

```bash
az acr build --registry "$ACR" --image image2webhook:v2 .
az webapp config container set \
  --resource-group "$RG" \
  --name "$APP" \
  --docker-custom-image-name "$ACR_LOGIN/image2webhook:v2"
az webapp restart --resource-group "$RG" --name "$APP"
```

`DATA_DIR=/home/image2webhook` 下的 SQLite 與圖片在重啟與換映像後仍保留（應用未刪除且 `WEBSITES_ENABLE_APP_SERVICE_STORAGE=true`）。刪除 Web App 會清空 `/home`；重大變更前請用 Kudu / `az webapp ssh` 備份 `results.db` 與 `images/`。

### 可選：自訂網域

在門戶為 Web App 綁定自訂網域，並啟用 **App Service managed certificate**（免費 HTTPS）。綁定完成後把客戶端入口換成該網域即可。

---

## 免責與安全提示

本系統僅供 **研發** 使用。請勿上傳病患隱私或其他敏感資料。上傳內容與識別結果不應用於臨床診療、生產放行或其他正式業務。