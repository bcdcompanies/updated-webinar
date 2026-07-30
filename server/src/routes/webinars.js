import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db.js';
import { config } from '../config.js';
import { createToken, setParticipantCanPublish, removeParticipant } from '../livekit.js';
import { sendInvite } from '../email.js';

export const webinars = Router();

// Simple shared-secret gate for host-only actions.
webinars.use((req, res, next) => {
  if (req.get('x-host-key') !== config.hostKey) {
    return res.status(401).json({ error: 'Invalid host key' });
  }
  next();
});

const nowIso = () => new Date().toISOString();

// List all webinars (newest first)
webinars.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM webinars ORDER BY created_at DESC').all();
  res.json(rows.map(withInviteCount));
});

// Create a webinar
webinars.post('/', (req, res) => {
  const { title, description = '', scheduledAt = null } = req.body || {};
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const id = nanoid(12);
  db.prepare(
    `INSERT INTO webinars (id, title, description, scheduled_at, status, room_name, created_at)
     VALUES (?, ?, ?, ?, 'scheduled', ?, ?)`
  ).run(id, title.trim(), description, scheduledAt, `room_${id}`, nowIso());
  res.status(201).json(getWebinarOr404(id));
});

// Get one webinar with its invites
webinars.get('/:id', (req, res) => {
  const w = db.prepare('SELECT * FROM webinars WHERE id = ?').get(req.params.id);
  if (!w) return res.status(404).json({ error: 'Not found' });
  const invites = db
    .prepare('SELECT id, email, token, sent_at FROM invites WHERE webinar_id = ? ORDER BY created_at')
    .all(w.id);
  res.json({ ...w, invites });
});

// Update status (start/stop session)
webinars.patch('/:id', (req, res) => {
  const { status } = req.body || {};
  if (!['scheduled', 'live', 'ended'].includes(status)) {
    return res.status(400).json({ error: 'invalid status' });
  }
  const info = db.prepare('UPDATE webinars SET status = ? WHERE id = ?').run(status, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json(getWebinarOr404(req.params.id));
});

// Delete a webinar (cascades invites)
webinars.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM webinars WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

// Add invites (emails) and send them. Body: { emails: string[] }
webinars.post('/:id/invites', async (req, res) => {
  const w = db.prepare('SELECT * FROM webinars WHERE id = ?').get(req.params.id);
  if (!w) return res.status(404).json({ error: 'Not found' });

  const emails = normalizeEmails(req.body?.emails);
  if (emails.length === 0) return res.status(400).json({ error: 'No valid emails provided' });

  const insert = db.prepare(
    `INSERT INTO invites (id, webinar_id, email, token, created_at) VALUES (?, ?, ?, ?, ?)`
  );
  const markSent = db.prepare('UPDATE invites SET sent_at = ? WHERE id = ?');

  const results = [];
  for (const email of emails) {
    const id = nanoid(12);
    const token = nanoid(24);
    insert.run(id, w.id, email, token, nowIso());
    const joinUrl = `${config.publicAppUrl}/join/${token}`;
    try {
      const emailed = await sendInvite({
        to: email,
        title: w.title,
        description: w.description,
        scheduledAt: w.scheduled_at,
        joinUrl,
      });
      if (emailed) markSent.run(nowIso(), id);
      results.push({ email, joinUrl, emailed });
    } catch (err) {
      results.push({ email, joinUrl, emailed: false, error: err.message });
    }
  }
  res.status(201).json({ results });
});

// Host token to join their own room
webinars.post('/:id/host-token', async (req, res) => {
  const w = db.prepare('SELECT * FROM webinars WHERE id = ?').get(req.params.id);
  if (!w) return res.status(404).json({ error: 'Not found' });
  const name = (req.body?.name || 'Host').toString().slice(0, 60);
  const token = await createToken({
    roomName: w.room_name,
    identity: `host_${nanoid(6)}`,
    name,
    host: true,
  });
  res.json({ token, url: config.livekit.url, roomName: w.room_name, title: w.title });
});

// Moderation: promote/demote a student's publish rights
webinars.post('/:id/participants/:identity/publish', async (req, res) => {
  const w = db.prepare('SELECT * FROM webinars WHERE id = ?').get(req.params.id);
  if (!w) return res.status(404).json({ error: 'Not found' });
  const canPublish = req.body?.canPublish !== false;
  try {
    await setParticipantCanPublish(w.room_name, req.params.identity, canPublish);
    res.json({ ok: true, canPublish });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// Moderation: remove a participant from the room
webinars.delete('/:id/participants/:identity', async (req, res) => {
  const w = db.prepare('SELECT * FROM webinars WHERE id = ?').get(req.params.id);
  if (!w) return res.status(404).json({ error: 'Not found' });
  try {
    await removeParticipant(w.room_name, req.params.identity);
    res.json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// --- helpers ---
function getWebinarOr404(id) {
  return db.prepare('SELECT * FROM webinars WHERE id = ?').get(id);
}
function withInviteCount(w) {
  const { c } = db.prepare('SELECT COUNT(*) c FROM invites WHERE webinar_id = ?').get(w.id);
  return { ...w, inviteCount: c };
}
function normalizeEmails(input) {
  const raw = Array.isArray(input) ? input : String(input || '').split(/[\s,;]+/);
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return [...new Set(raw.map((e) => e.trim().toLowerCase()).filter((e) => re.test(e)))];
}
