import { Router, Request, Response } from 'express';
import { User } from '../models/User';

const router = Router();

// One-time user wipe. Protected by RESET_SECRET env var.
// Set RESET_SECRET in Railway vars, call once, then delete this file.
router.post('/', async (req: Request, res: Response) => {
  const secret = process.env.RESET_SECRET;
  if (!secret || req.headers['x-reset-secret'] !== secret) {
    res.status(403).json({ ok: false, error: 'Forbidden' });
    return;
  }

  const count = await User.countDocuments();
  await User.deleteMany({});
  res.json({ ok: true, deleted: count, next: 'Register via the app now' });
});

export default router;
