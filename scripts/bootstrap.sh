#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"

NODE_MAJOR="$(node -v 2>/dev/null | sed -E 's/^v([0-9]+).*/\1/' || true)"
if [ -z "${NODE_MAJOR}" ]; then
  echo "Node.js is required but not found in PATH."
  exit 1
fi
if [ "${NODE_MAJOR}" != "22" ]; then
  echo "This project requires Node.js 22.x. Current: $(node -v)"
  echo "Switch Node version and run again."
  exit 1
fi

echo "Installing server dependencies..."
npm --prefix "$ROOT_DIR/server" install

echo "Installing client dependencies..."
npm --prefix "$ROOT_DIR/client" install

if [ ! -f "$ROOT_DIR/server/.env" ]; then
  cp "$ROOT_DIR/server/.env.example" "$ROOT_DIR/server/.env"
  echo "Created server/.env from server/.env.example"
fi

echo "Bootstrap complete."
echo "Next:"
echo "  1) Edit server/.env"
echo "  2) Start LiveKit: livekit-server --config livekit.yaml"
echo "  3) Start app: npm run dev"
