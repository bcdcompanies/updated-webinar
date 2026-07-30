#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
PACK_DIR="$ROOT_DIR/attendee-pack"

rm -rf "$PACK_DIR"
mkdir -p "$PACK_DIR"

cp "$ROOT_DIR/docs/ATTENDEE_QUICK_START.md" "$PACK_DIR/ATTENDEE_QUICK_START.md"
cp "$ROOT_DIR/docs/HOST_EVENT_RUNBOOK.md" "$PACK_DIR/HOST_EVENT_RUNBOOK.md"
cp "$ROOT_DIR/docs/TROUBLESHOOTING.md" "$PACK_DIR/TROUBLESHOOTING.md"

cat > "$PACK_DIR/invite-template.csv" <<'EOF'
name,email,join_link
Student One,student1@example.com,
Student Two,student2@example.com,
EOF

cat > "$PACK_DIR/README.md" <<'EOF'
# Attendee Pack

This folder is ready to share with hosts/attendees for trial runs.

Contents:
- ATTENDEE_QUICK_START.md: attendee steps to join from any device
- HOST_EVENT_RUNBOOK.md: host checklist before/during/after live session
- TROUBLESHOOTING.md: quick issue resolution guide
- invite-template.csv: optional invite tracking template

How to use:
1. Host starts a webinar and generates join links.
2. Host fills invite-template.csv with real names and links.
3. Share ATTENDEE_QUICK_START.md and each user's join link.
EOF

echo "Prepared $PACK_DIR"
