import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db.js';
import { config } from '../config.js';
import { createToken } from '../livekit.js';

export const join = Router();

// Public: look up a webinar by invite token (no host key needed)
join.get('/:token', (req, res) => {
  const info = lookup(req.params.token);
  if (!info) return res.status(404).json({ error: 'Invalid or expired link' });
  const { webinar } = info;
  res.json({
    title: webinar.title,
    description: webinar.description,
    scheduledAt: webinar.scheduled_at,
    status: webinar.status,
  });
});

// Public: student joins by token, providing a display name → LiveKit token
join.post('/:token/token', async (req, res) => {
  const info = lookup(req.params.token);
  if (!info) return res.status(404).json({ error: 'Invalid or expired link' });
  const { webinar } = info;

  if (webinar.status === 'ended') {
    return res.status(409).json({ error: 'This webinar has ended' });
  }
  const name = (req.body?.name || '').toString().trim().slice(0, 60);
  if (!name) return res.status(400).json({ error: 'Please enter your name' });

  const token = await createToken({
    roomName: webinar.room_name,
    identity: `student_${nanoid(8)}`,
    name,
    host: false,
  });
  res.json({
    token,
    url: config.livekit.url,
    roomName: webinar.room_name,
    title: webinar.title,
    status: webinar.status,
  });
});

function lookup(token) {
  const invite = db.prepare('SELECT * FROM invites WHERE token = ?').get(token);
  if (!invite) return null;
  const webinar = db.prepare('SELECT * FROM webinars WHERE id = ?').get(invite.webinar_id);
  if (!webinar) return null;
  return { invite, webinar };
}
