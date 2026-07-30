import { Resend } from 'resend';
import { config } from './config.js';

const resend = config.email.resendApiKey
  ? new Resend(config.email.resendApiKey)
  : null;

function inviteHtml({ title, description, scheduledAt, joinUrl }) {
  const when = scheduledAt
    ? new Date(scheduledAt).toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'short',
      })
    : 'To be announced';
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
    <h2 style="margin:0 0 4px">You're invited: ${escapeHtml(title)}</h2>
    <p style="color:#555;margin:0 0 16px"><strong>When:</strong> ${escapeHtml(when)}</p>
    ${description ? `<p style="margin:0 0 20px">${escapeHtml(description)}</p>` : ''}
    <a href="${joinUrl}" style="display:inline-block;background:#5b5bd6;color:#fff;
      text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600">
      Join the webinar
    </a>
    <p style="color:#888;font-size:13px;margin-top:20px">
      Or paste this link into your browser:<br>
      <a href="${joinUrl}" style="color:#5b5bd6">${joinUrl}</a>
    </p>
  </div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/**
 * Send an invite email. If Resend isn't configured, logs the link instead so
 * local testing still works. Returns true if actually emailed.
 */
export async function sendInvite({ to, title, description, scheduledAt, joinUrl }) {
  if (!resend) {
    console.log(`[email disabled] invite for ${to} → ${joinUrl}`);
    return false;
  }
  const { error } = await resend.emails.send({
    from: config.email.from,
    to,
    subject: `Invitation: ${title}`,
    html: inviteHtml({ title, description, scheduledAt, joinUrl }),
  });
  if (error) {
    throw new Error(`Resend error for ${to}: ${error.message || error.name}`);
  }
  return true;
}

function reminderHtml({ title, scheduledAt, joinUrl }) {
  const when = scheduledAt
    ? new Date(scheduledAt).toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'short',
      })
    : 'soon';

  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
    <h2 style="margin:0 0 8px">Reminder: ${escapeHtml(title)} starts soon</h2>
    <p style="margin:0 0 16px;color:#555">Starts at: <strong>${escapeHtml(when)}</strong></p>
    <a href="${joinUrl}" style="display:inline-block;background:#1d8f6f;color:#fff;
      text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600">
      Join now
    </a>
    <p style="color:#888;font-size:13px;margin-top:20px">
      If the button does not open, paste this link into your browser:<br>
      <a href="${joinUrl}" style="color:#1d8f6f">${joinUrl}</a>
    </p>
  </div>`;
}

export async function sendReminder({ to, title, scheduledAt, joinUrl }) {
  if (!resend) {
    console.log(`[email disabled] reminder for ${to} -> ${joinUrl}`);
    return false;
  }

  const { error } = await resend.emails.send({
    from: config.email.from,
    to,
    subject: `Reminder: ${title} starts soon`,
    html: reminderHtml({ title, scheduledAt, joinUrl }),
  });

  if (error) {
    throw new Error(`Resend error for ${to}: ${error.message || error.name}`);
  }

  return true;
}
