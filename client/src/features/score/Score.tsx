import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import type { CareerState } from '@/types';

interface MetricDef {
  key:    keyof CareerState['score'];
  label:  string;
  target: number;
  color:  string;
  deltas: number[];
}

const METRICS: MetricDef[] = [
  { key: 'solved',  label: 'DSA Solved',          target: 160, color: 'var(--amber)',  deltas: [1, 5] },
  { key: 'owned',   label: 'DSA Owned',            target: 130, color: 'var(--green)',  deltas: [1, 3] },
  { key: 'verbal',  label: 'Verbal Explanations',  target: 120, color: 'var(--teal)',   deltas: [1, 5] },
  { key: 'commits', label: 'GitHub Commits',       target: 60,  color: 'var(--blue)',   deltas: [1]    },
  { key: 'mocks',   label: 'Mock Interviews',      target: 8,   color: 'var(--purple)', deltas: [1]    },
  { key: 'lc',      label: 'LeetCode Contests',    target: 8,   color: 'var(--amber)',  deltas: [1]    },
  { key: 'apps',    label: 'Internship Apps',      target: 25,  color: 'var(--amber)',  deltas: [1]    },
  { key: 'oss',     label: 'OSS PRs Submitted',    target: 1,   color: 'var(--green)',  deltas: [1]    },
];

function MetricRow({ m }: { m: MetricDef }) {
  const { state }       = useCareerStore();
  const { updateScore } = useCareerActions();
  const val = state.score[m.key] ?? 0;
  const pct = Math.min(100, Math.round((val / m.target) * 100));

  return (
    <div className="flex items-center gap-3 sm:gap-4 py-[11px] border-b border-border last:border-b-0">
      {/* Label */}
      <div className="w-[155px] shrink-0">
        <span className="text-[13px] font-medium text-text">{m.label}</span>
      </div>

      {/* Value */}
      <div
        className="font-mono text-[20px] font-bold w-14 shrink-0 text-right"
        style={{ color: m.color }}
      >
        {val}
      </div>

      {/* Progress bar */}
      <div className="flex-1 hidden sm:block">
        <ProgressBar value={pct} color={m.color} height="sm" />
      </div>

      {/* Target */}
      <div className="font-mono text-[11px] text-text-sub w-12 shrink-0 text-right">
        /{m.target}
      </div>

      {/* Buttons */}
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

export function Score() {
  return (
    <div>
      <div className="rounded-2xl border border-border bg-bg-2 p-5 mb-5">
        <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-4">Progress Metrics</div>
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
