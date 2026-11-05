#!/usr/bin/env bash
# Run LOCALLY. Prints export lines to paste into Azure Cloud Shell.
# Does not print values to logs beyond stdout — review before sharing.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${1:-$ROOT/.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found" >&2
  exit 1
fi

get() {
  local key="$1"
  local line
  line=$(grep -E "^${key}=" "$ENV_FILE" | tail -n1 || true)
  if [[ -z "$line" ]]; then
    echo ""
    return
  fi
  printf '%s' "${line#*=}" | sed -e 's/^["'\'']//' -e 's/["'\'']$//'
}

N8N=$(get N8N_WEBHOOK_URL)
USER=$(get APP_USERNAME)
PASS=$(get APP_PASSWORD)
SECRET=$(get APP_SECRET)

if [[ -z "$N8N" || -z "$PASS" ]]; then
  echo "ERROR: N8N_WEBHOOK_URL and APP_PASSWORD must be set in $ENV_FILE" >&2
  exit 1
fi

USER="${USER:-admin}"
SECRET="${SECRET:-$(openssl rand -hex 32)}"

# Single-quote values safely for bash paste
sq() { printf "%s" "$1" | sed "s/'/'\\\\''/g"; }

cat <<EOF
# Paste these into Azure Cloud Shell, then run the deploy script.
export N8N_WEBHOOK_URL='$(sq "$N8N")'
export APP_USERNAME='$(sq "$USER")'
export APP_PASSWORD='$(sq "$PASS")'
export APP_SECRET='$(sq "$SECRET")'
EOF
