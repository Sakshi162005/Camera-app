import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { cameras, canAccessCamera, validateCameraInput } from '../stream/cameras.js';
import { streamManager } from '../stream/streamer.js';

const router = Router();
router.use(authenticate);

const withStatus = (c) => ({
  ...c,
  live: streamManager.isRunning(c.id),
  viewers: streamManager.viewerCount(c.id),
});

// Cameras the caller's role may view.
router.get('/', async (req, res, next) => {
  try {
    const all = await cameras.all();
    res.json({ cameras: all.filter((c) => canAccessCamera(c, req.user.role)).map(withStatus) });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const cam = await cameras.findById(req.params.id);
    if (!cam) return res.status(404).json({ error: 'Camera not found' });
    if (!canAccessCamera(cam, req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    res.json({ camera: withStatus(cam), wsPath: `/ws/stream/${cam.id}` });
  } catch (e) { next(e); }
});

// Admin only: add, edit, delete cameras.
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const { value, error } = validateCameraInput(req.body);
    if (error) return res.status(400).json({ error });
    const cam = await cameras.create({ ...value, createdBy: req.user.sub });
    res.status(201).json({ camera: withStatus(cam) });
  } catch (e) { next(e); }
});

router.put('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const { value, error } = validateCameraInput(req.body, { partial: true });
    if (error) return res.status(400).json({ error });
    const cam = await cameras.update(req.params.id, value);
    if (!cam) return res.status(404).json({ error: 'Camera not found' });
    streamManager.stopCamera(cam.id); // viewers reconnect with the new settings
    res.json({ camera: withStatus(cam) });
  } catch (e) { next(e); }
});

router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const ok = await cameras.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Camera not found' });
    streamManager.stopCamera(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
