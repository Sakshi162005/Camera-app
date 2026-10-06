import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { users } from '../db.js';
import { signToken, authenticate } from '../middleware/auth.js';

const router = Router();

function validateCredentials(username, password) {
  if (typeof username !== 'string' || username.trim().length < 3) {
    return 'Username must be at least 3 characters';
  }
  if (typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
}

// Public self-registration: always creates a viewer account.
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    const err = validateCredentials(username, password);
    if (err) return res.status(400).json({ error: err });
    if (await users.findByUsername(username)) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await users.create({ username: username.trim(), passwordHash, role: 'viewer' });
    res.status(201).json({ user, token: signToken(user) });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    const user = username ? await users.findByUsernameWithHash(username) : null;
    const ok = user && (await bcrypt.compare(String(password ?? ''), user.passwordHash));
    if (!ok) return res.status(401).json({ error: 'Invalid username or password' });
    const { passwordHash, ...safe } = user;
    res.json({ user: safe, token: signToken(safe) });
  } catch (e) { next(e); }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await users.findById(req.user.sub);
    if (!user) return res.status(401).json({ error: 'User no longer exists' });
    res.json({ user });
  } catch (e) { next(e); }
});

export default router;
