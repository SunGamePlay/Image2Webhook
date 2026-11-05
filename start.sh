#!/usr/bin/env bash
# ==============================================================================
# Image2Webhook - Launch Script (macOS / Linux)
# ==============================================================================
set -e

# Change directory to project root
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

mkdir -p .logs

echo "🚀 Starting Image2Webhook..."

# Stop any previously running processes on port 8000 and 3000
if command -v lsof >/dev/null 2>&1; then
  OLD_PIDS=$(lsof -ti:8000,3000 2>/dev/null || true)
  if [ -n "$OLD_PIDS" ]; then
    echo "🧹 Cleaning up existing processes on ports 8000 / 3000..."
    kill -9 $OLD_PIDS 2>/dev/null || true
    sleep 1
  fi
fi

# Locate Python environment
PYTHON_CMD="python3"
UVICORN_CMD="uvicorn"
if [ -f "$ROOT_DIR/.venv/bin/uvicorn" ]; then
  UVICORN_CMD="$ROOT_DIR/.venv/bin/uvicorn"
  PYTHON_CMD="$ROOT_DIR/.venv/bin/python"
elif command -v uv >/dev/null 2>&1; then
  UVICORN_CMD="uv run uvicorn"
fi

# 1. Start FastAPI Backend
echo "📦 Starting FastAPI backend on http://localhost:8000..."
nohup $UVICORN_CMD app:app --host 0.0.0.0 --port 8000 --reload > .logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > .backend.pid

# 2. Start Vite React Frontend
echo "⚡ Starting Vite React frontend on http://localhost:3000..."
cd "$ROOT_DIR/frontend"
nohup npm run dev -- --host > "$ROOT_DIR/.logs/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$ROOT_DIR/.frontend.pid"
cd "$ROOT_DIR"

# Wait a brief moment for servers to initialize
sleep 2

echo ""
echo "============================================================"
echo "  🦷 Image2Webhook is now RUNNING!"
echo ""
echo "  👉 Frontend (React + HMR):  http://localhost:3000"
echo "  👉 Backend API (FastAPI):   http://localhost:8000"
echo "  👉 API Health:              http://localhost:8000/api/health"
echo ""
echo "  📄 Logs:"
echo "     Backend:  tail -f .logs/backend.log"
echo "     Frontend: tail -f .logs/frontend.log"
echo ""
echo "  🛑 To stop the app anytime:"
echo "     Run ./stop.sh or double-click stop.command"
echo "============================================================"
echo ""

# Open browser on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "🌐 Opening http://localhost:3000 in your browser..."
  open "http://localhost:3000" || true
fi
