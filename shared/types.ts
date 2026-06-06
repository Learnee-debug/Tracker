// ─────────────────────────────────────────────────────────────────────────────
// Shared types — used by both client and server.
// Rule: no imports from either client or server here.
// Rule: no runtime logic here — types only.
// ─────────────────────────────────────────────────────────────────────────────

// ── Score ─────────────────────────────────────────────────────────────────────

export interface Score {
  solved: number;
  owned: number;
  verbal: number;
  commits: number;
  mocks: number;
  lc: number;
  apps: number;
  oss: number;
}

// ── Calendar ──────────────────────────────────────────────────────────────────

export type CalDayState = 'good' | 'partial' | 'miss' | '';

// ── Risk ──────────────────────────────────────────────────────────────────────

export type RiskId =
  | 'no-dsa'
  | 'no-commit'
  | 'new-project'
  | 'plan-only'
  | 'tutorial'
  | 'no-mock'
  | 'consume'
  | 'not-owned'
  | 'internship-window'
  | 'no-review';

export type RiskLevel = 'critical' | 'high' | 'medium';

// ── Non-Negotiables ───────────────────────────────────────────────────────────

export interface NonNegotiables {
  d1: boolean; // DSA solved out loud
  d2: boolean; // Working code committed
  d3: boolean; // Failure log updated
}

// ── Weekly Review ─────────────────────────────────────────────────────────────

export interface WeeklyEntry {
  id: string;
  date: string;
  score: number;
  avoid: string;
  change: string;
}

export interface WeeklyReviewInputs {
  dsaCount: number;        // new problems owned this week
  commitLevel: number;     // 0 | 1 | 2 | 4 | 6
  buildLevel: number;      // 0 | 1 | 2 | 3
  avoidText: string;
  blockText: string;
  changeText: string;
}

// ── Pipeline ──────────────────────────────────────────────────────────────────

export type PipelineStatus =
  | 'Target'
  | 'Researching'
  | 'Applying'
  | 'OA Done'
  | 'Interview'
  | 'Offer'
  | 'Rejected';

export interface PipelineEntry {
  id: string;
  co: string;
  status: PipelineStatus;
  notes: string;
  date: string;
}

// ── Career State (the single source of truth) ─────────────────────────────────

export interface CareerState {
  score: Score;
  nn: NonNegotiables;
  nnDate: string;                           // ISO date string — resets daily
  risks: Partial<Record<RiskId, boolean>>;
  verify: Record<string, boolean>;          // key: `${skillKey}_${challengeIndex}`
  hx: Record<string, boolean>;              // key: task id from hxDefs
  cal: Record<string, CalDayState>;         // key: `d${dayNumber}`
  sprintStart: string;                      // ISO date string
  weeklyHistory: WeeklyEntry[];
  pipeline: PipelineEntry[];
  coNotes: Record<string, string>;          // key: company name
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// ── API response envelope ─────────────────────────────────────────────────────

export interface ApiOk<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
}

export type ApiResult<T> = ApiOk<T> | ApiError;

// ── Tier readiness ────────────────────────────────────────────────────────────

export type TierId = 'B' | 'C' | 'D';

export interface TierResult {
  pct: number;
  gap: string;
}

// ── Mission ───────────────────────────────────────────────────────────────────

export interface Mission {
  dsa: string;
  build: string;
  review: string;
  habit: string;
  isCritical: boolean;
}
