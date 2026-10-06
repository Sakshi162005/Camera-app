import http from 'node:http';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { migrate, users, pool } from './db.js';
import { seedCameras } from './stream/cameras.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import cameraRoutes from './routes/cameras.js';
import { attachWebSocketServer } from './stream/wsServer.js';
import { streamManager } from './stream/streamer.js';

const app = express();
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'up' });
  } catch {
    res.status(503).json({ ok: false, db: 'down' });
  }
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cameras', cameraRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function seedAdmin() {
  if ((await users.count()) > 0) return;
  const passwordHash = await bcrypt.hash(config.adminPassword, 10);
  await users.create({ username: config.adminUsername, passwordHash, role: 'admin' });
  console.log(`[seed] created admin user "${config.adminUsername}"`);
}

try {
  await migrate();
  await seedAdmin();
  await seedCameras();
} catch (err) {
  console.error('[db] startup failed:', err.message);
  console.error('      check DATABASE_URL in server/.env');
  process.exit(1);
}

const server = http.createServer(app);
attachWebSocketServer(server);

server.listen(config.port, () => {
  console.log(`API + WebSocket listening on http://localhost:${config.port}`);
  console.log(`database: ${config.databaseUrl.replace(/:\/\/([^:]+):[^@]*@/, '://$1:***@')}`);
  console.log(`ffmpeg: ${config.ffmpegPath}`);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    streamManager.shutdown();
    server.close(() => pool.end().finally(() => process.exit(0)));
  });
}
