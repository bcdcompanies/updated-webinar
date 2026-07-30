# Troubleshooting Guide

This guide covers common setup and runtime issues for local and production environments.

## 1. Host Sign-In Keeps Appearing

Symptoms:

- Dashboard does not load
- Invalid host key error

Checks:

1. Confirm HOST_KEY in server environment.
2. Confirm client is targeting correct API origin.
3. Use Reset local auth on sign-in page.

Local note:

- Development mode includes automatic fallback to change-me-host-key.

## 2. Invite Emails Not Sent

Symptoms:

- Send result shows not emailed
- Console shows email disabled

Checks:

1. Set RESEND_API_KEY.
2. Set MAIL_FROM to verified domain sender.
3. Confirm outbound provider status.

Fallback:

- Share join links manually from send results or invited list.

## 3. Students Cannot Join Room

Symptoms:

- Join page loads but cannot connect
- Room appears stuck on connecting

Checks:

1. Confirm LIVEKIT_URL is reachable.
2. Local dev should use ws://localhost:7880.
3. Production should use wss://... .
4. Confirm LIVEKIT_API_KEY and LIVEKIT_API_SECRET match LiveKit project.

## 4. Browser Camera/Mic Permission Errors

Symptoms:

- Host cannot publish media
- Permission denied warning in console

Checks:

1. Grant browser camera and microphone permission.
2. Reload room after permission grant.
3. Use HTTPS in production; media permissions may fail on insecure contexts.

## 5. Native Module Errors for better-sqlite3

Symptoms:

- Could not locate bindings file
- Node-gyp build errors

Cause:

- Node version mismatch with installed native module binary.

Fix:

1. Use Node 22.x for this project.
2. Reinstall server dependencies under Node 22.
3. If required, reinstall better-sqlite3 package.

## 6. Production Startup Fails Immediately

Symptoms:

- App exits on boot with config error

Likely reasons:

1. HOST_KEY too weak or still default.
2. PUBLIC_APP_URL resolves to localhost.
3. LIVEKIT_URL is not wss:// in production.

Action:

- Correct environment variables and redeploy.

## 7. CORS or API Access Errors

Symptoms:

- API 401, 403, or CORS errors in browser console

Checks:

1. Confirm PUBLIC_APP_URL matches browser origin.
2. Confirm host requests send x-host-key.
3. Confirm proxy or CDN is not stripping headers.

## 8. Session Works Locally but Not for Public Users

Common causes:

1. Localhost links sent to external users.
2. LiveKit set to ws:// instead of wss://.
3. Firewall or network restrictions.

Action plan:

1. Use public HTTPS app URL.
2. Use LiveKit Cloud or public LiveKit deployment with TLS.
3. Retest from external network.

## 9. Fast Diagnostic Commands

From project root:

- Check client: curl -I http://localhost:5173
- Check API: curl -I http://localhost:4000/api/health
- Check LiveKit: curl -I http://localhost:7880

If all return healthy responses but UI fails, inspect browser console and network panel.
