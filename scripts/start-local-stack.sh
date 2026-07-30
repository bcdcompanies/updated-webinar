#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"

if ! command -v livekit-server >/dev/null 2>&1; then
  echo "livekit-server not found. Install it first."
  exit 1
fi

echo "Starting LiveKit..."
cd "$ROOT_DIR"
livekit-server --config livekit.yaml &
LK_PID=$!

echo "Starting API server..."
npm --prefix "$ROOT_DIR/server" run dev &
API_PID=$!

echo "Starting web client..."
npm --prefix "$ROOT_DIR/client" run dev -- --host &
WEB_PID=$!

cleanup() {
  kill "$WEB_PID" "$API_PID" "$LK_PID" >/dev/null 2>&1 || true
}

trap cleanup INT TERM EXIT

echo "Stack started."
echo "Client: http://localhost:5173"
echo "API:    http://localhost:4000"
echo "Press Ctrl+C to stop all services."

wait
