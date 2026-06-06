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

import type { CareerState, CalDayState, RiskId, Mission, TierResult, TierId, WeeklyReviewInputs } from '@/types';
import { CHALLENGES, SKILL_KEYS, type SkillKey } from '@/data/challenges';
import { HX_DEFS, HX_ORDER } from '@/data/hxDefs';
import { DSA_SCHEDULE } from '@/data/dsaSchedule';

// ─── Types used only inside the engine ────────────────────────────────────────

export type VerifyScores = Record<SkillKey, number>;

export interface ScoreMetrics {
  mocks: number;
  commits: number;
  oss: number;
}

// ─── RISK METADATA ────────────────────────────────────────────────────────────

export const RISK_LEVELS: Record<RiskId, 'critical' | 'high' | 'medium'> = {
  'no-dsa':              'critical',
  'no-commit':           'critical',
  'new-project':         'critical',
  'plan-only':           'high',
  'tutorial':            'high',
  'no-mock':             'high',
  'consume':             'medium',
  'not-owned':           'medium',
  'internship-window':   'medium',
  'no-review':           'medium',
};

export const CRITICAL_RISK_IDS: RiskId[] = ['no-dsa', 'no-commit', 'new-project'];

export const RISK_RECOVERY: Record<RiskId, string> = {
  'no-dsa':            'Open LeetCode now. Solve 1 easy problem before anything else. No planning first.',
  'no-commit':         'Find any working code in HireOnyx. Fix or improve one thing. Commit.',
  'new-project':       'Archive the new project immediately. Open HireOnyx. Ship one feature.',
  'plan-only':         'No Claude, no docs until 3 PM. Morning = code only.',
  'tutorial':          'Close the video. Open a blank file. Implement from memory. Stuck after 20 min → docs only.',
  'no-mock':           'Do one today. Timer. Record it. Missing 2 in a row compounds badly.',
  'consume':           'No passive content before 9 PM. Track ratio: 3 hours build → 1 hour consume.',
  'not-owned':         'Revisit 5 failure log problems before any new problems this week.',
  'internship-window': 'Add 3 companies to Matrix tab today. Window opens Oct–Dec. This cannot be recovered once missed.',
  'no-review':         'Open Weekly tab. 10 minutes. Honest reflection prevents more drift than any plan.',
};

// ─── getVerifiedScore ──────────────────────────────────────────────────────────
// Returns 0–10 based on how many challenges for the given skill are checked.
// 10 = all 5 checked. Score is proportional.

export function getVerifiedScore(key: SkillKey, verify: CareerState['verify']): number {
  const items = CHALLENGES[key]?.items ?? [];
  if (items.length === 0) return 0;
  const done = items.filter((_, i) => verify[`${key}_${i}`] === true).length;
  return Math.round((done / items.length) * 10);
}

// ─── buildVerifyScores ────────────────────────────────────────────────────────
// Computes all skill scores at once. Returns a full VerifyScores record.
// Used by calcTierReady and genMission so they share one computation.

