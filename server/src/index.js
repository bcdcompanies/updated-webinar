import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { dirname, join as pathJoin } from 'node:path';
import { existsSync } from 'node:fs';
import { config } from './config.js';
import './db.js'; // initialize schema
import { webinars } from './routes/webinars.js';
import { join as joinRoutes } from './routes/join.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors({ origin: config.publicAppUrl }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    emailEnabled: !!config.email.resendApiKey,
    emailFrom: config.email.from,
  });
});

app.use('/api/webinars', webinars);
app.use('/api/join', joinRoutes);

// In production, serve the built React app from the same origin (single-service
// deploy). `npm run build` at the repo root produces client/dist.
const clientDist = pathJoin(__dirname, '..', '..', 'client', 'dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback: any non-API route returns index.html so React Router handles
  // client-side paths like /join/:token on a full page load.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(pathJoin(clientDist, 'index.html'));
  });
  console.log('Serving built client from', clientDist);
}

// Fallthrough error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
  console.log(`Public app URL: ${config.publicAppUrl}`);
  console.log(`LiveKit URL: ${config.livekit.url}`);
  console.log(`Email sending: ${config.email.resendApiKey ? 'enabled (Resend)' : 'DISABLED (links logged to console)'}`);
});
