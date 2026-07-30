import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
mkdirSync(dataDir, { recursive: true });

export const db = new Database(join(dataDir, 'webinar.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS webinars (
    id           TEXT PRIMARY KEY,
    title        TEXT NOT NULL,
    description  TEXT NOT NULL DEFAULT '',
    scheduled_at TEXT,                       -- ISO 8601, nullable
    status       TEXT NOT NULL DEFAULT 'scheduled', -- scheduled | live | ended
    room_name    TEXT NOT NULL,              -- LiveKit room name
    created_at   TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS invites (
    id          TEXT PRIMARY KEY,
    webinar_id  TEXT NOT NULL REFERENCES webinars(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    token       TEXT NOT NULL UNIQUE,        -- unique per-recipient join token
    sent_at     TEXT,
    created_at  TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_invites_webinar ON invites(webinar_id);
`);

// Lightweight migration: older databases may not include reminder_sent_at yet.
const inviteColumns = db.prepare('PRAGMA table_info(invites)').all();
const hasReminderSentAt = inviteColumns.some((col) => col.name === 'reminder_sent_at');
if (!hasReminderSentAt) {
  db.exec('ALTER TABLE invites ADD COLUMN reminder_sent_at TEXT');
}
