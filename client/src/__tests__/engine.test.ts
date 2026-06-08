// ─────────────────────────────────────────────────────────────────────────────
// Engine unit tests — Vitest
//
// Every pure function in engine.ts has coverage here.
// Tests are organized by function, with edge cases documented inline.
// No mocking needed — all functions are pure with no external dependencies.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
  calcStreak,
  getSprintDay,
  hxToTaskIdx,
  get7Days,
  pace,
} from '../lib/engine';
import { HX_DEFS, HX_ORDER } from '../data/hxDefs';
import type { CareerState } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeHx(checked: string[]): CareerState['hx'] {
  return Object.fromEntries(checked.map((k) => [k, true]));
}

function makeCal(entries: Record<string, 'good' | 'partial' | 'miss'>): CareerState['cal'] {
  return entries;
}

// ─────────────────────────────────────────────────────────────────────────────
// calcStreak
// ─────────────────────────────────────────────────────────────────────────────

describe('calcStreak', () => {
  it('returns 0 when no days are logged', () => {
    expect(calcStreak({}, 10)).toBe(0);
  });

  it('returns 0 when the sprint has not started (sprintDay = 0)', () => {
    const cal = makeCal({ d1: 'good', d2: 'good' });
    expect(calcStreak(cal, 0)).toBe(0);
  });

  it('counts consecutive good days from current day backward', () => {
    const cal = makeCal({ d1: 'good', d2: 'good', d3: 'good' });
    expect(calcStreak(cal, 3)).toBe(3);
  });

  it('stops counting at a miss', () => {
    const cal = makeCal({ d1: 'good', d2: 'miss', d3: 'good', d4: 'good' });
    expect(calcStreak(cal, 4)).toBe(2);
  });

  it('stops counting at a partial', () => {
    const cal = makeCal({ d1: 'good', d2: 'partial', d3: 'good' });
    expect(calcStreak(cal, 3)).toBe(1);
  });

  // ── THE KEY BUG FIX TEST ──────────────────────────────────────────────────
  // v3 broke streak to 0 when today's day was unlogged (the most common case:
  // it's morning and you haven't marked today yet). This test verifies the fix.

  it('skips unlogged days — streak is not broken by empty calendar slots', () => {
    // Days 1–4 are good. Day 5 (today) is unlogged.
    const cal = makeCal({ d1: 'good', d2: 'good', d3: 'good', d4: 'good' });
    // Sprint day is 5 but d5 is empty — should still return 4
    expect(calcStreak(cal, 5)).toBe(4);
  });

  it('skips multiple unlogged days to find the streak', () => {
    // Days 1–3 are good. Days 4 and 5 are unlogged (weekend, no entry).
    const cal = makeCal({ d1: 'good', d2: 'good', d3: 'good' });
    expect(calcStreak(cal, 5)).toBe(3);
  });

  it('returns 0 when the most recent logged day was a miss', () => {
    const cal = makeCal({ d1: 'good', d2: 'good', d3: 'miss' });
    expect(calcStreak(cal, 4)).toBe(0);
  });

  it('handles sprint day 1 with unlogged day correctly', () => {
    expect(calcStreak({}, 1)).toBe(0);
  });

  it('handles sprint day 1 with a good day', () => {
    const cal = makeCal({ d1: 'good' });
    expect(calcStreak(cal, 1)).toBe(1);
  });

  it('returns 0 if all days are partial', () => {
    const cal = makeCal({ d1: 'partial', d2: 'partial', d3: 'partial' });
    expect(calcStreak(cal, 3)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getSprintDay
// ─────────────────────────────────────────────────────────────────────────────

describe('getSprintDay', () => {
  it('returns null for empty string', () => {
    expect(getSprintDay('')).toBeNull();
  });

  it('returns null for invalid date string', () => {
    expect(getSprintDay('not-a-date')).toBeNull();
  });

  it('returns null if sprint start is in the future', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(getSprintDay(tomorrow.toISOString())).toBeNull();
  });

  it('returns 1 for today as sprint start', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(getSprintDay(today)).toBe(1);
  });

  it('returns correct day for a past start date', () => {
    const past = new Date();
    past.setDate(past.getDate() - 4); // 5 days ago → day 5
    const result = getSprintDay(past.toISOString().split('T')[0]);
    expect(result).toBe(5);
  });

  it('caps at 60 for sprints past their end date', () => {
    const longAgo = new Date();
    longAgo.setDate(longAgo.getDate() - 100); // 101 days ago
    const result = getSprintDay(longAgo.toISOString().split('T')[0]);
    expect(result).toBe(60);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// hxToTaskIdx
// ─────────────────────────────────────────────────────────────────────────────

describe('hxToTaskIdx', () => {
  it('returns 0 when hx is empty', () => {
    expect(hxToTaskIdx({})).toBe(0);
  });

  it('returns 7 when all 7 database tasks are done', () => {
    const hx = makeHx(['db1','db2','db3','db4','db5','db6','db7']);
    expect(hxToTaskIdx(hx)).toBe(7);
  });

  it('returns 3 when first 3 tasks are done and 4th is not', () => {
    const hx = makeHx(['db1','db2','db3']);
    expect(hxToTaskIdx(hx)).toBe(3);
  });

  it('returns totalTasks when all tasks are complete', () => {
    const allIds: string[] = [];
    for (const key of HX_ORDER) {
      HX_DEFS[key].tasks.forEach((t) => allIds.push(t.id));
    }
    const total = HX_ORDER.reduce((acc, k) => acc + HX_DEFS[k].tasks.length, 0);
    expect(hxToTaskIdx(makeHx(allIds))).toBe(total);
  });

  it('stops at first incomplete task even if later tasks are marked done', () => {
    // db1 done, db2 NOT done, db3 done — should stop at index 1
    const hx = makeHx(['db1', 'db3']);
    expect(hxToTaskIdx(hx)).toBe(1);
  });

  it('handles false values as incomplete', () => {
    const hx: Record<string, boolean> = { db1: true, db2: false, db3: true };
    expect(hxToTaskIdx(hx)).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// get7Days
// ─────────────────────────────────────────────────────────────────────────────

describe('get7Days', () => {
  it('returns 7 elements always', () => {
    expect(get7Days({}, 5, 0)).toHaveLength(7);
  });

  it('returns fut for days before sprint start', () => {
    const result = get7Days({}, 2, 0);
    // sprintDay=2: days visible are [-4,-3,-2,-1,0,1,2]
    // day < 1 → fut for indices 0-4 (days -4 to 0)
    expect(result[0]).toBe('fut');
    expect(result[4]).toBe('fut');
  });

  it('today dot reflects nnDoneCount=3 as done', () => {
    const result = get7Days({}, 10, 3);
    expect(result[6]).toBe('done');
  });

  it('today dot reflects nnDoneCount=1 as part', () => {
    const result = get7Days({}, 10, 1);
    expect(result[6]).toBe('part');
  });

  it('today dot reflects nnDoneCount=0 as miss', () => {
    const result = get7Days({}, 10, 0);
    expect(result[6]).toBe('miss');
  });

  it('reads past days from cal', () => {
    const cal = { d9: 'good' as const, d8: 'partial' as const, d7: 'miss' as const };
    const result = get7Days(cal, 10, 0);
    expect(result[5]).toBe('done');   // d9 = good → done
    expect(result[4]).toBe('part');   // d8 = partial → part
    expect(result[3]).toBe('miss');   // d7 = miss → miss
  });

  it('unlogged past days default to miss', () => {
    const result = get7Days({}, 10, 0);
    // All past days unlogged → miss
    for (let i = 0; i < 6; i++) expect(result[i]).toBe('miss');
  });

  it('sprint day 1 has 6 fut dots and today dot', () => {
    const result = get7Days({}, 1, 3);
    expect(result.filter((d) => d === 'fut')).toHaveLength(6);
    expect(result[6]).toBe('done');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// pace
// ─────────────────────────────────────────────────────────────────────────────

describe('pace', () => {
  it('returns on pace when value equals expected', () => {
    // owned target=130, day 30 → expected = round(130/60*30) = 65
    const result = pace('owned', 65, 30);
    expect(result.cls).toBe('ok');
    expect(result.txt).toBe('on pace');
  });

  it('returns on pace when value exceeds expected', () => {
    expect(pace('owned', 100, 30).cls).toBe('ok');
  });

  it('returns behind when value is below expected', () => {
    // owned target=130, day 30 → expected=65, value=50 → 15 behind
    const result = pace('owned', 50, 30);
    expect(result.cls).toBe('behind');
    expect(result.txt).toBe('15 behind');
  });

  it('returns on pace for commits at day 0', () => {
    expect(pace('commits', 0, 0).cls).toBe('ok');
  });

  it('correct expected for mocks: target 8, day 60 → expected 8', () => {
    expect(pace('mocks', 8, 60).cls).toBe('ok');
    expect(pace('mocks', 7, 60).cls).toBe('behind');
    expect(pace('mocks', 7, 60).txt).toBe('1 behind');
  });

  it('handles sprint day 1 correctly', () => {
    // owned: round(130/60*1) = round(2.16) = 2
    const result = pace('owned', 0, 1);
    expect(result.cls).toBe('behind');
    expect(result.txt).toBe('2 behind');
  });
});
