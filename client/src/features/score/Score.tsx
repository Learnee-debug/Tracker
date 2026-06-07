import { useState } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { syncApi } from '@/api/sync';
import type { CareerState } from '@/types';

interface MetricDef {
  key:    keyof CareerState['score'];
  label:  string;
  target: number;
  color:  string;
  deltas: number[];
}

const METRICS: MetricDef[] = [
  { key: 'solved',  label: 'DSA Solved',         target: 160, color: 'var(--amber)',  deltas: [1, 5] },
  { key: 'owned',   label: 'DSA Owned',           target: 130, color: 'var(--green)',  deltas: [1, 3] },
  { key: 'verbal',  label: 'Verbal Explanations', target: 120, color: 'var(--teal)',   deltas: [1, 5] },
  { key: 'commits', label: 'GitHub Commits',      target: 60,  color: 'var(--blue)',   deltas: [1]    },
  { key: 'mocks',   label: 'Mock Interviews',     target: 8,   color: 'var(--purple)', deltas: [1]    },
  { key: 'lc',      label: 'LeetCode Contests',   target: 8,   color: 'var(--amber)',  deltas: [1]    },
  { key: 'apps',    label: 'Internship Apps',     target: 25,  color: 'var(--amber)',  deltas: [1]    },
  { key: 'oss',     label: 'OSS PRs Submitted',   target: 1,   color: 'var(--green)',  deltas: [1]    },
];

// ─── Sync Button ──────────────────────────────────────────────────────────────

type SyncStatus = 'idle' | 'syncing' | 'done' | 'error';

const SYNC_LABEL: Record<SyncStatus, string> = {
  idle:    'Sync ↻',
  syncing: 'Syncing…',
  done:    'Synced ✓',
  error:   'Failed ✗',
};

const SYNC_COLOR: Record<SyncStatus, string> = {
  idle:    'text-text-sub hover:text-text-muted',
  syncing: 'text-text-sub',
  done:    'text-green',
  error:   'text-red',
};

function SyncButton() {
  const { state }       = useCareerStore();
  const { updateScore } = useCareerActions();
  const [status, setStatus] = useState<SyncStatus>('idle');

  async function handleSync() {
    if (status === 'syncing') return;
    setStatus('syncing');
    try {
      // Pass sprint start so GitHub commits are counted only from that date.
      const data = await syncApi.fetch(state.sprintStart || undefined);

      const commitsDelta = data.commits - state.score.commits;
      const solvedDelta  = data.solved  - state.score.solved;

      if (data.commits > 0 && commitsDelta !== 0) updateScore('commits', commitsDelta);
      if (data.solved  > 0 && solvedDelta  !== 0) updateScore('solved',  solvedDelta);

      setStatus('done');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={status === 'syncing'}
      title="Pull commit count from GitHub and solved count from LeetCode"
      className={`font-mono text-[11px] px-3 py-[5px] rounded-lg border border-border bg-bg-3 transition-colors cursor-pointer disabled:cursor-default ${SYNC_COLOR[status]}`}
    >
      {SYNC_LABEL[status]}
    </button>
  );
}

// ─── Metric Row ───────────────────────────────────────────────────────────────

function MetricRow({ m }: { m: MetricDef }) {
  const { state }       = useCareerStore();
  const { updateScore } = useCareerActions();
  const val = state.score[m.key] ?? 0;
  const pct = Math.min(100, Math.round((val / m.target) * 100));

  return (
    <div className="flex items-center gap-3 sm:gap-4 py-[11px] border-b border-border last:border-b-0">
      <div className="w-[155px] shrink-0">
        <span className="text-[13px] font-medium text-text">{m.label}</span>
      </div>

      <div className="font-mono text-[20px] font-bold w-14 shrink-0 text-right" style={{ color: m.color }}>
        {val}
      </div>

      <div className="flex-1 hidden sm:block">
        <ProgressBar value={pct} color={m.color} height="sm" />
      </div>

      <div className="font-mono text-[11px] text-text-sub w-12 shrink-0 text-right">
        /{m.target}
      </div>

      <div className="flex gap-2 shrink-0">
        {m.deltas.map((d) => (
          <Button key={d} size="sm" onClick={() => updateScore(m.key, d)}>
            +{d}
          </Button>
        ))}
      </div>
    </div>
  );
}

// ─── Score ────────────────────────────────────────────────────────────────────

export function Score() {
  return (
    <div>
      <div className="rounded-2xl border border-border bg-bg-2 p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em]">Progress Metrics</div>
          <SyncButton />
        </div>
        {METRICS.map((m) => (
          <MetricRow key={m.key} m={m} />
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-bg-2 p-5">
        <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-4">Process Rules</div>
        <div className="space-y-2">
          {[
            'Verbal Explanations replaced "OSS PRs Merged" — you control submitting, not merging.',
            'Solved ≠ Owned. 1 owned problem worth more than 5 solved-then-forgotten.',
            '0 commits today = losing day. No streak recovery — just restart tomorrow.',
            'Verbal Explanations: every problem solved out loud counts as +1 here.',
          ].map((rule) => (
            <p key={rule} className="text-[13px] text-text-muted leading-[1.6] flex gap-2">
              <span className="text-text-sub shrink-0 mt-[1px]">—</span>
              {rule}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
