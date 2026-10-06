import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { users } from '../db.js';
import { ROLES } from '../config.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Every user-management route is admin only.
router.use(authenticate, authorize('admin'));

router.get('/', async (_req, res, next) => {
  try { res.json({ users: await users.all() }); } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { username, password, role = 'viewer' } = req.body || {};
    if (typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role' });
    if (await users.findByUsername(username)) return res.status(409).json({ error: 'Username already taken' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await users.create({ username: username.trim(), passwordHash, role });
    res.status(201).json({ user });
  } catch (e) { next(e); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const target = await users.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });
    const patch = {};
    const { role, password } = req.body || {};
    if (role !== undefined) {
      if (!ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role' });
      if (target.id === req.user.sub && role !== 'admin') {
        return res.status(400).json({ error: 'You cannot remove your own admin role' });
      }
      patch.role = role;
    }
    if (password !== undefined) {
      if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      patch.passwordHash = await bcrypt.hash(password, 10);
    }
    res.json({ user: await users.update(target.id, patch) });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user.sub) {
      return res.status(400).json({ error: 'You cannot delete yourself' });
    }
    if (!(await users.remove(req.params.id))) return res.status(404).json({ error: 'User not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
