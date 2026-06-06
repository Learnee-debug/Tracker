import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { requireAuth } from '../middleware/requireAuth';
import type { CareerState } from 'shared/types';

const router = Router();

// All state routes require authentication.
router.use(requireAuth);

// ─── Zod schema for CareerState ───────────────────────────────────────────────
// We validate the shape coming in — we don't trust the client to send anything.
// Using z.record() for flexible sub-objects keeps this maintainable without
// enumerating every possible key.

const scoreSchema = z.object({
  solved: z.number().int().min(0),
  owned: z.number().int().min(0),
  verbal: z.number().int().min(0),
  commits: z.number().int().min(0),
  mocks: z.number().int().min(0),
  lc: z.number().int().min(0),
  apps: z.number().int().min(0),
  oss: z.number().int().min(0),
});

const nonNegotiablesSchema = z.object({
  d1: z.boolean(),
  d2: z.boolean(),
  d3: z.boolean(),
});

const weeklyEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  score: z.number().int().min(0).max(100),
  avoid: z.string(),
  change: z.string(),
});

const pipelineEntrySchema = z.object({
  id: z.string(),
  co: z.string().max(100),
  status: z.enum(['Target', 'Researching', 'Applying', 'OA Done', 'Interview', 'Offer', 'Rejected']),
  notes: z.string().max(500),
  date: z.string(),
});

const careerStateSchema = z.object({
  score: scoreSchema,
  nn: nonNegotiablesSchema,
  nnDate: z.string(),
  risks: z.record(z.boolean()),
  verify: z.record(z.boolean()),
  hx: z.record(z.boolean()),
  cal: z.record(z.enum(['good', 'partial', 'miss', ''])),
  sprintStart: z.string(),
  weeklyHistory: z.array(weeklyEntrySchema).max(52),
  pipeline: z.array(pipelineEntrySchema).max(200),
  coNotes: z.record(z.string().max(500)),
});

// ─── GET /api/state ────────────────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.userId).lean();
    if (!user) {
      res.status(404).json({ ok: false, error: 'User not found' });
      return;
    }

    res.status(200).json({ ok: true, data: user.state as CareerState });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/state ────────────────────────────────────────────────────────────
// Replace the entire state document. This is intentional — the client owns the
// state; the server is a durable store. No partial updates, no merge logic.

router.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = careerStateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        ok: false,
        error: `Invalid state: ${parsed.error.errors[0].message}`,
      });
      return;
    }

    const updated = await User.findByIdAndUpdate(
      req.user!.userId,
      { $set: { state: parsed.data } },
      { new: true, lean: true }
    );

    if (!updated) {
      res.status(404).json({ ok: false, error: 'User not found' });
      return;
    }

    res.status(200).json({ ok: true, data: updated.state as CareerState });
  } catch (err) {
    next(err);
  }
});

export default router;
