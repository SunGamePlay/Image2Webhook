#!/usr/bin/env bash
# ==============================================================================
# Image2Webhook - Shutdown Script (macOS / Linux)
# ==============================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "🛑 Stopping Image2Webhook..."

# Kill saved PIDs if available
if [ -f .backend.pid ]; then
  BPID=$(cat .backend.pid)
  if kill -0 "$BPID" 2>/dev/null; then
    kill "$BPID" 2>/dev/null || true
    echo "  Stopped backend (PID: $BPID)"
  fi
  rm -f .backend.pid
fi

if [ -f .frontend.pid ]; then
  FPID=$(cat .frontend.pid)
  if kill -0 "$FPID" 2>/dev/null; then
    kill "$FPID" 2>/dev/null || true
    echo "  Stopped frontend (PID: $FPID)"
  fi
  rm -f .frontend.pid
fi

# Clean up any remaining processes bound to ports 8000 and 3000
if command -v lsof >/dev/null 2>&1; then
  REMAINING=$(lsof -ti:8000,3000 2>/dev/null || true)
  if [ -n "$REMAINING" ]; then
    kill -9 $REMAINING 2>/dev/null || true
    echo "  Cleared ports 8000 & 3000"
  fi
fi

echo "✅ Image2Webhook has been stopped."
