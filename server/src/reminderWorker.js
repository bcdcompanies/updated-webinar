import { db } from './db.js';
import { config } from './config.js';
import { sendReminder } from './email.js';

const toMs = (minutes) => Math.max(1, Number(minutes || 1)) * 60 * 1000;

function nowIso() {
  return new Date().toISOString();
}

function cutoffIso(leadMinutes) {
  return new Date(Date.now() + toMs(leadMinutes)).toISOString();
}

async function runReminderPass() {
  const start = nowIso();
  const end = cutoffIso(config.reminders.leadMinutes);

  const rows = db.prepare(
    `SELECT i.id AS invite_id,
            i.email,
            i.token,
            w.title,
            w.scheduled_at
       FROM invites i
       JOIN webinars w ON w.id = i.webinar_id
      WHERE w.status = 'scheduled'
        AND w.scheduled_at IS NOT NULL
        AND w.scheduled_at >= ?
        AND w.scheduled_at <= ?
        AND i.reminder_sent_at IS NULL
      ORDER BY w.scheduled_at ASC`
  ).all(start, end);

  if (rows.length === 0) {
    console.log(`[reminder-worker] no reminders due between ${start} and ${end}`);
    return;
  }

  const markReminderSent = db.prepare('UPDATE invites SET reminder_sent_at = ? WHERE id = ?');

  for (const row of rows) {
    const joinUrl = `${config.publicAppUrl}/join/${row.token}`;
    try {
      const emailed = await sendReminder({
        to: row.email,
        title: row.title,
        scheduledAt: row.scheduled_at,
        joinUrl,
      });

      if (emailed) {
        markReminderSent.run(nowIso(), row.invite_id);
        console.log(`[reminder-worker] reminder sent to ${row.email}`);
      }
    } catch (error) {
      console.error(`[reminder-worker] failed for ${row.email}:`, error.message);
    }
  }
}

async function main() {
  const intervalMs = toMs(config.reminders.intervalMinutes);
  console.log(
    `[reminder-worker] started with interval=${config.reminders.intervalMinutes}m lead=${config.reminders.leadMinutes}m`
  );

  await runReminderPass();
  setInterval(() => {
    runReminderPass().catch((error) => {
      console.error('[reminder-worker] unhandled loop error:', error);
    });
  }, intervalMs);
}

main().catch((error) => {
  console.error('[reminder-worker] fatal startup error:', error);
  process.exit(1);
});
