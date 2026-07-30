# Installation Guide

This guide explains how to install and run the Webinar app for local development and public deployment.

## 1. What You Are Installing

The application has three parts:

- Client: React + Vite web app (host dashboard and student join pages)
- Server: Node.js + Express API with SQLite persistence
- Media layer: LiveKit server for real-time video/audio/chat

## 2. Prerequisites

## 2.1 Local Development

- macOS, Linux, or Windows
- Node.js 22.x
- npm (comes with Node)
- LiveKit server binary for local media server

Recommended on macOS:

- Homebrew installed
- node@22 installed through Homebrew
- livekit-server installed through Homebrew

## 2.2 Production Trial

- GitHub repository with this project
- Render account (or equivalent Node hosting)
- LiveKit Cloud project (recommended for public internet testing)
- Optional: Resend account for real invitation emails

## 3. Clone and Install Dependencies

From project root:

1. Install root dependencies if needed
2. Install server dependencies
3. Install client dependencies

Commands:

- npm --prefix server install
- npm --prefix client install

## 4. Configure Environment

## 4.1 Server Environment File

Create server/.env from server/.env.example.

Required values:

- PORT: API port, default 4000
- PUBLIC_APP_URL: base URL users open in browser
- LIVEKIT_API_KEY: must match LiveKit configuration
- LIVEKIT_API_SECRET: must match LiveKit configuration
- LIVEKIT_URL: ws://localhost:7880 for local, wss://... for production
- HOST_KEY: shared host key for host actions

Optional values:

- RESEND_API_KEY: required only for sending real emails
- MAIL_FROM: verified sender address for email invites

## 4.2 Local Defaults

The current local setup supports:

- PUBLIC_APP_URL as http://localhost:5173
- LIVEKIT_URL as ws://localhost:7880
- HOST_KEY as change-me-host-key for development only

## 5. Start Local Development

Start in three terminals:

Terminal A (LiveKit):

- livekit-server --config livekit.yaml

Terminal B (Server):

- cd server
- npm run dev

Terminal C (Client):

- cd client
- npm run dev -- --host

Open the browser at:

- http://localhost:5173

## 6. Quick Verification Checklist (Local)

Verify these endpoints:

- Client responds at http://localhost:5173
- API responds at http://localhost:4000/api/health
- LiveKit responds at http://localhost:7880

Verify in UI:

- Host can create webinar
- Host can start session
- Student can join with invite link
- Host sees attendee count increase

## 7. Production Deployment (Render + LiveKit Cloud)

Use render.yaml for one-service deployment.

Build command:

- npm run build

Start command:

- npm start

Set environment variables in Render:

- NODE_ENV = production
- LIVEKIT_URL = wss://<your-project>.livekit.cloud
- LIVEKIT_API_KEY = from LiveKit Cloud
- LIVEKIT_API_SECRET = from LiveKit Cloud
- HOST_KEY = long random secret, at least 20 characters
- RESEND_API_KEY = optional
- MAIL_FROM = verified sender address

Notes:

- In production, the server now validates security-critical settings at startup.
- Startup fails if HOST_KEY is default/weak, LIVEKIT_URL is not wss://, or PUBLIC_APP_URL is localhost.

## 8. Go-Live Dry Run

Before inviting real users:

1. Open public app URL on host device.
2. Create an Initiation Webinar.
3. Send invites to at least two test users.
4. Join from separate devices and separate networks if possible.
5. Verify audio, video, chat, and host moderation controls.
6. End session and confirm session state updates in dashboard.

## 9. Upgrade and Maintenance

- Keep Node version at 22.x for this project.
- Reinstall dependencies after major environment changes.
- Rotate HOST_KEY before each external demo cycle.
- If using email invites, keep MAIL_FROM domain verified and active.
