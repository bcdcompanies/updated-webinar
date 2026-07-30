import 'dotenv/config';

function required(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function normalizeUrl(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

function isLocalhostUrl(url) {
  try {
    const u = new URL(url);
    return ['localhost', '127.0.0.1', '::1'].includes(u.hostname);
  } catch {
    return false;
  }
}

const isProd = process.env.NODE_ENV === 'production';
const publicAppUrl = normalizeUrl(
  process.env.PUBLIC_APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    'http://localhost:5173'
);
const hostKey = String(process.env.HOST_KEY || 'change-me-host-key').trim();
const livekitUrl = required('LIVEKIT_URL');

if (isProd) {
  if (!hostKey || hostKey === 'change-me-host-key' || hostKey.length < 20) {
    fail('Invalid HOST_KEY for production. Set a long random value (>= 20 chars).');
  }

  if (isLocalhostUrl(publicAppUrl)) {
    fail('PUBLIC_APP_URL cannot be localhost in production. Use your public https URL.');
  }

  if (!String(livekitUrl).startsWith('wss://')) {
    fail('LIVEKIT_URL must use wss:// in production for browser media support.');
  }
}

export const config = {
  port: Number(process.env.PORT || 4000),
  // In production (e.g. Render) the client is served from the same origin.
  // RENDER_EXTERNAL_URL is injected automatically by Render, so join links in
  // emails point at the real public URL without manual config.
  publicAppUrl,
  hostKey,
  livekit: {
    apiKey: required('LIVEKIT_API_KEY'),
    apiSecret: required('LIVEKIT_API_SECRET'),
    url: livekitUrl,
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY || process.env.ESEND_API_KEY || '',
    from: process.env.MAIL_FROM || 'onboarding@resend.dev',
  },
  reminders: {
    // How often the reminder worker runs.
    intervalMinutes: Number(process.env.REMINDER_INTERVAL_MINUTES || 15),
    // How far before scheduled start we send reminders.
    leadMinutes: Number(process.env.REMINDER_LEAD_MINUTES || 60),
  },
};
