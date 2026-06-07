import { useMemo } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { Card } from '@/components/ui/Card';
import { Tile } from '@/components/ui/Tile';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import {
  getSprintDay, genMission, buildVerifyScores,
  calcTierReady, calcStreak, getActiveCriticalRisks,
  calcHxOverallPct, RISK_RECOVERY,
} from '@/lib/engine';
import type { RiskId } from '@/types';

// ─── Status banner ────────────────────────────────────────────────────────────

function StatusBanner() {
  const { state } = useCareerStore();
  const sprintDay   = getSprintDay(state.sprintStart);
  const done        = [state.nn.d1, state.nn.d2, state.nn.d3].filter(Boolean).length;
  const criticals   = getActiveCriticalRisks(state.risks);

  let label: string, sub: string, style: React.CSSProperties, icon: string;

  if (criticals.length > 0) {
    icon = '▼'; label = 'Critical risk active';
    sub  = 'Clear red flags in the Risk tab before anything else.';
    style = { background: 'var(--rbg)', borderColor: 'var(--rborder)', color: 'var(--red)' };
  } else if (done === 3) {
    icon = '▲'; label = 'All three done';
    sub  = 'Non-negotiables complete. Keep the streak alive.';
    style = { background: 'var(--gbg)', borderColor: 'var(--gborder)', color: 'var(--green)' };
  } else if (done >= 2) {
    icon = '◆'; label = `${done}/3 done — almost there`;
    sub  = 'One more non-negotiable to finish the day strong.';
    style = { background: 'var(--abg)', borderColor: 'var(--aborder)', color: 'var(--amber)' };
  } else {
    icon = '▼'; label = `${done}/3 done`;
    sub  = 'Open LeetCode. Start the timer. Code before anything else.';
    style = { background: 'var(--rbg)', borderColor: 'var(--rborder)', color: 'var(--red)' };
  }

  return (
    <div
      className="rounded-lg px-4 py-3 border flex items-center justify-between gap-4 mb-5"
      style={style}
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-[13px] font-semibold">{icon}</span>
        <div>
          <div className="font-medium text-[13px]">{label}</div>
          <div className="text-[11px] opacity-80 mt-[1px]">{sub}</div>
        </div>
      </div>
      {sprintDay && (
        <span className="font-mono text-[11px] opacity-60 shrink-0">
          Sprint Day {sprintDay}/60
        </span>
      )}
    </div>
  );
}

// ─── Stat tiles ───────────────────────────────────────────────────────────────

function StatTiles() {
  const { state } = useCareerStore();
  const sprintDay = getSprintDay(state.sprintStart);
  const streak    = useMemo(() => calcStreak(state.cal, sprintDay ?? 0), [state.cal, sprintDay]);
  const hxPct     = useMemo(() => calcHxOverallPct(state.hx), [state.hx]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      <Tile
        label="Streak"
        value={streak}
        sub={streak > 0 ? 'consecutive days' : 'start today'}
        color={streak > 0 ? 'var(--amber)' : 'var(--text3)'}
      />
      <Tile
        label="DSA Owned"
        value={state.score.owned}
        sub={`of 130 target`}
        color="var(--green)"
        progress={Math.min(100, Math.round(state.score.owned / 130 * 100))}
        progressColor="var(--green)"
      />
      <Tile
        label="Mock Interviews"
        value={state.score.mocks}
        sub="of 8 target"
        color="var(--purple)"
        progress={Math.min(100, Math.round(state.score.mocks / 8 * 100))}
        progressColor="var(--purple)"
      />
      <Tile
        label="HireOnyx"
        value={`${hxPct}%`}
        sub="complete"
        color={hxPct >= 80 ? 'var(--green)' : hxPct >= 40 ? 'var(--amber)' : 'var(--text2)'}
        progress={hxPct}
        progressColor={hxPct >= 80 ? 'var(--green)' : 'var(--amber)'}
      />
    </div>
  );
}

// ─── Mission card ─────────────────────────────────────────────────────────────

const MISSION_COLORS: Record<string, string> = {
  DSA:    'var(--amber)',
  BUILD:  'var(--blue)',
  REVIEW: 'var(--teal)',
  HABIT:  'var(--purple)',
};