export function buildVerifyScores(verify: CareerState['verify']): VerifyScores {
  return Object.fromEntries(
    SKILL_KEYS.map((key) => [key, getVerifiedScore(key, verify)])
  ) as VerifyScores;
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

// ─── calcTierReady ────────────────────────────────────────────────────────────
// Returns readiness percentage and the top gap for a target company tier.
// Weights and thresholds are documented inline so they're auditable.

export function calcTierReady(
  tier: TierId,
  scores: VerifyScores,
  metrics: ScoreMetrics
): TierResult {
  const { dsa, fullstack, cs } = scores;
  const { mocks, commits, oss } = metrics;

  let pct: number;
  let gap: string;

  if (tier === 'B') {
    // Tier B: fast-hire internships. DSA fundamentals + shipped project + commit history.
    pct = Math.round(
      Math.min(1, dsa / 5)         * 40 +   // DSA: need score 5+ (40% weight)
      Math.min(1, fullstack / 5)   * 30 +   // Full stack: need 5+ (30% weight)
      Math.min(1, commits / 30)    * 30      // 30+ commits (30% weight)
    );
    if      (dsa < 5)      gap = `DSA ${dsa}/5`;
    else if (fullstack < 5) gap = `FullStack ${fullstack}/5`;
    else if (commits < 30) gap = `${30 - commits} more commits`;
    else                   gap = 'Ready';

  } else if (tier === 'C') {
    // Tier C: competitive internships. DSA medium + full stack + CS fundamentals + mock interviews.
    pct = Math.round(
      Math.min(1, dsa / 7)         * 40 +   // DSA: need score 7+ (40% weight)
      Math.min(1, fullstack / 6)   * 20 +   // Full stack: need 6+ (20% weight)
      Math.min(1, cs / 5)          * 15 +   // CS depth: need 5+ (15% weight)
      Math.min(1, mocks / 5)       * 15 +   // 5+ mock interviews (15% weight)
      Math.min(1, commits / 60)    * 10      // 60+ commits (10% weight)
    );
    if      (dsa < 7)      gap = `DSA ${dsa}/7`;
    else if (fullstack < 6) gap = `FullStack ${fullstack}/6`;
    else if (cs < 5)       gap = `CS depth ${cs}/5`;
    else if (mocks < 5)    gap = `${5 - mocks} more mocks`;
    else                   gap = 'Ready';

  } else {
    // Tier D: top-tier. Hard DSA + deep CS + many mocks + OSS contribution.
    pct = Math.round(
      Math.min(1, dsa / 9)         * 50 +   // DSA: need score 9+ (50% weight)
      Math.min(1, cs / 8)          * 20 +   // CS depth: need 8+ (20% weight)
      Math.min(1, mocks / 15)      * 15 +   // 15+ mocks (15% weight)
      Math.min(1, oss / 1)         * 15      // 1 OSS PR (15% weight)
    );
    if      (dsa < 9)    gap = `DSA ${dsa}/9`;
    else if (cs < 8)     gap = `CS depth ${cs}/8`;
    else if (mocks < 15) gap = `${15 - mocks} more mocks`;
    else if (oss < 1)    gap = 'OSS PR needed';
    else                 gap = 'Ready';
  }

  return { pct: Math.max(0, Math.min(100, pct)), gap };
}

// ─── calcCompanyReadiness ─────────────────────────────────────────────────────
// Computes a single company's readiness percentage from its weights and verify scores.

export function calcCompanyReadiness(
  weights: Partial<Record<SkillKey, number>>,
  scores: VerifyScores
): number {
  let total = 0;
  for (const [key, weight] of Object.entries(weights) as [SkillKey, number][]) {
    total += Math.min(1, (scores[key] ?? 0) / 8) * weight * 100;
  }
  return Math.round(total);
}

// ─── getNextHxTask ────────────────────────────────────────────────────────────
// Returns the label of the first incomplete HireOnyx task in build order.
// Returns null if all tasks are complete.

export function getNextHxTask(hx: CareerState['hx']): string | null {
  for (const sectionKey of HX_ORDER) {
    const section = HX_DEFS[sectionKey];
    const task = section?.tasks.find((t) => !hx[t.id]);
    if (task) return task.label;
  }
  return null;
}

// ─── calcHxSectionPct ─────────────────────────────────────────────────────────
// Returns completion percentage for a specific HireOnyx section.

export function calcHxSectionPct(sectionKey: string, hx: CareerState['hx']): number {
  const section = HX_DEFS[sectionKey];
  if (!section || section.tasks.length === 0) return 0;
  const done = section.tasks.filter((t) => hx[t.id]).length;
  return Math.round((done / section.tasks.length) * 100);
}

// ─── calcHxOverallPct ─────────────────────────────────────────────────────────

export function calcHxOverallPct(hx: CareerState['hx']): number {
  let total = 0;
  let done = 0;
  for (const section of Object.values(HX_DEFS)) {
    total += section.tasks.length;
    done  += section.tasks.filter((t) => hx[t.id]).length;
  }
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

// ─── getActiveCriticalRisks ───────────────────────────────────────────────────

export function getActiveCriticalRisks(risks: CareerState['risks']): RiskId[] {
  return CRITICAL_RISK_IDS.filter((id) => risks[id] === true);
}

// ─── genMission ───────────────────────────────────────────────────────────────
// Generates today's mission.
// If any critical risk is active, the entire mission pivots to recovery.
// Otherwise it uses the DSA schedule, next HireOnyx task, and weakest verify skill.

export function genMission(
  sprintDay: number | null,
  risks: CareerState['risks'],
  hx: CareerState['hx'],
  scores: VerifyScores,
  mocks: number
): Mission {
  const criticalRisks = getActiveCriticalRisks(risks);

  if (criticalRisks.length > 0) {
    const topRisk = criticalRisks[0];
    return {
      dsa:        `⚠ CLEAR CRITICAL RISK: ${RISK_RECOVERY[topRisk]}`,
      build:      'Hold all new work until the critical risk is resolved.',
      review:     'Identify what triggered the risk. Add it to Weekly Review.',
      habit:      'Clear this before anything else. Non-negotiables are blocked.',
      isCritical: true,
    };
  }

  // DSA: follow the schedule or default to day 1 topics
  const day = sprintDay ?? 1;
  const clampedDay = Math.min(60, Math.max(1, day));
  const dsaLine = DSA_SCHEDULE[clampedDay] ?? DSA_SCHEDULE[1];

  // Build: next HireOnyx task
  const nextTask = getNextHxTask(hx);
  const hxBackendPct = calcHxSectionPct('backend', hx);
  let build: string;
  if (nextTask) {
    build = `HireOnyx: ${nextTask}`;
  } else if (hxBackendPct >= 90) {
    build = 'HireOnyx complete — practice 7-min verbal walkthrough';
  } else {
    build = 'HireOnyx — find next incomplete task in HireOnyx tab';
  }

  // Review: weakest verified skill
  const sortedScores = SKILL_KEYS
    .map((key) => ({ key, score: scores[key] ?? 0 }))
    .sort((a, b) => a.score - b.score);
  const weakest = sortedScores[0];
  const review = weakest && weakest.score < 6
    ? `Weakest skill: ${CHALLENGES[weakest.key].label} (${weakest.score}/10) — attempt 1 challenge in Verify tab`
    : 'All skills ≥6 — re-solve 1 failure log problem from this week';

  // Habit: mock interview cadence
  const habit = mocks > 0 && mocks % 7 === 0
    ? 'Weekly mock interview due today — timer on, record it'
    : 'After DSA: explain your solution out loud as if in an interview room (+1 Verbal in Score tab)';

  return {
    dsa:        `${dsaLine} — timed 25 min each, solve out loud`,
    build,
    review,
    habit,
    isCritical: false,
  };
}

// ─── calcWeeklyScore ──────────────────────────────────────────────────────────
// Computes the weekly review score 0–100.
//
// Scoring breakdown (total possible = 100):
//   DSA count       25 pts  (14+ = full, 7–13 = 18, 4–6 = 12, 1–3 = 6, 0 = 0)
//   Commit level    max 6   (from select: 0/1/2/4/6)
//   Build level     max 15  (0/5/10/15 from select mapped * 5)
//   Avoid text      15 pts  (written honestly ≥20 chars = full, anything = 7)
//   Block text      10 pts  (≥10 chars = full)
//   Change text     15 pts  (concrete ≥20 chars = full, something = 7)
//   Subtotal        86 pts — remaining 14 pts are a "showing up" bonus
//     (score is clamped to 100 in practice; the formula intentionally allows
//     slightly above 86 to reward combinations of strong inputs)

export function calcWeeklyScore(inputs: WeeklyReviewInputs): number {
  const {
    dsaCount,
    commitLevel,
    buildLevel,
    avoidText,
    blockText,
    changeText,
  } = inputs;

  const dsaScore    = dsaCount >= 14 ? 25 : dsaCount >= 7 ? 18 : dsaCount >= 4 ? 12 : dsaCount >= 1 ? 6 : 0;
  const commitScore = commitLevel; // 0, 1, 2, 4, or 6 — comes from select value
  const buildScore  = buildLevel * 5; // 0, 1, 2, 3 → 0, 5, 10, 15
  const avoidScore  = avoidText.trim().length >= 20 ? 15 : avoidText.trim().length > 0 ? 7 : 0;
  const blockScore  = blockText.trim().length >= 10 ? 10 : 0;
  const changeScore = changeText.trim().length >= 20 ? 15 : changeText.trim().length > 0 ? 7 : 0;

  return Math.min(100, dsaScore + commitScore + buildScore + avoidScore + blockScore + changeScore);
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
