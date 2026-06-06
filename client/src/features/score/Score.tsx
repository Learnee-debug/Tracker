import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { CareerState } from '@/types';

interface MetricRow {
  key:     keyof CareerState['score'];
  label:   string;
  sub:     string;
  target:  number;
  month12: number | string;
  color:   string;
  deltas:  number[];
}

const METRICS: MetricRow[] = [
  { key: 'solved',  label: 'DSA Solved',          sub: 'Total attempted',                 target: 160, month12: 500, color: 'var(--amber)',  deltas: [1, 5] },
  { key: 'owned',   label: 'DSA Owned',            sub: 'Re-solvable without hints',       target: 130, month12: 400, color: 'var(--green)',  deltas: [1, 3] },
  { key: 'verbal',  label: 'Verbal Explanations',  sub: 'Problems explained out loud',     target: 120, month12: 400, color: 'var(--teal)',   deltas: [1, 5] },
  { key: 'commits', label: 'GitHub Commits',        sub: 'Meaningful commits',              target: 60,  month12: 300, color: 'var(--blue)',   deltas: [1] },
  { key: 'mocks',   label: 'Mock Interviews',       sub: 'Timed + verbal + recorded',       target: 8,   month12: 40,  color: 'var(--purple)', deltas: [1] },
  { key: 'lc',      label: 'LeetCode Contests',     sub: 'Weekly competitions entered',     target: 8,   month12: 52,  color: 'var(--amber)',  deltas: [1] },
  { key: 'apps',    label: 'Internship Apps',        sub: 'You submit — controllable',       target: 25,  month12: 25,  color: 'var(--amber)',  deltas: [1] },
  { key: 'oss',     label: 'OSS PRs Submitted',      sub: 'Submitted (you control this)',    target: 1,   month12: 5,   color: 'var(--green)',  deltas: [1] },
];

// ─── Mobile metric card ────────────────────────────────────────────────────────

function MetricCard({ m, val, pct, onUpdate }: {
  m: MetricRow;
  val: number;
  pct: number;
  onUpdate: (key: keyof CareerState['score'], delta: number) => void;
}) {
  return (
    <div className="bg-bg-3 rounded-md p-4 border border-border">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-[13px] font-medium text-text">{m.label}</div>
          <div className="text-[11px] text-text-muted">{m.sub}</div>
        </div>
        <div className="flex gap-1">
          {m.deltas.map((d) => (
            <Button key={d} size="sm" onClick={() => onUpdate(m.key, d)} className="min-h-[32px]">
              +{d}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-3">
        <span className="font-mono font-medium leading-none text-[26px]" style={{ color: m.color }}>
          {val}
        </span>
        <span className="font-mono text-[11px] text-text-sub mb-[2px]">/ {m.target} goal</span>
      </div>
      <ProgressBar value={pct} color={m.color} height="thin" animated className="mt-2" />
    </div>
  );
}

// ─── Score (root) ──────────────────────────────────────────────────────────────

export function Score() {
  const { state } = useCareerStore();
  const { updateScore } = useCareerActions();

  return (
    <div>
      {/* Mobile: metric cards */}
      <div className="block md:hidden flex flex-col gap-3 mb-4">
        {METRICS.map((m) => {
          const val = state.score[m.key] ?? 0;
          const pct = Math.min(100, Math.round(val / m.target * 100));
          return (
            <MetricCard
              key={m.key}
              m={m}
              val={val}
              pct={pct}
              onUpdate={updateScore}
            />
          );
        })}
      </div>

      {/* Desktop: table */}
      <Card className="hidden md:block">
        <SectionTitle>Process Metrics — controllable actions only</SectionTitle>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Metric', 'Now', 'Day 60 Target', 'Month 12', 'Update'].map((h, i) => (
                <th
                  key={h}
                  className="font-mono text-[10px] text-text-sub uppercase tracking-[.07em] text-left px-2 py-[5px] border-b border-border"
                  style={{ width: ['30%', '12%', '20%', '15%', 'auto'][i] }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((m) => {
              const val = state.score[m.key] ?? 0;
              const pct = Math.min(100, Math.round(val / m.target * 100));
              return (
                <tr key={m.key}>
                  <td className="px-2 py-3 border-b border-bg-3 align-middle">
                    <div className="text-[13px] font-medium">{m.label}</div>
                    <div className="text-[11px] text-text-muted">{m.sub}</div>
                  </td>
                  <td className="px-2 py-3 border-b border-bg-3 align-middle">
                    <span className="font-mono text-[22px] font-medium" style={{ color: m.color }}>
                      {val}
                    </span>
                  </td>
                  <td className="px-2 py-3 border-b border-bg-3 align-middle">
                    <span className="font-mono text-[11px] text-text-sub">{m.target}</span>
                    <ProgressBar value={pct} color={m.color} height="thin" animated className="mt-2" />
                  </td>
                  <td className="px-2 py-3 border-b border-bg-3 align-middle font-mono text-[11px] text-text-sub">
                    {m.key === 'apps' ? 'Opens Month 3' : m.month12}
                  </td>
                  <td className="px-2 py-3 border-b border-bg-3 align-middle">
                    {m.deltas.map((d) => (
                      <Button key={d} size="sm" className="mr-1 min-h-[32px]" onClick={() => updateScore(m.key, d)}>
                        +{d}
                      </Button>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Process rules */}
      <Card>
        <SectionTitle>Process Rules</SectionTitle>
        <div className="font-mono text-[11px] text-text-muted leading-[2]">
          Solved ≠ Owned. 1 owned problem worth more than 5 solved-then-forgotten.<br />
          0 commits today = losing day. No streak recovery — just restart tomorrow.<br />
          Verbal Explanations replaced &ldquo;OSS PRs Merged&rdquo; — you control submitting, not merging.
        </div>
      </Card>
    </div>
  );
}
