// ─────────────────────────────────────────────────────────────────────────────
// Skill verification challenge definitions.
// Pure data — no logic.
// ─────────────────────────────────────────────────────────────────────────────

export type SkillKey =
  | 'dsa'
  | 'js'
  | 'react'
  | 'node'
  | 'mongo'
  | 'sql'
  | 'cs'
  | 'interview'
  | 'comm'
  | 'fullstack';

export interface SkillDef {
  label: string;
  color: string;
  items: string[];
}

export const CHALLENGES: Record<SkillKey, SkillDef> = {
  dsa: {
    label: 'DSA',
    color: 'var(--amber)',
    items: [
      'Implement Two Sum in O(n) from scratch — no hints',
      'Reverse a linked list iteratively and recursively from memory',
      'Write BFS on a graph from memory and state time complexity',
      'Implement binary search (both iterative and recursive)',
      "Solve Maximum Subarray with Kadane's — explain why it works",
    ],
  },
  js: {
    label: 'JavaScript',
    color: 'var(--blue)',
    items: [
      'Implement debounce(fn,delay) from scratch',
      'Explain event loop: microtask vs macrotask queue with example',
      'Describe prototype chain — trace property lookup for a custom class',
      'Implement a basic Promise with .then() from scratch',
      'Explain why `this` differs in arrow vs regular functions with examples',
    ],
  },
  react: {
    label: 'React',
    color: 'var(--teal)',
    items: [
      'Build useFetch hook (loading, error, data states) from blank',
      'Explain why React re-renders and how to prevent unnecessary ones',
      'Implement useDebounce custom hook from scratch',
      'Explain useEffect dependency array — what "synchronization" means',
      'Build a protected route component from scratch',
    ],
  },
  node: {
    label: 'Node.js / Express',
    color: 'var(--green)',
    items: [
      'Build a CRUD API (routes, middleware, error handler) in under 90 min',
      'Implement JWT auth middleware from scratch',
      'Explain how next() chains middleware — draw it on paper',
      'Implement a rate-limiting middleware from scratch',
      'Handle async errors globally without try-catch in every route',
    ],
  },
  mongo: {
    label: 'MongoDB',
    color: 'var(--green)',
    items: [
      'Write aggregation to find top 5 most-applied-to jobs',
      'Explain when to use an index and which type',
      'Write $lookup query joining two collections',
      'Implement skip+limit pagination with sorting',
      'Explain replica sets and what "eventually consistent" means',
    ],
  },
  sql: {
    label: 'SQL',
    color: 'var(--blue)',
    items: [
      'Write JOIN across 3 tables without referencing docs',
      "Explain when an index won't be used by the query planner",
      'Write subquery to find users with zero applications',
      'Write GROUP BY + HAVING condition',
      'Explain INNER vs LEFT JOIN with a real example',
    ],
  },
  cs: {
    label: 'CS Fundamentals',
    color: 'var(--purple)',
    items: [
      'Explain URL-to-HTML in 8+ steps: DNS, TCP, HTTP, rendering',
      "Explain process vs thread — what's shared, what's isolated",
      'Describe what a DB index is and its underlying data structure',
      'Explain CORS — why it exists and how to fix it',
      'Explain TCP vs UDP — give a real use case for each',
    ],
  },
  interview: {
    label: 'Interview Readiness',
    color: 'var(--red)',
    items: [
      'Solve a random LeetCode medium in under 25 min with verbal explanation (test this now)',
      '7-min HireOnyx walkthrough — record and watch it back (have you done this?)',
      'Answer "technical challenge" in 90 sec with full STAR format',
      'Explain project architecture to non-technical person in 2 min',
      'Completed a timed mock interview with another person this week',
    ],
  },
  comm: {
    label: 'Communication',
    color: 'var(--amber)',
    items: [
      'Explain closures to a non-coder in 2 min — clear and accurate',
      'Give 90-sec STAR answer for "tell me about a time you failed"',
      'Explain HireOnyx architecture in 3 min without notes',
      '"Why do you want to work at [Company]?" — specific and convincing',
      'Record yourself explaining a problem solution — watch without cringing',
    ],
  },
  fullstack: {
    label: 'Full Stack Dev',
    color: 'var(--teal)',
    items: [
      'Build complete MERN app (auth, CRUD, deploy) from blank in one working day',
      'Debug a broken API: given an error, root-cause in under 15 min',
      'Add a new feature to HireOnyx without looking at existing patterns',
      'Deploy Node app to Render with env vars in under 30 min',
      'Design HireOnyx database schema from scratch on paper — all entities and relations',
    ],
  },
};

export const SKILL_KEYS = Object.keys(CHALLENGES) as SkillKey[];
