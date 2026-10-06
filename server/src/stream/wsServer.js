// WebSocket endpoint: ws://host/ws/stream/:cameraId?token=<JWT>
// Browsers cannot set headers on a WebSocket upgrade, so the JWT travels as a query param.
import { WebSocketServer } from 'ws';
import { verifyToken } from '../middleware/auth.js';
import { cameras, canAccessCamera } from './cameras.js';
import { streamManager } from './streamer.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function reject(socket, status, text) {
  socket.write(`HTTP/1.1 ${status} ${text}\r\nConnection: close\r\n\r\n`);
  socket.destroy();
}

export function attachWebSocketServer(httpServer) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', async (req, socket, head) => {
    const url = new URL(req.url, 'http://localhost');
    const match = url.pathname.match(/^\/ws\/stream\/([^/]+)$/);
    if (!match) return reject(socket, 404, 'Not Found');

    let user;
    try {
      user = verifyToken(url.searchParams.get('token') || '');
    } catch {
      return reject(socket, 401, 'Unauthorized');
    }

    const id = decodeURIComponent(match[1]);
    if (!UUID_RE.test(id)) return reject(socket, 404, 'Camera not found');

    let camera;
    try {
      camera = await cameras.findById(id);
    } catch (err) {
      console.error('[ws] db error', err.message);
      return reject(socket, 500, 'Internal Server Error');
    }
    if (!camera) return reject(socket, 404, 'Camera not found');
    if (!canAccessCamera(camera, user.role)) return reject(socket, 403, 'Forbidden');

    wss.handleUpgrade(req, socket, head, (ws) => {
      console.log(`[ws] ${user.username} watching "${camera.name}"`);
      streamManager.addClient(camera, ws);
    });
  });

  return wss;
}
