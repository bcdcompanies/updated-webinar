#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
PACK_DIR="$ROOT_DIR/attendee-pack"
OUT_ZIP="$ROOT_DIR/attendee-pack.zip"

sh "$ROOT_DIR/scripts/prepare-attendee-pack.sh"

rm -f "$OUT_ZIP"
cd "$ROOT_DIR"
zip -qr "$OUT_ZIP" attendee-pack

echo "Exported $OUT_ZIP"
