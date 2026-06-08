import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { User, DEFAULT_CAREER_STATE } from '../models/User';
import { requireAuth } from '../middleware/requireAuth';
import type { CareerState } from 'shared/types';

const router = Router();

// All state routes require authentication.
router.use(requireAuth);

// ─── Zod schema for CareerState ───────────────────────────────────────────────
// Used in both directions:
//   PUT — validate incoming data before writing (reject bad input)
//   GET — validate outgoing data before sending (self-heal on schema drift)

const scoreSchema = z.object({
  solved:  z.number().int().min(0),
  owned:   z.number().int().min(0),
  verbal:  z.number().int().min(0),
  commits: z.number().int().min(0),
  mocks:   z.number().int().min(0),
  lc:      z.number().int().min(0),
  apps:    z.number().int().min(0),
  oss:     z.number().int().min(0),
});

const nonNegotiablesSchema = z.object({
  d1: z.boolean(),
  d2: z.boolean(),
  d3: z.boolean(),
});

const weeklyEntrySchema = z.object({
  id:         z.string(),
  date:       z.string(),
  score:      z.number().int().min(0).max(100).optional(),
  dsa:        z.string().optional(),
  avoid:      z.string(),
  constraint: z.string().optional(),
  change:     z.string(),
});

const pipelineEntrySchema = z.object({
  id:     z.string(),
  co:     z.string().max(100),
  status: z.enum(['Target', 'Researching', 'Applying', 'OA Done', 'Interview', 'Offer', 'Rejected']),
  notes:  z.string().max(500),
  date:   z.string(),
});

export const careerStateSchema = z.object({
  score:         scoreSchema,
  nn:            nonNegotiablesSchema,
  nnDate:        z.string(),
  hx:            z.record(z.boolean()),
  taskIdx:       z.number().int().min(0),
  focusDSA:      z.string(),
  skills:        z.array(z.boolean()).max(20),
  cal:           z.record(z.enum(['good', 'partial', 'miss', ''])),
  sprintStart:   z.string(),
  weeklyHistory: z.array(weeklyEntrySchema).max(52),
  pipeline:      z.array(pipelineEntrySchema).max(200),
  coNotes:       z.record(z.string().max(500)),
});

// ─── safeReadState ────────────────────────────────────────────────────────────
// Validates stored state before sending to client.
//
// Why this exists: user.state is stored as Schema.Types.Mixed in MongoDB.
// Mongoose types it as `unknown`. A bare `as CareerState` cast is unguarded —
// if stored data has drifted from the current schema (manual DB edit, future
// migration, or a field rename), the client would receive corrupt data and
// crash silently.
//
// Strategy: parse the stored value through Zod.
//   - Parse succeeds → return the Zod-parsed (structurally guaranteed) data.
//   - Parse fails → merge stored data with DEFAULT_CAREER_STATE field-by-field.
//     Missing or invalid fields are replaced with defaults. Valid fields survive.
//     The merged result is then written back to the DB so the next GET is clean.
//
// Result: the client always receives a usable CareerState, even after a schema
// migration. No silent crashes, no data loss for fields that are still valid.

function safeReadState(raw: unknown): CareerState {
  // Happy path — stored data matches current schema exactly.
  const parsed = careerStateSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  // Schema drift path — merge stored data with defaults for any invalid fields.
  // Top-level merge only: this covers the cases we'll actually encounter
  // (new top-level field added, field type changed).
  if (raw !== null && typeof raw === 'object') {
    const stored = raw as Partial<CareerState>;
    const merged: CareerState = {
      score:         scoreSchema.safeParse(stored.score).success
                       ? (stored.score as CareerState['score'])
                       : DEFAULT_CAREER_STATE.score,
      nn:            nonNegotiablesSchema.safeParse(stored.nn).success
                       ? (stored.nn as CareerState['nn'])
                       : DEFAULT_CAREER_STATE.nn,
      nnDate:        typeof stored.nnDate === 'string' ? stored.nnDate : '',
      hx:            stored.hx && typeof stored.hx === 'object' ? stored.hx as Record<string, boolean> : {},
      taskIdx:       typeof stored.taskIdx === 'number' ? stored.taskIdx : 0,
      focusDSA:      typeof stored.focusDSA === 'string' ? stored.focusDSA : '',
      skills:        Array.isArray(stored.skills) ? stored.skills as boolean[] : Array(15).fill(false),
      cal:           stored.cal && typeof stored.cal === 'object' ? stored.cal : {},
      sprintStart:   typeof stored.sprintStart === 'string' ? stored.sprintStart : '',
      weeklyHistory: Array.isArray(stored.weeklyHistory)
                       ? stored.weeklyHistory.filter(e => weeklyEntrySchema.safeParse(e).success)
                       : [],
      pipeline:      Array.isArray(stored.pipeline)
                       ? stored.pipeline.filter(e => pipelineEntrySchema.safeParse(e).success)
                       : [],
      coNotes:       stored.coNotes && typeof stored.coNotes === 'object' ? stored.coNotes as Record<string, string> : {},
    };

    if (process.env.NODE_ENV !== 'production') {
      console.warn('[state] Schema drift detected — merged stored state with defaults');
    }

    return merged;
  }

  // Unrecoverable — stored value is not an object at all.
  console.error('[state] Stored state is not an object — returning defaults');
  return { ...DEFAULT_CAREER_STATE };
}

// ─── GET /api/state ────────────────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.userId).lean();
    if (!user) {
      res.status(404).json({ ok: false, error: 'User not found' });
      return;
    }

    // safeReadState validates the stored value and self-heals on schema drift.
    // No bare `as CareerState` cast — structural guarantee enforced by Zod.
    const state = safeReadState(user.state);

    // If we had to repair the state, write the fixed version back immediately
    // so subsequent GETs don't re-trigger the repair path.
    const parsed = careerStateSchema.safeParse(user.state);
    if (!parsed.success) {
      await User.findByIdAndUpdate(
        req.user!.userId,
        { $set: { state } },
        { lean: true }
      );
    }

    res.status(200).json({ ok: true, data: state });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/state ────────────────────────────────────────────────────────────
// Replace the entire state document. The client owns the state; the server is a
// durable store. No partial updates, no merge logic on write.

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

    // safeReadState on the written-back value — ensures PUT response is also
    // structurally guaranteed, not a raw cast.
    const state = safeReadState(updated.state);
    res.status(200).json({ ok: true, data: state });
  } catch (err) {
    next(err);
  }
});

export default router;
