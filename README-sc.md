<div align="middle">

# Image2Webhook · 技工单识别

<a href="README.md"><img src="https://img.shields.io/badge/English-1a1a2e?style=for-the-badge"></a>
<a href="README-tc.md"><img src="https://img.shields.io/badge/繁體中文-1a1a2e?style=for-the-badge"></a>
<a href="README-sc.md"><img src="https://img.shields.io/badge/简体中文-1a1a2e?style=for-the-badge"></a>

<img src="https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python 3.9+" />
<a href="https://n8n.io/"><img src="https://img.shields.io/badge/n8n-Integration-EA4B71?style=flat-square&logo=n8n&logoColor=white" alt="n8n" /></a>
<img src="https://img.shields.io/badge/ASGI-Uvicorn-2C5BB4?style=flat-square&logo=gunicorn&logoColor=white" alt="Uvicorn" />
<a href="https://github.com/astral-sh/uv"><img src="https://img.shields.io/badge/Packager-uv-DE5FE9?style=flat-square&logo=astral&logoColor=white" alt="uv" /></a>

批量上传技工单图片，转发到 n8n 识别与英译中，并在网页中核对中文结果。

</div>

---

## 功能概览

| 页面 | 说明 |
|------|------|
| **登录** | 共享账号登录；须勾选数据使用说明（研发用途、请勿上传敏感资料） |
| **上传图片** | 多图拖放上传；处理进度条与每张耗时；顶部研发免责提示 |
| **比对编辑器** | 图片与技工单左右分栏比对编辑器；支持缩放/旋转原图、多种表单模板切换与实时 JSON 编辑 |

上传后每张图在后台发往 n8n；浏览器通过任务轮询查看状态，无需等待 webhook 完成再返回。

识别结果支持两种 JSON：

- **扁平 n8n 输出**：`Order_ID`、`Due_Date`、`Shade`、`Teeth_Arch`、`Material`、`Stage`、`Production`、`Manufacturing_Specs` 等
- **嵌套技工单结构**：`DentalLabOrder`（用于填充中文技工单表单）

扁平结果会自动映射到表单预览与总表 / Excel 的中文列。

---

## 环境要求

