#!/usr/bin/env bash
# Deploy Image2Webhook to Azure App Service from Azure Cloud Shell.
# Prerequisites: Cloud Shell already logged in; run from the unpacked app directory.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f Dockerfile ]]; then
  echo "ERROR: Dockerfile not found in $ROOT. Upload/unpack the deploy package first." >&2
  exit 1
fi

: "${N8N_WEBHOOK_URL:?Set N8N_WEBHOOK_URL (paste exports from your local .env first)}"
: "${APP_USERNAME:=admin}"
: "${APP_PASSWORD:?Set APP_PASSWORD}"
: "${APP_SECRET:=$(openssl rand -hex 32)}"

RG="${RG:-rg-image2webhook}"
LOC="${LOC:-eastasia}"
PLAN="${PLAN:-plan-image2webhook}"
SUFFIX="${SUFFIX:-$(openssl rand -hex 3)}"
# ACR: 5–50 chars, alphanumeric only
ACR="${ACR:-i2w${SUFFIX}}"
APP="${APP:-i2w-app-${SUFFIX}}"
IMAGE="${IMAGE:-image2webhook:v1}"

echo "=== Deploy plan ==="
echo "  RG=$RG  LOC=$LOC"
echo "  ACR=$ACR  APP=$APP"
echo "  Public URL: https://${APP}.azurewebsites.net"
echo "  Username: $APP_USERNAME"
echo

az group create --name "$RG" --location "$LOC" >/dev/null

if ! az acr show --name "$ACR" --resource-group "$RG" &>/dev/null; then
  az acr create --resource-group "$RG" --name "$ACR" --sku Basic --admin-enabled true
fi

echo "=== Building image in ACR (several minutes) ==="
az acr build --registry "$ACR" --image "$IMAGE" .

if ! az appservice plan show --name "$PLAN" --resource-group "$RG" &>/dev/null; then
  az appservice plan create \
    --name "$PLAN" \
    --resource-group "$RG" \
    --location "$LOC" \
    --is-linux \
    --sku B1
fi

ACR_LOGIN=$(az acr show -n "$ACR" --query loginServer -o tsv)
ACR_USER=$(az acr credential show -n "$ACR" --query username -o tsv)
ACR_PASS=$(az acr credential show -n "$ACR" --query "passwords[0].value" -o tsv)

if ! az webapp show --name "$APP" --resource-group "$RG" &>/dev/null; then
  az webapp create \
    --resource-group "$RG" \
    --plan "$PLAN" \
    --name "$APP" \
    --deployment-container-image-name "$ACR_LOGIN/$IMAGE"
fi

az webapp config container set \
  --resource-group "$RG" \
  --name "$APP" \
  --docker-custom-image-name "$ACR_LOGIN/$IMAGE" \
  --docker-registry-server-url "https://$ACR_LOGIN" \
  --docker-registry-server-user "$ACR_USER" \
  --docker-registry-server-password "$ACR_PASS"

az webapp config appsettings set \
  --resource-group "$RG" \
  --name "$APP" \
  --settings \
    "N8N_WEBHOOK_URL=$N8N_WEBHOOK_URL" \
    "APP_USERNAME=$APP_USERNAME" \
    "APP_PASSWORD=$APP_PASSWORD" \
    "APP_SECRET=$APP_SECRET" \
    "DATA_DIR=/home/image2webhook" \
    "COOKIE_SECURE=true" \
    "WEBSITES_PORT=8000" \
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE=true" \
    "WEBSITES_CONTAINER_START_TIME_LIMIT=600"

az webapp update --resource-group "$RG" --name "$APP" --https-only true >/dev/null
az webapp config set \
  --resource-group "$RG" \
  --name "$APP" \
  --always-on true \
  --generic-configurations '{"healthCheckPath":"/api/health"}' >/dev/null

az webapp restart --resource-group "$RG" --name "$APP"

echo
echo "=== Waiting for health ==="
URL="https://${APP}.azurewebsites.net"
for i in $(seq 1 30); do
  BODY=$(curl -fsS "$URL/api/health" 2>/dev/null || true)
  if echo "$BODY" | grep -q '"status":"ok"'; then
    echo "Health OK: $BODY"
    break
  fi
  echo "  attempt $i/30 …"
  sleep 10
done

echo
echo "Client URL:  $URL"
echo "Login user:  $APP_USERNAME"
echo "Outbound IPs (for n8n allowlist if needed):"
az webapp show --resource-group "$RG" --name "$APP" --query outboundIpAddresses -o tsv
echo
echo "Save these names for updates: RG=$RG ACR=$ACR APP=$APP IMAGE=$IMAGE"
