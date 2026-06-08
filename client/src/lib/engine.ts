// ─────────────────────────────────────────────────────────────────────────────
// Career OS — pure business logic engine.
//
// Rules for this file:
//   1. Every function is pure — same inputs, same output. No side effects.
//   2. No DOM access. No React. No imports from store or API.
//   3. Every function that existed in v3 has a corresponding test.
//   4. Types come from shared/types or local data — nothing else.
//
// This separation means the core logic is testable in isolation and can be
// reused anywhere (server-side validation, CLI scripts, future mobile app).
// ─────────────────────────────────────────────────────────────────────────────

import type { CareerState, CalDayState } from '@/types';
import { HX_DEFS, HX_ORDER } from '@/data/hxDefs';

// ─── Migration: hx record → taskIdx ──────────────────────────────────────────
// Converts legacy hx: Record<taskId, boolean> to a linear task index.
// taskIdx = index of the first incomplete task in HX_ORDER sequence.
// Returns totalTasks when all tasks are complete; 0 when hx is empty.
// No progress is lost — all consecutively-completed tasks are preserved.

export function hxToTaskIdx(hx: Record<string, boolean>): number {
  let idx = 0;
  for (const sectionKey of HX_ORDER) {
    const section = HX_DEFS[sectionKey];
    for (const task of section.tasks) {
      if (!hx[task.id]) return idx;
      idx++;
    }
  }
  return idx;
}

// ─── DotState ─────────────────────────────────────────────────────────────────

export type DotState = 'done' | 'part' | 'miss' | 'fut';

// ─── get7Days ─────────────────────────────────────────────────────────────────
// Returns a 7-element array of dot states for the streak row.
// Oldest day is index 0; today is index 6.
// Today's status is derived from nnDoneCount (live NN state), not from cal,
// so the dot reflects the current session before the day is logged.
// Past days are read from cal; unlogged past days default to 'miss'.

export function get7Days(
  cal: CareerState['cal'],
  sprintDay: number,
  nnDoneCount: number,
): DotState[] {
  const result: DotState[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = sprintDay - i;
    if (day < 1) {
      result.push('fut');
      continue;
    }
    if (day === sprintDay) {
      // Today: always reflect live NN state
      result.push(nnDoneCount === 3 ? 'done' : nnDoneCount > 0 ? 'part' : 'miss');
    } else {
      const state: CalDayState = cal[`d${day}`] ?? '';
      result.push(
        state === 'good'    ? 'done' :
        state === 'partial' ? 'part' :
        state === 'miss'    ? 'miss' :
        'miss'  // unlogged past day = miss
      );
    }
  }
  return result;
}

// ─── METRIC TARGETS ──────────────────────────────────────────────────────────

export const METRIC_TARGETS = { owned: 130, commits: 60, mocks: 8 } as const;
export type PaceKey = keyof typeof METRIC_TARGETS;

// ─── pace ─────────────────────────────────────────────────────────────────────
// Returns pace label and style class for a metric tile.
// expected = round((target / 60) × sprintDay)
// "on pace" when actual ≥ expected; "X behind" otherwise.

export function pace(
  key: PaceKey,
  value: number,
  sprintDay: number,
): { txt: string; cls: 'ok' | 'behind' } {
  const target = METRIC_TARGETS[key];
  const expected = Math.round((target / 60) * sprintDay);
  if (value >= expected) return { txt: 'on pace', cls: 'ok' };
  return { txt: `${expected - value} behind`, cls: 'behind' };
}

// ─── calcStreak ───────────────────────────────────────────────────────────────
// Returns the current consecutive "good" day streak.
//
// v3 had two bugs:
//   1. A first loop that computed a result and immediately discarded it.
//   2. The actual loop broke on empty days (''), which means any unlogged
//      day (including today, before you mark it) reset the streak to 0.
//
// Fix: iterate backward from sprintDay, skip unlogged days (continue),
// stop only on 'partial' or 'miss' (genuine streak-breakers).

export function calcStreak(
  cal: CareerState['cal'],
  sprintDay: number
): number {
  let streak = 0;
  for (let i = sprintDay; i >= 1; i--) {
    const state: CalDayState = cal[`d${i}`] ?? '';
    if (state === 'good') {
      streak++;
    } else if (state === '') {
      // Unlogged day — skip it, don't break the streak.
      // Today is always unlogged until the user marks it.
      continue;
    } else {
      // 'partial' or 'miss' ends the streak.
      break;
    }
  }
  return streak;
}

// ─── getSprintDay ─────────────────────────────────────────────────────────────
// Returns the current sprint day (1–60) or null if sprint hasn't started.
// Pure — takes the sprint start string rather than reading from state directly.

export function getSprintDay(sprintStart: string): number | null {
  if (!sprintStart) return null;
  const start = new Date(sprintStart);
  if (isNaN(start.getTime())) return null;
  const now = new Date();
  // Zero out time components to get whole-day difference
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const day = diffDays + 1;
  if (day < 1) return null;   // sprint hasn't started yet
  return Math.min(60, day);
}
