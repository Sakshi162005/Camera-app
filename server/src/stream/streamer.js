// One FFmpeg process per camera: started on the first viewer, killed when the last viewer
// leaves. The MPEG-TS byte stream is fanned out to every connected WebSocket client.
import { spawn } from 'node:child_process';
import { config } from '../config.js';

function inputArgs(camera) {
  switch (camera.type) {
    case 'rtsp':
      return ['-rtsp_transport', 'tcp', '-i', camera.source];
    case 'dshow': // Windows webcam, e.g. "video=Integrated Camera"
      return ['-f', 'dshow', '-i', camera.source];
    case 'v4l2': // Linux webcam, e.g. "/dev/video0"
      return ['-f', 'v4l2', '-i', camera.source];
    case 'avfoundation': // macOS webcam, e.g. "0"
      return ['-f', 'avfoundation', '-framerate', '30', '-i', camera.source];
    case 'http': // MJPEG / HLS / any URL ffmpeg can read
      return ['-i', camera.source];
    case 'test':
    default:
      return ['-re', '-f', 'lavfi', '-i', 'testsrc=size=640x480:rate=25'];
  }
}

function buildArgs(camera) {
  return [
    '-hide_banner',
    '-loglevel', 'error',
    ...inputArgs(camera),
    '-f', 'mpegts',
    '-codec:v', 'mpeg1video', // the codec JSMpeg decodes in the browser
    '-s', '640x480',
    '-b:v', '1000k',
    '-r', '25',
    '-bf', '0',
    '-an',
    'pipe:1',
  ];
}

class StreamManager {
  constructor() {
    this.streams = new Map(); // cameraId -> { proc, clients: Set<WebSocket> }
    // Heartbeat: ping every client; terminate any that did not answer the previous ping.
    // Catches sockets that died without a close frame (dropped networks, dev-proxy ghosts).
    this.heartbeat = setInterval(() => {
      for (const [id, entry] of this.streams) {
        for (const ws of entry.clients) {
          if (ws.isAlive === false) {
            ws.terminate();
            this.removeClient(id, ws);
            continue;
          }
          ws.isAlive = false;
          try { ws.ping(); } catch { /* socket already gone */ }
        }
      }
    }, 10_000);
    this.heartbeat.unref();
  }

  isRunning(id) {
    return this.streams.has(id);
  }

  viewerCount(id) {
    const entry = this.streams.get(id);
    return entry ? entry.clients.size : 0;
  }

  addClient(camera, ws) {
    let entry = this.streams.get(camera.id);
    if (!entry) {
      entry = { proc: null, clients: new Set() };
      this.streams.set(camera.id, entry);
      this.start(camera, entry);
    }
    entry.clients.add(ws);
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    ws.on('close', () => this.removeClient(camera.id, ws));
    ws.on('error', () => this.removeClient(camera.id, ws));
  }

  removeClient(id, ws) {
    const entry = this.streams.get(id);
    if (!entry) return;
    entry.clients.delete(ws);
    if (entry.clients.size === 0) this.stop(id, entry);
  }

  start(camera, entry) {
    console.log(`[stream] starting ffmpeg for "${camera.id}"`);
    const proc = spawn(config.ffmpegPath, buildArgs(camera), { stdio: ['ignore', 'pipe', 'pipe'] });
    entry.proc = proc;

    proc.stdout.on('data', (chunk) => {
      for (const client of entry.clients) {
        if (client.readyState === client.OPEN) client.send(chunk);
      }
    });
    proc.stderr.on('data', (d) => console.error(`[ffmpeg:${camera.id}] ${String(d).trim()}`));
    proc.on('error', (err) => {
      console.error(`[stream] ffmpeg failed to start for "${camera.id}": ${err.message}`);
      this.closeAll(entry, 1011, 'ffmpeg failed to start');
      this.streams.delete(camera.id);
    });
    proc.on('exit', (code, signal) => {
      console.log(`[stream] ffmpeg for "${camera.id}" exited (${code ?? signal})`);
      if (this.streams.get(camera.id) === entry) {
        this.closeAll(entry, 1011, 'camera stream ended');
        this.streams.delete(camera.id);
      }
    });
  }

  stop(id, entry) {
    console.log(`[stream] no viewers left, stopping "${id}"`);
    this.streams.delete(id);
    if (entry.proc) entry.proc.kill('SIGKILL');
  }

  closeAll(entry, code, reason) {
    for (const client of entry.clients) {
      try { client.close(code, reason); } catch { /* ignore */ }
    }
    entry.clients.clear();
  }

  // Force-stop a camera (after it is edited or deleted); viewers are disconnected.
  stopCamera(id) {
    const entry = this.streams.get(id);
    if (!entry) return;
    this.streams.delete(id);
    this.closeAll(entry, 1001, 'camera changed');
    if (entry.proc) entry.proc.kill('SIGKILL');
  }

  shutdown() {
    for (const [id, entry] of this.streams) this.stop(id, entry);
  }
}

export const streamManager = new StreamManager();
