import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
router.use(requireAuth);

// Usernames are env-configurable but fall back to the owner's accounts.
const GH_USER = process.env.GITHUB_USERNAME  ?? 'Learnee-debug';
const LC_USER = process.env.LEETCODE_USERNAME ?? 'dEg0FCZCmT';

// ─── GitHub ───────────────────────────────────────────────────────────────────
// Counts commits authored by GH_USER in their own repos since `since` date.
// Uses the search/commits endpoint — returns total_count in one round-trip.
// Optionally provide GITHUB_TOKEN env var for higher rate limits (5000/hr vs 60/hr).

async function fetchGitHubCommits(since?: string): Promise<number> {
  let q = `author:${GH_USER}+user:${GH_USER}`;
  if (since) q += `+author-date:>=${since}`;

  const url = `https://api.github.com/search/commits?q=${q}&per_page=1`;
  const headers: Record<string, string> = {
    'Accept':              'application/vnd.github+json',
    'User-Agent':          'career-os-tracker/1.0',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json() as { total_count: number };
  return data.total_count;
}

// ─── LeetCode ─────────────────────────────────────────────────────────────────
// Uses LeetCode's GraphQL endpoint (unofficial but stable).
// Returns the total number of unique accepted problems.

async function fetchLeetCodeSolved(): Promise<number> {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats: submitStatsGlobal {
          acSubmissionNum { difficulty count }
        }
      }
    }
  `;

  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Referer':      'https://leetcode.com',
      'Origin':       'https://leetcode.com',
      'User-Agent':   'Mozilla/5.0 (compatible; career-os-tracker/1.0)',
    },
    body: JSON.stringify({ query, variables: { username: LC_USER } }),
  });

  if (!res.ok) throw new Error(`LeetCode API ${res.status}`);

  const data = await res.json() as {
    data: {
      matchedUser: {
        submitStats: {
          acSubmissionNum: Array<{ difficulty: string; count: number }>;
        };
      } | null;
    };
  };

  const all = data.data?.matchedUser?.submitStats?.acSubmissionNum?.find(
    (e) => e.difficulty === 'All'
  );
  return all?.count ?? 0;
}

// ─── GET /api/sync ────────────────────────────────────────────────────────────
// Query params:
//   since  YYYY-MM-DD — count GitHub commits from this date onwards (sprint start)
//
// Response: { ok: true, data: { commits: number, solved: number } }

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const since = typeof req.query.since === 'string' ? req.query.since : undefined;

    const [commits, solved] = await Promise.all([
      fetchGitHubCommits(since),
      fetchLeetCodeSolved(),
    ]);

    res.json({ ok: true, data: { commits, solved } });
  } catch (err) {
    next(err);
  }
});

export default router;
