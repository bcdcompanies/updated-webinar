# Webinar — self-hosted, free Zoom alternative for teaching

A web app for hosting live video webinars for students. Built as a free,
self-hosted alternative to Zoom for classroom-sized sessions (15–75 people).

- **Video/audio + screen share + live chat** via [LiveKit](https://livekit.io) (self-hosted, no per-minute fees)
- **No student accounts** — students join from a unique email link and just type their name
- **Email invites** sent via [Resend](https://resend.com)
- **Backend**: Node.js + Express + SQLite
- **Frontend**: React (Vite) + LiveKit components

## Architecture

```
┌──────────┐      REST      ┌───────────────┐
│  React   │ ─────────────▶ │  Express API  │  (webinars, invites, tokens)
│  client  │                │  + SQLite     │
└────┬─────┘                └───────┬───────┘
     │                              │ sends invites via Resend
     │ WebRTC (media + chat)        │ mints LiveKit access tokens
     ▼                              ▼
┌─────────────────────────────────────────┐
│         LiveKit server (Docker)          │  self-hosted SFU
└─────────────────────────────────────────┘
```

Roles are enforced with LiveKit token permissions:

- **Host** — can publish camera/mic, share screen, and is a room admin (can
  promote/mute students).
- **Student** — joins as a view-only participant (receives video/audio, can use
  chat). The host can promote a student to speak/share on the fly.

## Documentation

- Installation and deployment: [docs/INSTALLATION.md](docs/INSTALLATION.md)
- Host and student operations: [docs/USER_GUIDE.md](docs/USER_GUIDE.md)
- Troubleshooting and diagnostics: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- Attendee handout (no-install): [docs/ATTENDEE_QUICK_START.md](docs/ATTENDEE_QUICK_START.md)
- Host live-session checklist: [docs/HOST_EVENT_RUNBOOK.md](docs/HOST_EVENT_RUNBOOK.md)

## Portable Commands

- Bootstrap dependencies and env: `npm run bootstrap`
- Start full local stack (LiveKit + API + client): `npm run start:local-stack`
- Start reminder worker (separate terminal): `npm --prefix server run start:worker`
- Prepare shareable attendee pack: `npm run prepare:attendee-pack`
- Export shareable attendee zip: `npm run export:attendee-pack`

## Prerequisites

- Node.js 18+ and npm
- LiveKit server — `brew install livekit` for local dev on macOS (Docker is used
  only for Linux deployment)
- A [Resend](https://resend.com) account + API key (free tier: 3,000 emails/mo).
  Optional — without it, invite links are logged to the server console instead.

## Quick start

### 1. Start the LiveKit server

**For local development on macOS, run LiveKit natively — not in Docker.**
Docker Desktop's NAT on macOS rewrites WebRTC media packets, which causes the
video to connect and then drop in a ~15-second reconnect loop. Running the
server natively avoids that entirely:

```bash
brew install livekit                     # one time
livekit-server --config livekit.yaml
```

This runs LiveKit on `ws://localhost:7880` with the dev API key/secret defined
in `livekit.yaml` (`devkey` / `secret`). **Change these before any real use.**

> The included `docker-compose.yml` is for **Linux deployment** (see "Deploying
> for real"), where Docker networking doesn't have the macOS NAT problem. Don't
> use it for local dev on a Mac.

### 2. Configure and run the backend

```bash
cd server
cp .env.example .env      # then edit .env
npm install
npm run dev
```

The API listens on `http://localhost:4000`.

### 3. Run the frontend

```bash
cd client
npm install
npm run dev
```

Open the printed URL (default `http://localhost:5173`).

## Usage

1. Go to the host dashboard, create a webinar (title, description, date/time).
2. Open the webinar, paste in student email addresses, and send invites. Each
   student gets a unique join link.
3. Click **Start session** to go live. Students who open their link type their
   name and join as viewers. Promote anyone to speaker from the participant
   controls when you want them on camera.

## Environment variables

See `server/.env.example`. Key ones:

| Variable            | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| `LIVEKIT_API_KEY`   | Must match a key in `livekit.yaml` (`devkey`)      |
| `LIVEKIT_API_SECRET`| Must match its secret in `livekit.yaml` (`secret`) |
| `LIVEKIT_URL`       | Public WS URL the browser connects to              |
| `RESEND_API_KEY`    | Resend key. If unset, links are logged, not mailed |
| `MAIL_FROM`         | Verified sender address for invites                |
| `PUBLIC_APP_URL`    | Base URL used to build join links in emails        |
| `REMINDER_INTERVAL_MINUTES` | Reminder worker polling interval             |
| `REMINDER_LEAD_MINUTES`     | Lead time before event start for reminders    |

## Deploy to Azure Container Apps (API + Worker)

This repository now includes:

- `Dockerfile.api` for the Express API + built client
- `Dockerfile.worker` for the reminder worker process
- `.github/workflows/ci.yml` for validation and image build checks
- `.github/workflows/deploy-azure-container-apps.yml` for deployment

Before running the deployment workflow, create two Container Apps in the same
environment (one for API and one for worker) and configure their runtime env
vars (LiveKit, Resend, host key, and reminder settings).

GitHub repository secrets required by the deployment workflow:

- `AZURE_CREDENTIALS` (service principal JSON for `azure/login`)
- `AZURE_RESOURCE_GROUP`
- `AZURE_CONTAINER_REGISTRY_NAME` (ACR name, without `.azurecr.io`)
- `AZURE_CONTAINER_APP_API_NAME`
- `AZURE_CONTAINER_APP_WORKER_NAME`

Deployment flow on every push to `main` (or manual dispatch):

1. Build and push API image to ACR (`webinar-api:<sha>`)
2. Build and push worker image to ACR (`webinar-worker:<sha>`)
3. Update API Container App to the new image
4. Update worker Container App to the new image

## Deploy a free public demo (Render + LiveKit Cloud)

The fastest way to put a working demo online — no domain purchase, no server to
manage, free at demo scale. The whole app deploys as **one service** (the Node
server serves the built React app), and video runs on **LiveKit Cloud**.

**1. LiveKit Cloud (video).** Sign up at [cloud.livekit.io](https://cloud.livekit.io),
create a project, and copy its **WS URL** (`wss://<project>.livekit.cloud`),
**API key**, and **API secret**. Nothing in the code changes — LiveKit is read
from env vars.

**2. Push this repo to GitHub.**

**3. Render (app hosting).** At [render.com](https://render.com), either:
- **Blueprint (easiest):** New + → Blueprint → pick the repo. `render.yaml` sets
  the build/start commands; fill in the secret env vars when prompted.
- **Manual:** New + → Web Service → pick the repo, then set:
  - Build command: `npm run build`
  - Start command: `npm start`
  - Env vars: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` (from step 1),
    a long random `HOST_KEY`, and optionally `RESEND_API_KEY` + `MAIL_FROM`.

Render gives you a free `https://<name>.onrender.com` URL with TLS — which
satisfies the browser's HTTPS requirement for camera/mic. `PORT` and the public
URL are injected automatically.

## Go-live checklist (real people)

Before inviting actual attendees, verify these are true:

- App URL is public **HTTPS** (not localhost).
- `LIVEKIT_URL` is **wss://...** (not ws://).
- `HOST_KEY` is a long random secret (20+ chars), not `change-me-host-key`.
- Host browser can start a session and enter the room.
- Student can open a join link from a different network/device.
- If using email invites, `RESEND_API_KEY` + verified `MAIL_FROM` are set.

The server now enforces the first three in production and will fail fast on
unsafe config.

**Demo-scale caveats (fine for a demo, not for production):**
- Render's free tier **spins down after ~15 min idle**; the first request then
  takes ~30–60s to wake. Open the URL a minute before showing it.
- The SQLite database lives on an **ephemeral disk** — created webinars reset on
  each deploy/restart. Recreate them for the demo; nothing to worry about.
- Email still needs a verified Resend domain to reach arbitrary addresses. For a
  demo, use the **"copy link"** buttons to share join links directly.

## Deploying for real (self-hosted, zero per-use fees)

For production without metered fees, self-host on a small Linux VPS:

- Run LiveKit from the included `docker-compose.yml` (Linux Docker has no macOS
  NAT problem). Change the `devkey`/`secret` in `livekit.yaml` and match them in
  the server env.
- Put both the app and LiveKit behind **TLS** (`wss://`) with a real domain —
  browsers require a secure context for camera/mic off localhost. A reverse
  proxy like Caddy gives automatic Let's Encrypt certs.
- Add a **TURN server** so students on restrictive networks connect without
  browser tweaks (LiveKit can run one; needs the domain + TLS).
- Verify your sending domain in Resend and set `MAIL_FROM` to an address on it.

This is flat-cost (~VPS + domain) regardless of participant count — the actual
"no Zoom fees" setup.

## Not in v1

Recording, breakout rooms, payments, student accounts/attendance, and persistent
mailing lists. Invites are entered per-webinar.
