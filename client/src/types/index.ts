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
  score?: number;       // deprecated — kept so existing entries deserialise without error
  dsa?: string;         // new: DSA owned this week
  avoid: string;
  constraint?: string;  // new: real constraint question
  change: string;
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
  hx: Record<string, boolean>;              // legacy: task id → done, kept for migration + hxPct
  taskIdx: number;                          // linear task pointer (migration target)
  focusDSA: string;                         // today's DSA focus, user-editable
  skills: boolean[];                        // 15-item flat skill check array (REVIEW §B)
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

