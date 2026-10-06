import { cameras } from '../db.js';
import { CAMERA_TYPES } from '../config.js';

export const canAccessCamera = (camera, role) =>
  role === 'admin' || (camera.roles || []).includes(role);

// Guess the stream type from the URL so the add-camera form only needs a name and a URL.
export function detectType(source) {
  const s = String(source || '').trim();
  if (!s || /^test$/i.test(s)) return 'test';
  if (/^rtsps?:\/\//i.test(s)) return 'rtsp';
  if (/^https?:\/\//i.test(s)) return 'http';
  if (/^video=/i.test(s)) return 'dshow';
  if (/^\/dev\/video/i.test(s)) return 'v4l2';
  if (/^\d+(:\d+)?$/.test(s)) return 'avfoundation';
  return 'http';
}

// Returns { value } or { error }.
export function validateCameraInput(body, { partial = false } = {}) {
  const out = {};
  const { name, source, type, group, roles } = body || {};

  if (name !== undefined || !partial) {
    if (typeof name !== 'string' || name.trim().length < 2) return { error: 'Name must be at least 2 characters' };
    out.name = name.trim();
  }
  if (source !== undefined || !partial) {
    if (typeof source !== 'string') return { error: 'Source URL is required' };
    out.source = source.trim();
  }
  if (type !== undefined && type !== '' && type !== null) {
    if (!CAMERA_TYPES.includes(type)) return { error: `Type must be one of ${CAMERA_TYPES.join(', ')}` };
    out.type = type;
  } else if (!partial || source !== undefined) {
    out.type = detectType(out.source);
  }
  if (out.type && out.type !== 'test' && out.source === '') {
    return { error: 'Source URL is required for this camera type' };
  }
  if (group !== undefined) {
    if (typeof group !== 'string') return { error: 'Group must be text' };
    out.group = group.split('/').map((p) => p.trim()).filter(Boolean).join('/');
  } else if (!partial) {
    out.group = '';
  }
  if (roles !== undefined) {
    if (!Array.isArray(roles) || !roles.every((r) => ['admin', 'viewer'].includes(r))) {
      return { error: 'Roles must be a list of admin/viewer' };
    }
    out.roles = Array.from(new Set(['admin', ...roles]));
  } else if (!partial) {
    out.roles = ['admin', 'viewer'];
  }
  return { value: out };
}

// Create a demo camera on an empty database so streaming can be tested without hardware.
export async function seedCameras() {
  if ((await cameras.count()) > 0) return;
  await cameras.create({
    name: 'Demo test pattern',
    type: 'test',
    source: '',
    group: 'Demo',
    roles: ['admin', 'viewer'],
  });
  console.log('[seed] created demo camera');
}

export { cameras };