function MissionCard() {
  const { state } = useCareerStore();
  const sprintDay = getSprintDay(state.sprintStart);
  const scores    = useMemo(() => buildVerifyScores(state.verify), [state.verify]);
  const mission   = useMemo(
    () => genMission(sprintDay, state.risks, state.hx, scores, state.score.mocks),
    [sprintDay, state.risks, state.hx, scores, state.score.mocks]
  );

  const rows = [
    { type: 'DSA',    text: mission.dsa    },
    { type: 'BUILD',  text: mission.build  },
    { type: 'REVIEW', text: mission.review },
    { type: 'HABIT',  text: mission.habit  },
  ];

  return (
    <Card
      className="mb-4"
      accent={mission.isCritical ? 'red' : 'green'}
    >
      <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.09em] mb-4 font-medium">
        {mission.isCritical ? '⚠ Critical — Mission Override' : "Today's Mission"}
      </div>
      <div className="space-y-0">
        {rows.map((row, i) => (
          <div
            key={row.type}
            className={cn(
              'flex gap-4 py-3',
              i < rows.length - 1 && 'border-b border-border'
            )}
          >
            <span
              className="font-mono text-[9px] font-medium uppercase tracking-[0.08em] mt-[2px] w-12 shrink-0"
              style={{ color: MISSION_COLORS[row.type] }}
            >
              {row.type}
            </span>
            <span className="text-[13px] text-text leading-[1.5]">{row.text}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Non-negotiables ─────────────────────────────────────────────────────────

const NN_DEFS = [
  { n: 1 as const, main: 'DSA solved out loud — before phone',   sub: 'Timer on. Approach stated before coding.' },
  { n: 2 as const, main: 'Working code committed to GitHub',     sub: 'Not planning. Committed, running code.' },
  { n: 3 as const, main: 'Failure log updated',                  sub: "What can't you re-solve yet?" },
];

function NonNegotiables() {
  const { state } = useCareerStore();
  const { toggleNN } = useCareerActions();
  const done = [state.nn.d1, state.nn.d2, state.nn.d3].filter(Boolean).length;

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[10px] text-text-sub uppercase tracking-[0.09em] font-medium">
          Non-Negotiables
        </span>
        <span className="font-mono text-[11px] text-text-sub">
          <span style={{ color: done === 3 ? 'var(--green)' : 'var(--text3)' }}>{done}</span>/3
        </span>
      </div>
      <div className="space-y-0">
        {NN_DEFS.map(({ n, main, sub }, i) => {
          const key = `d${n}` as 'd1' | 'd2' | 'd3';
          const checked = state.nn[key];
          return (
            <label
              key={n}
              className={cn(
                'flex items-start gap-3 py-3 cursor-pointer',
                'group transition-colors duration-100',
                i < 2 && 'border-b border-border'
              )}
            >
              <div className="mt-[1px] shrink-0">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleNN(n)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    'w-4 h-4 rounded border-[1.5px] flex items-center justify-center transition-all',
                    checked
                      ? 'bg-green border-green'
                      : 'bg-transparent border-border-2 group-hover:border-border-3'
                  )}
                >
                  {checked && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <div className={cn('text-[13px] font-medium transition-colors', checked && 'line-through text-text-sub')}>
                  {main}
                </div>
                <div className="text-[11px] text-text-sub mt-[2px]">{sub}</div>
              </div>
            </label>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Active risks (progressive disclosure — only shown when risks exist) ─────

function ActiveRisks() {
  const { state } = useCareerStore();
  const { toggleRisk } = useCareerActions();
  const activeRisks = Object.entries(state.risks)
    .filter(([, v]) => v === true)
    .map(([k]) => k as RiskId);

  if (activeRisks.length === 0) return null;

  return (
    <Card accent="red" className="mb-4">
      <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.09em] mb-4 font-medium">
        Active Risks — {activeRisks.length}
      </div>
      <div className="space-y-3">
        {activeRisks.map((id) => (
          <div
            key={id}
            className="flex items-start gap-3 py-3 border-b border-border last:border-0 last:pb-0"
          >
            <div className="flex-1">
              <div className="text-[12px] font-medium text-red mb-1">
                {id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </div>
              <div className="text-[11px] text-text-muted leading-[1.5]">
                {RISK_RECOVERY[id]}
              </div>
            </div>
            <button
              onClick={() => toggleRisk(id)}
              className="text-[10px] font-mono text-text-sub hover:text-green transition-colors shrink-0 mt-[1px]"
            >
              Clear ✓
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Readiness quick view ─────────────────────────────────────────────────────

function ReadinessQuick() {
  const { state } = useCareerStore();
  const scores  = useMemo(() => buildVerifyScores(state.verify), [state.verify]);
  const metrics = { mocks: state.score.mocks, commits: state.score.commits, oss: state.score.oss };
  const tiers   = [
    { id: 'B' as const, label: 'Tier B', color: 'var(--teal)'   },
    { id: 'C' as const, label: 'Tier C', color: 'var(--green)'  },
    { id: 'D' as const, label: 'Tier D', color: 'var(--purple)' },
  ];

  return (
    <Card>
      <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.09em] mb-4 font-medium">
        Package Readiness
      </div>
      <div className="space-y-3">
        {tiers.map(({ id, label, color }) => {
          const { pct, gap } = calcTierReady(id, scores, metrics);
          return (
            <div key={id} className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-text-muted w-12 shrink-0">{label}</span>
              <ProgressBar value={pct} color={color} height="sm" className="flex-1" />
              <span className="font-mono text-[11px] w-8 text-right shrink-0" style={{ color }}>
                {pct}%
              </span>
              <span className="text-[11px] text-text-sub w-28 shrink-0 truncate" title={gap}>
                {gap}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function Today() {
  return (
    <div>
      <StatusBanner />
      <StatTiles />
      <MissionCard />
      <NonNegotiables />
      <ActiveRisks />
      <ReadinessQuick />
    </div>
  );
}
