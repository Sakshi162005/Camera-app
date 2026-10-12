import 'dotenv/config';
import fs from 'node:fs';
import ffmpegStatic from 'ffmpeg-static';

function getFfmpegPath() {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  if (process.platform === 'linux' && fs.existsSync('/usr/bin/ffmpeg')) {
    return '/usr/bin/ffmpeg';
  }
  return ffmpegStatic;
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:@127.0.0.1:5432/camera_stream',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123',
  ffmpegPath: getFfmpegPath(),
};

export const ROLES = ['admin', 'viewer'];
export const CAMERA_TYPES = ['rtsp', 'http', 'dshow', 'v4l2', 'avfoundation', 'test'];
