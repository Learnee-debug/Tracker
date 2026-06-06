// ─────────────────────────────────────────────────────────────────────────────
// Engine unit tests — Vitest
//
// Every pure function in engine.ts has coverage here.
// Tests are organized by function, with edge cases documented inline.
// No mocking needed — all functions are pure with no external dependencies.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
  getVerifiedScore,
  buildVerifyScores,
  calcStreak,
  calcTierReady,
  calcCompanyReadiness,
  getNextHxTask,
  calcHxSectionPct,
  calcHxOverallPct,
  getActiveCriticalRisks,
  genMission,
  calcWeeklyScore,
  getSprintDay,
} from '../lib/engine';
import type { CareerState } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeVerify(checked: string[]): CareerState['verify'] {
  return Object.fromEntries(checked.map((k) => [k, true]));
}

function makeHx(checked: string[]): CareerState['hx'] {
  return Object.fromEntries(checked.map((k) => [k, true]));
}

function makeCal(entries: Record<string, 'good' | 'partial' | 'miss'>): CareerState['cal'] {
  return entries;
}

// ─────────────────────────────────────────────────────────────────────────────
// getVerifiedScore
// ─────────────────────────────────────────────────────────────────────────────

describe('getVerifiedScore', () => {
  it('returns 0 when nothing is checked', () => {
    expect(getVerifiedScore('dsa', {})).toBe(0);
  });

  it('returns 10 when all 5 challenges are checked', () => {
    const verify = makeVerify(['dsa_0', 'dsa_1', 'dsa_2', 'dsa_3', 'dsa_4']);
    expect(getVerifiedScore('dsa', verify)).toBe(10);
  });

  it('returns 4 when 2 of 5 are checked (rounds correctly)', () => {
    const verify = makeVerify(['dsa_0', 'dsa_1']);
    // 2/5 = 0.4 * 10 = 4
    expect(getVerifiedScore('dsa', verify)).toBe(4);
  });

  it('returns 6 when 3 of 5 are checked', () => {
    const verify = makeVerify(['js_0', 'js_1', 'js_2']);
    expect(getVerifiedScore('js', verify)).toBe(6);
  });

  it('ignores unchecked (false) values', () => {
    const verify = { 'dsa_0': true, 'dsa_1': false, 'dsa_2': true };
    expect(getVerifiedScore('dsa', verify)).toBe(4);
  });

  it('handles unknown skill key gracefully', () => {
    // @ts-expect-error — intentionally testing unknown key
    expect(getVerifiedScore('unknown_skill', {})).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// buildVerifyScores
// ─────────────────────────────────────────────────────────────────────────────

describe('buildVerifyScores', () => {
  it('returns 0 for all skills when verify is empty', () => {
    const scores = buildVerifyScores({});
    expect(scores.dsa).toBe(0);
    expect(scores.js).toBe(0);
    expect(scores.fullstack).toBe(0);
  });

  it('returns correct individual scores', () => {
    const verify = makeVerify(['dsa_0', 'dsa_1', 'js_0', 'js_1', 'js_2', 'js_3', 'js_4']);
    const scores = buildVerifyScores(verify);
    expect(scores.dsa).toBe(4);  // 2/5
    expect(scores.js).toBe(10);  // 5/5
    expect(scores.react).toBe(0);
  });
});

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
// calcTierReady
// ─────────────────────────────────────────────────────────────────────────────

describe('calcTierReady', () => {
  const zeroScores = buildVerifyScores({});
  const zeroMetrics = { mocks: 0, commits: 0, oss: 0 };

  it('returns 0% with all zeroes for Tier B', () => {
    const { pct } = calcTierReady('B', zeroScores, zeroMetrics);
    expect(pct).toBe(0);
  });

  it('returns 100% with perfect inputs for Tier B', () => {
    const scores = { ...zeroScores, dsa: 10, fullstack: 10 };
    const metrics = { ...zeroMetrics, commits: 60 };
    const { pct } = calcTierReady('B', scores, metrics);
    expect(pct).toBe(100);
  });

  it('returns correct gap label for Tier B when DSA is low', () => {
    const { gap } = calcTierReady('B', zeroScores, zeroMetrics);
    expect(gap).toContain('DSA');
  });

  it('Tier B gap shifts to FullStack once DSA threshold is met', () => {
    const scores = { ...zeroScores, dsa: 5 }; // DSA meets threshold
    const { gap } = calcTierReady('B', scores, zeroMetrics);
    expect(gap).toContain('FullStack');
  });

  it('Tier B gap shifts to commits once DSA and FullStack are met', () => {
    const scores = { ...zeroScores, dsa: 5, fullstack: 5 };
    const { gap } = calcTierReady('B', scores, zeroMetrics);
    expect(gap).toContain('commits');
  });

  it('Tier B returns Ready when all thresholds are met', () => {
    const scores = { ...zeroScores, dsa: 5, fullstack: 5 };
    const metrics = { ...zeroMetrics, commits: 30 };
    const { gap } = calcTierReady('B', scores, metrics);
    expect(gap).toBe('Ready');
  });

  it('Tier C returns 0% with all zeroes', () => {
    const { pct } = calcTierReady('C', zeroScores, zeroMetrics);
    expect(pct).toBe(0);
  });

  it('Tier D requires DSA 9+ for full DSA component', () => {
    const scores = { ...zeroScores, dsa: 9, cs: 8, interview: 10 };
    const metrics = { mocks: 15, commits: 0, oss: 1 };
    const { gap } = calcTierReady('D', scores, metrics);
    expect(gap).toBe('Ready');
  });

  it('pct is always between 0 and 100', () => {
    const hugScores = Object.fromEntries(
      Object.keys(zeroScores).map((k) => [k, 20])
    ) as typeof zeroScores;
    const hugMetrics = { mocks: 1000, commits: 1000, oss: 100 };
    const { pct: pctB } = calcTierReady('B', hugScores, hugMetrics);
    const { pct: pctC } = calcTierReady('C', hugScores, hugMetrics);
    const { pct: pctD } = calcTierReady('D', hugScores, hugMetrics);
    expect(pctB).toBeLessThanOrEqual(100);
    expect(pctC).toBeLessThanOrEqual(100);
    expect(pctD).toBeLessThanOrEqual(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calcCompanyReadiness
// ─────────────────────────────────────────────────────────────────────────────

describe('calcCompanyReadiness', () => {
  const zeroScores = buildVerifyScores({});

  it('returns 0 with all zero scores', () => {
    const weights = { dsa: 0.4, cs: 0.3, interview: 0.2, comm: 0.1 };
    expect(calcCompanyReadiness(weights, zeroScores)).toBe(0);
  });

  it('returns 100 when all weighted skills are at 8', () => {
    const scores = { ...zeroScores, dsa: 8, cs: 8, interview: 8, comm: 8 };
    const weights = { dsa: 0.4, cs: 0.3, interview: 0.2, comm: 0.1 };
    expect(calcCompanyReadiness(weights, scores)).toBe(100);
  });

  it('caps each skill contribution at score/8 (not score/10)', () => {
    // Score of 8 is the ceiling (1.0 contribution) — 10 should not exceed 100%
    const scores = { ...zeroScores, dsa: 10 };
    const weights = { dsa: 1.0 };
    expect(calcCompanyReadiness(weights, scores)).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getNextHxTask
// ─────────────────────────────────────────────────────────────────────────────

describe('getNextHxTask', () => {
  it('returns the first database task when nothing is done', () => {
    const task = getNextHxTask({});
    expect(task).toBe('User schema (name, email, password hash, role)');
  });

  it('returns null when all tasks are complete', async () => {
    const { HX_DEFS } = await import('../data/hxDefs');
    const allTaskIds: string[] = [];
    for (const section of Object.values(HX_DEFS)) {
      section.tasks.forEach((t) => allTaskIds.push(t.id));
    }
    const hx = makeHx(allTaskIds);
    expect(getNextHxTask(hx)).toBeNull();
  });

  it('skips completed tasks and returns the next incomplete one', () => {
    // Complete all database tasks, expect first backend task
    const dbTaskIds = ['db1', 'db2', 'db3', 'db4', 'db5', 'db6', 'db7'];
    const hx = makeHx(dbTaskIds);
    const task = getNextHxTask(hx);
    expect(task).toBe('User register + bcrypt password hash');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calcHxSectionPct / calcHxOverallPct
// ─────────────────────────────────────────────────────────────────────────────

describe('calcHxSectionPct', () => {
  it('returns 0 when nothing is done', () => {
    expect(calcHxSectionPct('database', {})).toBe(0);
  });

  it('returns 100 when all tasks in section are done', () => {
    const hx = makeHx(['db1', 'db2', 'db3', 'db4', 'db5', 'db6', 'db7']);
    expect(calcHxSectionPct('database', hx)).toBe(100);
  });

  it('returns correct partial percentage', () => {
    // database has 7 tasks; 3 done = 42.857... → rounds to 43
    const hx = makeHx(['db1', 'db2', 'db3']);
    expect(calcHxSectionPct('database', hx)).toBe(43);
  });

  it('returns 0 for unknown section key', () => {
    expect(calcHxSectionPct('nonexistent', {})).toBe(0);
  });
});

describe('calcHxOverallPct', () => {
  it('returns 0 with no tasks done', () => {
    expect(calcHxOverallPct({})).toBe(0);
  });

  it('returns a value between 0 and 100', () => {
    const hx = makeHx(['db1', 'db2', 'be1']);
    const pct = calcHxOverallPct(hx);
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getActiveCriticalRisks
// ─────────────────────────────────────────────────────────────────────────────

describe('getActiveCriticalRisks', () => {
  it('returns empty array when no risks are active', () => {
    expect(getActiveCriticalRisks({})).toEqual([]);
  });

  it('returns only critical risks that are true', () => {
    const risks = { 'no-dsa': true, 'plan-only': true, 'consume': true };
    const result = getActiveCriticalRisks(risks);
    expect(result).toContain('no-dsa');
    expect(result).not.toContain('plan-only'); // high, not critical
    expect(result).not.toContain('consume');   // medium, not critical
  });

  it('excludes critical risks that are false', () => {
    const risks = { 'no-dsa': false, 'no-commit': true };
    const result = getActiveCriticalRisks(risks);
    expect(result).not.toContain('no-dsa');
    expect(result).toContain('no-commit');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// genMission
// ─────────────────────────────────────────────────────────────────────────────

describe('genMission', () => {
  const zeroScores = buildVerifyScores({});

  it('returns a critical mission when a critical risk is active', () => {
    const risks = { 'no-dsa': true };
    const mission = genMission(5, risks, {}, zeroScores, 0);
    expect(mission.isCritical).toBe(true);
    expect(mission.dsa).toContain('⚠');
    expect(mission.build).toContain('Hold');
  });

  it('returns a normal mission when no critical risks are active', () => {
    const mission = genMission(5, {}, {}, zeroScores, 0);
    expect(mission.isCritical).toBe(false);
    expect(mission.dsa).not.toContain('⚠');
  });

  it('uses the correct DSA schedule day', () => {
    const mission = genMission(1, {}, {}, zeroScores, 0);
    expect(mission.dsa).toContain('Arrays');
  });

  it('mentions the weakest skill in review when score is below 6', () => {
    const mission = genMission(5, {}, {}, zeroScores, 0);
    // All scores are 0, so 'dsa' (first alphabetically after sort) is weakest
    expect(mission.review).toContain('/10');
  });

  it('gives mock interview reminder when mocks are a multiple of 7', () => {
    const mission = genMission(5, {}, {}, zeroScores, 7);
    expect(mission.habit).toContain('mock interview');
  });

  it('gives verbal explanation habit when mocks are not a multiple of 7', () => {
    const mission = genMission(5, {}, {}, zeroScores, 0);
    expect(mission.habit).toContain('out loud');
  });

  it('uses next HireOnyx task in build line', () => {
    const mission = genMission(5, {}, {}, zeroScores, 0);
    expect(mission.build).toContain('HireOnyx');
  });

  it('handles null sprint day without crashing', () => {
    const mission = genMission(null, {}, {}, zeroScores, 0);
    expect(mission).toBeDefined();
    expect(mission.dsa).toBeTruthy();
  });

  it('non-critical risks do not trigger critical mission', () => {
    const risks = { 'plan-only': true, 'tutorial': true, 'consume': true };
    const mission = genMission(5, risks, {}, zeroScores, 0);
    expect(mission.isCritical).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calcWeeklyScore
// ─────────────────────────────────────────────────────────────────────────────

describe('calcWeeklyScore', () => {
  const emptyInputs = {
    dsaCount: 0,
    commitLevel: 0,
    buildLevel: 0,
    avoidText: '',
    blockText: '',
    changeText: '',
  };

  it('returns 0 for all-empty inputs', () => {
    expect(calcWeeklyScore(emptyInputs)).toBe(0);
  });

  it('returns 25 for 14+ DSA problems alone', () => {
    expect(calcWeeklyScore({ ...emptyInputs, dsaCount: 14 })).toBe(25);
    expect(calcWeeklyScore({ ...emptyInputs, dsaCount: 20 })).toBe(25);
  });

  it('DSA score tiers correctly', () => {
    expect(calcWeeklyScore({ ...emptyInputs, dsaCount: 7 })).toBe(18);
    expect(calcWeeklyScore({ ...emptyInputs, dsaCount: 4 })).toBe(12);
    expect(calcWeeklyScore({ ...emptyInputs, dsaCount: 1 })).toBe(6);
    expect(calcWeeklyScore({ ...emptyInputs, dsaCount: 0 })).toBe(0);
  });

  it('awards full 15 pts for avoid text with 20+ chars', () => {
    const score = calcWeeklyScore({
      ...emptyInputs,
      avoidText: 'Trees problems and error handling',
    });
    expect(score).toBe(15);
  });

  it('awards 7 pts for short but non-empty avoid text', () => {
    const score = calcWeeklyScore({ ...emptyInputs, avoidText: 'Trees' });
    expect(score).toBe(7);
  });

  it('awards 0 pts for empty avoid text', () => {
    const score = calcWeeklyScore({ ...emptyInputs, avoidText: '   ' });
    expect(score).toBe(0);
  });

  it('never exceeds 100', () => {
    const maxInputs = {
      dsaCount: 20,
      commitLevel: 6,
      buildLevel: 3,
      avoidText: 'Detailed description of everything I avoided this week carefully',
      blockText: 'Real bottleneck identified here',
      changeText: 'Very specific concrete change I will make next week starting Monday',
    };
    expect(calcWeeklyScore(maxInputs)).toBeLessThanOrEqual(100);
  });

  it('build level 3 awards 15 pts', () => {
    const score = calcWeeklyScore({ ...emptyInputs, buildLevel: 3 });
    expect(score).toBe(15);
  });

  it('commit level 6 awards 6 pts', () => {
    const score = calcWeeklyScore({ ...emptyInputs, commitLevel: 6 });
    expect(score).toBe(6);
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
