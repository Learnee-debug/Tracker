// ─────────────────────────────────────────────────────────────────────────────
// Company target matrix — static research data.
// Readiness is computed at runtime from verify scores.
// Pure data — no logic.
// ─────────────────────────────────────────────────────────────────────────────

import type { SkillKey } from './challenges';

export interface CompanyDef {
  name: string;
  tier: 'C' | 'D';
  oa: string;
  tests: string;
  window: string;
  // Weights must sum to 1.0
  weights: Partial<Record<SkillKey, number>>;
}

export const COMPANIES: CompanyDef[] = [
  {
    name: 'Morgan Stanley India',
    tier: 'C',
    oa: 'Hackerrank — 2 mediums, 45 min',
    tests: 'DSA medium + CS depth (OS, networking, DB) + behavioral STAR',
    window: 'Sep–Jan',
    weights: { dsa: 0.4, cs: 0.3, interview: 0.2, comm: 0.1 },
  },
  {
    name: "Lowe's India",
    tier: 'C',
    oa: 'Hackerrank — 2 mediums, 45 min',
    tests: 'DSA medium + MERN stack Q&A + project walkthrough',
    window: 'Aug–Nov',
    weights: { dsa: 0.35, fullstack: 0.35, interview: 0.2, cs: 0.1 },
  },
  {
    name: 'Atlassian India',
    tier: 'C',
    oa: 'Custom coding + product thinking',
    tests: 'DSA medium + product sense + technical design + behavioral',
    window: 'Oct–Dec',
    weights: { dsa: 0.3, fullstack: 0.25, interview: 0.25, comm: 0.2 },
  },
  {
    name: 'Adobe India',
    tier: 'C',
    oa: 'Hackerrank — 2-3 mediums',
    tests: 'DSA medium+ + full stack Q&A + 3 tech rounds',
    window: 'Aug–Dec',
    weights: { dsa: 0.35, fullstack: 0.3, cs: 0.25, interview: 0.1 },
  },
  {
    name: 'Razorpay',
    tier: 'C',
    oa: 'Custom — DSA + system basics',
    tests: 'DSA medium + Node/backend depth + product questions',
    window: 'Year-round',
    weights: { dsa: 0.3, fullstack: 0.4, interview: 0.2, cs: 0.1 },
  },
  {
    name: 'CRED',
    tier: 'C',
    oa: 'Custom platform — medium DSA',
    tests: 'DSA + full stack + culture/craft fit + problem-solving approach',
    window: 'Sep–Dec',
    weights: { dsa: 0.3, fullstack: 0.35, comm: 0.2, interview: 0.15 },
  },
  {
    name: 'Walmart Labs',
    tier: 'C',
    oa: 'Hackerrank — 2 mediums',
    tests: 'DSA medium + SQL + OOP design + project walkthrough',
    window: 'Aug–Nov',
    weights: { dsa: 0.4, fullstack: 0.25, cs: 0.25, interview: 0.1 },
  },
  {
    name: 'Goldman Sachs Tech',
    tier: 'D',
    oa: 'Hackerrank — hard problems, 60 min',
    tests: 'Hard DSA + CS fundamentals depth + system design concepts + behavioral',
    window: 'Aug–Oct',
    weights: { dsa: 0.5, cs: 0.3, interview: 0.15, comm: 0.05 },
  },
];
