import 'dotenv/config';
import ffmpegStatic from 'ffmpeg-static';

export const config = {
  port: Number(process.env.PORT) || 4000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:@127.0.0.1:5432/camera_stream',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123',
  ffmpegPath: process.env.FFMPEG_PATH || ffmpegStatic,
};

export const ROLES = ['admin', 'viewer'];
export const CAMERA_TYPES = ['rtsp', 'http', 'dshow', 'v4l2', 'avfoundation', 'test'];
