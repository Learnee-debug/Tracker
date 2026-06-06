import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { requireAuth } from '../middleware/requireAuth';
import type { AuthResponse, User as UserType } from 'shared/types';

const router = Router();

// ─── Validation schemas ────────────────────────────────────────────────────────

const credentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ─── Token helpers ─────────────────────────────────────────────────────────────

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const REFRESH_COOKIE_NAME = 'refresh_token';

function signAccessToken(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  return jwt.sign({ userId, email }, secret, { expiresIn: ACCESS_TOKEN_TTL });
}

function signRefreshToken(userId: string): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET not set');
  return jwt.sign({ userId }, secret, { expiresIn: REFRESH_TOKEN_TTL });
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/api/auth',                // restrict cookie scope to auth endpoints
  });
}

// ─── POST /api/auth/register ───────────────────────────────────────────────────

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: parsed.error.errors[0].message });
      return;
    }

    const { email, password } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ ok: false, error: 'An account with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash });

    const accessToken = signAccessToken(user._id.toString(), user.email);
    const refreshToken = signRefreshToken(user._id.toString());

    // Store hash of refresh token — never the token itself
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    setRefreshCookie(res, refreshToken);

    const response: AuthResponse = {
      accessToken,
      user: { id: user._id.toString(), email: user.email, createdAt: user.createdAt.toISOString() },
    };

    res.status(201).json({ ok: true, data: response });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────────

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: parsed.error.errors[0].message });
      return;
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) {
      // Same error message for both "user not found" and "wrong password".
      // Never reveal which one failed — prevents user enumeration.
      res.status(401).json({ ok: false, error: 'Invalid email or password' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({ ok: false, error: 'Invalid email or password' });
      return;
    }

    const accessToken = signAccessToken(user._id.toString(), user.email);
    const refreshToken = signRefreshToken(user._id.toString());

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    setRefreshCookie(res, refreshToken);

    const response: AuthResponse = {
      accessToken,
      user: { id: user._id.toString(), email: user.email, createdAt: user.createdAt.toISOString() },
    };

    res.status(200).json({ ok: true, data: response });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/refresh ────────────────────────────────────────────────────

router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token: string | undefined = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) {
      res.status(401).json({ ok: false, error: 'No refresh token' });
      return;
    }

    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error('JWT_REFRESH_SECRET not set');

    let payload: { userId: string };
    try {
      payload = jwt.verify(token, secret) as { userId: string };
    } catch {
      res.status(401).json({ ok: false, error: 'Invalid or expired refresh token' });
      return;
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.refreshTokenHash) {
      res.status(401).json({ ok: false, error: 'Session not found' });
      return;
    }

    const tokenMatch = await bcrypt.compare(token, user.refreshTokenHash);
    if (!tokenMatch) {
      // Token reuse detected — invalidate all sessions for this user
      user.refreshTokenHash = null;
      await user.save();
      res.status(401).json({ ok: false, error: 'Token reuse detected. Please log in again.' });
      return;
    }

    // Rotate: issue new pair
    const newAccessToken = signAccessToken(user._id.toString(), user.email);
    const newRefreshToken = signRefreshToken(user._id.toString());

    user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    await user.save();

    setRefreshCookie(res, newRefreshToken);

    const userData: UserType = {
      id: user._id.toString(),
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };

    res.status(200).json({ ok: true, data: { accessToken: newAccessToken, user: userData } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

router.post('/logout', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (user) {
      user.refreshTokenHash = null;
      await user.save();
    }

    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
    res.status(200).json({ ok: true, data: null });
  } catch (err) {
    next(err);
  }
});

export default router;