- Python 3.9+
- [uv](https://github.com/astral-sh/uv)（推荐）或 pip
- 已配置的 n8n webhook（接收图片并返回中文提取 JSON）

---

## 安装

```bash
git clone https://github.com/SunGamePlay/Image2Webhook.git
cd Image2Webhook
python3 -m venv .venv
source .venv/bin/activate
uv sync
cp .env.example .env
```

编辑 `.env`：

```env
# 必填：n8n webhook
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id

# 共享登录（启动时写入 users 表；修改密码后重启即生效）
APP_USERNAME=admin
APP_PASSWORD=changeme
APP_SECRET=replace-with-a-long-random-string

# 可选（Azure 部署见下文）：DATA_DIR、COOKIE_SECURE
```

可选：Qdrant / Azure OpenAI 相关变量用于术语库（见 `.env.example`），网页主流程不强制依赖。

**请在正式使用前修改默认密码。**

---

## 运行

```bash
# 推荐（已激活 venv 时）
.venv/bin/uvicorn app:app --reload --host 127.0.0.1 --port 8000

# 或
uv run uvicorn app:app --reload --port 8000
```

浏览器打开： [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

健康检查（无需登录）：

```bash
curl -s http://127.0.0.1:8000/api/health
```

---

## 使用流程

1. 登录并勾选 **数据使用说明**
2. 在 **上传图片** 中拖入技工单图片并发送
3. 在进度区查看批次完成数与每张耗时；完成后可 **去核对**
4. 在 **比对编辑器** 对照原图检查和编辑识别结果
5. 在 **设置** 中按需要隐藏页面或核对面板（设置保存在服务端，对所有登录会话生效）

---

## 主要 API

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/health` | 健康检查（公开） |
| `POST` | `/api/login` | 登录（需 `disclaimer_accepted: true`） |
| `POST` | `/api/logout` | 退出 |
| `GET` | `/api/me` | 当前会话 |
| `POST` | `/api/upload` | 上传单张图片，返回 `job_id` |
| `GET` | `/api/jobs?ids=` | 任务状态与耗时 |
| `GET` | `/api/results` | 已保存识别结果 |
| `GET` | `/api/results/export` | 下载 Excel |
| `GET` / `PUT` | `/api/settings` | 显示设置 |
| `GET` | `/api/images/{name}` | 已上传原图 |
| `GET` | `/form` | 中文技工单表单页（嵌入核对页） |

除 `/`、`/api/health`、登录相关外，业务接口需登录 Cookie。

---

## 数据与目录

| 路径 | 说明 |
|------|------|
| `data/results.db` | SQLite：用户、会话、任务、结果（可用 `DATA_DIR` 覆盖根目录） |
| `data/images/` | 上传原图 |
| `frontend/` | 模块化 React.js 前端 (Vite + TypeScript + Zustand + Tailwind) |

---

## 技术栈

- **后端**：FastAPI + Uvicorn + SQLite + httpx
- **前端**：原生 HTML / CSS / JS（无构建步骤）
- **集成**：n8n webhook；可选 Qdrant + Azure OpenAI 术语库

---

## Azure 部署（公网访问）

**线上环境与后续更新（给维护者 / Agent 的完整手册）：见 [AZURE.md](AZURE.md)。**

将本应用以 **单个** Linux 容器发布到 Azure App Service。客户端通过 HTTPS 公网 URL 访问；容器内 Uvicorn 仍调用外网可达的 `N8N_WEBHOOK_URL`。

**硬性约束：只跑 1 个实例、1 个 Uvicorn worker。** SQLite、上传图片与后台 webhook 任务都绑在本机进程/磁盘上，开启自动扩缩容或多副本会拆分数据与会话。

默认区域建议：`eastasia`（香港）。全局 Azure 主机名为 `*.azurewebsites.net`；若使用 Azure 中国（21Vianet），CLI 云为 `AzureChinaCloud`，主机名为 `*.chinacloudsites.cn`。

**日常发版（推荐）：** 完成 [AZURE.md — GitHub Actions](AZURE.md#github-actions-cicd) 中的一次性 OIDC / Secrets 后，向 `main` `git push` 即可由 Actions 在 ACR 构建并更新线上 Web App。App Settings 仍只在 Azure 中维护。Cloud Shell 流程保留作首次部署与回退。

### 前置条件

- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) 已登录（`az login`），**或**使用门户里的 **Azure Cloud Shell**（本机被 Conditional Access 拦截时推荐）
- 仓库根目录含 `Dockerfile`（本仓库已提供）
- n8n webhook 对 App Service **出站**可达（浏览器不会直连 n8n）

### Cloud Shell 快速发布（首次 / 回退）

1. 本机生成要粘贴的密钥（不要提交 `.env`）：

```bash
./scripts/print-azure-exports.sh
```

2. 将 `image2webhook-azure-upload.tgz`（或含 `Dockerfile` 的源码包）上传到 Cloud Shell，解压后进入目录。
3. 在 Cloud Shell 粘贴第 1 步的 `export …` 行，然后执行：

```bash
bash scripts/azure-cloud-shell-deploy.sh
```

脚本会创建资源组、ACR、B1 计划与单实例 Web App，构建镜像并打印公网 URL。全程保持 **1 个实例**。

### 一键式资源创建与首次发布

将下列占位符换成你的值后执行：

```bash
# 变量（按需修改）
RG=rg-image2webhook
LOC=eastasia
ACR=acrimage2webhook   # 全局唯一、仅小写字母与数字
PLAN=plan-image2webhook
APP=app-image2webhook  # 全局唯一；URL = https://$APP.azurewebsites.net
IMAGE=image2webhook:v1

az group create --name "$RG" --location "$LOC"

az acr create --resource-group "$RG" --name "$ACR" --sku Basic --admin-enabled true

# 在 Azure 侧构建镜像（本机可不装 Docker）
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

# 必填应用设置（勿把密钥写进镜像）
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

### 验证与客户端访问

```bash
curl -s "https://$APP.azurewebsites.net/api/health"
# 期望: {"status":"ok","webhook_configured":true}
```

把该 URL（或自定义域名）发给客户端；使用 App Settings 中的共享账号登录，并勾选数据使用说明。

若 n8n 按调用方 IP 白名单放行，将本 Web App 的出站 IP 加入白名单：

```bash
az webapp show --resource-group "$RG" --name "$APP" --query outboundIpAddresses -o tsv
```

出站 IP 在扩缩容或重建应用后可能变化；需要固定 IP 时再考虑 NAT Gateway。

### 更新镜像

```bash
az acr build --registry "$ACR" --image image2webhook:v2 .
az webapp config container set \
  --resource-group "$RG" \
  --name "$APP" \
  --docker-custom-image-name "$ACR_LOGIN/image2webhook:v2"
az webapp restart --resource-group "$RG" --name "$APP"
```

`DATA_DIR=/home/image2webhook` 下的 SQLite 与图片在重启与换镜像后仍保留（应用未删除且 `WEBSITES_ENABLE_APP_SERVICE_STORAGE=true`）。删除 Web App 会清空 `/home`；重大变更前请用 Kudu / `az webapp ssh` 备份 `results.db` 与 `images/`。

### 可选：自定义域名

在门户为 Web App 绑定自定义域名，并启用 **App Service managed certificate**（免费 HTTPS）。绑定完成后把客户端入口换成该域名即可。

---

## 免责与安全提示

本系统仅供 **研发** 使用。请勿上传患者隐私或其他敏感资料。上传内容与识别结果不应用于临床诊疗、生产放行或其他正式业务。