import { useMemo } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import {
  getSprintDay, genMission, buildVerifyScores,
  calcTierReady, calcStreak, getActiveCriticalRisks,
  calcHxOverallPct, RISK_RECOVERY,
} from '@/lib/engine';
import type { RiskId } from '@/types';

// ─── Start Now Hero ───────────────────────────────────────────────────────────

function StartNowHero() {
  const { state } = useCareerStore();
  const sprintDay = getSprintDay(state.sprintStart);
  const scores    = useMemo(() => buildVerifyScores(state.verify), [state.verify]);
  const mission   = useMemo(
    () => genMission(sprintDay, state.risks, state.hx, scores, state.score.mocks),
    [sprintDay, state.risks, state.hx, scores, state.score.mocks]
  );
  const criticals  = getActiveCriticalRisks(state.risks);
  const isCritical = criticals.length > 0;
  const action     = isCritical ? RISK_RECOVERY[criticals[0]] : mission.dsa;

  return (
    <div
      className="rounded-2xl px-6 py-5 border"
      style={{
        background:  isCritical ? 'rgba(229,83,75,.07)' : 'rgba(29,185,122,.05)',
        borderColor: isCritical ? 'rgba(229,83,75,.25)' : 'rgba(29,185,122,.2)',
      }}
    >
      <div
        className="font-mono text-[10px] uppercase tracking-[0.14em] mb-3 font-semibold"
        style={{ color: isCritical ? 'var(--red)' : 'var(--green)' }}
      >
        {isCritical ? '⚠ Critical — Act Now' : 'Start Now'}
      </div>
      <p className="text-[18px] sm:text-[20px] font-medium leading-[1.45] text-text">
        {action}
      </p>
    </div>
  );
}

// ─── Non-Negotiables Panel ────────────────────────────────────────────────────

const NN_DEFS = [
  { n: 1 as const, main: 'DSA solved out loud — before phone' },
  { n: 2 as const, main: 'Working code committed to GitHub'   },
  { n: 3 as const, main: 'Failure log updated'               },
];

function NonNegotiablesPanel() {
  const { state }    = useCareerStore();
  const { toggleNN } = useCareerActions();
  const done = [state.nn.d1, state.nn.d2, state.nn.d3].filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-border bg-bg-2 p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em]">Non-Negotiables</span>
        <span className="font-mono text-[13px]">
          <span style={{ color: done === 3 ? 'var(--green)' : 'var(--text3)' }}>{done}</span>
          <span className="text-text-sub">/3</span>
        </span>
      </div>
      <div className="divide-y divide-border">
        {NN_DEFS.map(({ n, main }) => {
          const key     = `d${n}` as 'd1' | 'd2' | 'd3';
          const checked = state.nn[key];
          return (
            <label key={n} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 cursor-pointer group">
              <div className="shrink-0">
                <input type="checkbox" checked={checked} onChange={() => toggleNN(n)} className="sr-only" />
                <div
                  className={cn(
                    'w-[18px] h-[18px] rounded-md border-[1.5px] flex items-center justify-center transition-all',
                    checked
                      ? 'bg-green border-green'
                      : 'bg-transparent border-border-2 group-hover:border-border-3'
                  )}
                >
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className={cn('text-[14px] font-medium transition-colors', checked && 'line-through text-text-sub')}>
                {main}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─── Status Row ───────────────────────────────────────────────────────────────

type StatusKey = 'critical' | 'winning' | 'progress' | 'behind';

const STATUS_CFG: Record<StatusKey, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'CRITICAL',    color: 'var(--red)',   bg: 'rgba(229,83,75,.07)',  border: 'rgba(229,83,75,.25)'  },
  winning:  { label: 'WINNING',     color: 'var(--green)', bg: 'rgba(29,185,122,.06)', border: 'rgba(29,185,122,.2)'  },
  progress: { label: 'IN PROGRESS', color: 'var(--amber)', bg: 'rgba(232,147,10,.06)', border: 'rgba(232,147,10,.2)'  },
  behind:   { label: 'BEHIND',      color: 'var(--red)',   bg: 'rgba(229,83,75,.07)',  border: 'rgba(229,83,75,.25)'  },
};

function StatusRow() {
  const { state } = useCareerStore();
  const sprintDay = getSprintDay(state.sprintStart);
  const criticals = getActiveCriticalRisks(state.risks);
  const done      = [state.nn.d1, state.nn.d2, state.nn.d3].filter(Boolean).length;
  const streak    = useMemo(() => calcStreak(state.cal, sprintDay ?? 0), [state.cal, sprintDay]);

  const statusKey: StatusKey = criticals.length > 0 ? 'critical'
    : done === 3 ? 'winning'
    : done >= 1  ? 'progress'
    : 'behind';

  const cfg = STATUS_CFG[statusKey];

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-2xl p-4 border flex flex-col" style={{ background: cfg.bg, borderColor: cfg.border }}>
        <span className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-2">Today</span>
        <span className="font-mono text-[26px] font-bold leading-none mb-1" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
        <span className="text-[12px]" style={{ color: cfg.color, opacity: 0.65 }}>
          {done}/3 done
        </span>
      </div>

      <div className="rounded-2xl p-4 border border-border bg-bg-2 flex flex-col">
        <span className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-2">Sprint Day</span>
        <span className="font-mono text-[26px] font-bold leading-none mb-1 text-amber">
          {sprintDay ?? '—'}
        </span>
        <span className="text-[12px] text-text-sub">of 60</span>
      </div>

      <div className="rounded-2xl p-4 border border-border bg-bg-2 flex flex-col">
        <span className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-2">Streak</span>
        <span
          className="font-mono text-[26px] font-bold leading-none mb-1"
          style={{ color: streak > 0 ? 'var(--amber)' : 'var(--text4)' }}
        >
          {streak}
        </span>
        <span className="text-[12px] text-text-sub">
          {streak > 0 ? 'consecutive days' : 'start today'}
        </span>
      </div>
    </div>
  );
}

// ─── Mission Panel ────────────────────────────────────────────────────────────

const MISSION_COLORS: Record<string, string> = {
  DSA:    'var(--amber)',
  BUILD:  'var(--blue)',
  REVIEW: 'var(--teal)',
  HABIT:  'var(--purple)',
};

function MissionPanel() {
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
    <div className="rounded-2xl border border-border bg-bg-2 p-5">
      <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-4">
        {mission.isCritical ? '⚠ Mission Override' : "Today's Mission"}
      </div>
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.type} className="flex gap-4 py-3 first:pt-0 last:pb-0">
            <span
              className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] mt-[3px] w-12 shrink-0"
              style={{ color: MISSION_COLORS[row.type] }}
            >
              {row.type}
            </span>
            <span className="text-[13px] leading-[1.55] text-text">{row.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Active Risks ─────────────────────────────────────────────────────────────

function ActiveRisksPanel() {
  const { state }      = useCareerStore();
  const { toggleRisk } = useCareerActions();
  const activeRisks = (Object.entries(state.risks) as [RiskId, boolean | undefined][])
    .filter(([, v]) => v === true)
    .map(([k]) => k);

  if (activeRisks.length === 0) return null;

  return (
    <div className="rounded-2xl border p-5" style={{ background: 'rgba(229,83,75,.06)', borderColor: 'rgba(229,83,75,.22)' }}>
      <div className="font-mono text-[10px] text-red uppercase tracking-[0.1em] mb-4">
        Active Risks — {activeRisks.length}
      </div>
      <div className="space-y-4">
        {activeRisks.map((id) => (
          <div key={id} className="flex items-start gap-4">
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-red mb-1">
                {id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </div>
              <div className="text-[13px] text-text-sub leading-[1.5]">{RISK_RECOVERY[id]}</div>
            </div>
            <button
              onClick={() => toggleRisk(id)}
              className="font-mono text-[11px] text-text-sub hover:text-green transition-colors shrink-0 px-3 py-[6px] rounded-lg border border-border bg-bg-3 hover:border-green cursor-pointer"
            >
              Clear ✓
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Grid ────────────────────────────────────────────────────────────────

function StatGrid() {
  const { state }   = useCareerStore();
  const hxPct       = useMemo(() => calcHxOverallPct(state.hx), [state.hx]);
  const activeCount = Object.values(state.risks).filter(Boolean).length;
  const critCount   = getActiveCriticalRisks(state.risks).length;

  const tiles = [
    {
      label: 'DSA Owned',
      value: state.score.owned,
      sub:   `${state.score.owned}/130`,
      color: 'var(--green)',
      prog:  Math.min(100, Math.round(state.score.owned / 130 * 100)),
    },
    {
      label: 'Mock Interviews',
      value: state.score.mocks,
      sub:   `${state.score.mocks}/8`,
      color: 'var(--purple)',
      prog:  Math.min(100, Math.round(state.score.mocks / 8 * 100)),
    },
    {
      label: 'HireOnyx',
      value: `${hxPct}%`,
      sub:   'complete',
      color: hxPct >= 80 ? 'var(--green)' : hxPct >= 40 ? 'var(--amber)' : 'var(--text3)',
      prog:  hxPct,
    },
    {
      label: 'Active Risks',
      value: activeCount,
      sub:   critCount > 0 ? `${critCount} critical` : activeCount === 0 ? 'all clear' : 'active',
      color: critCount > 0 ? 'var(--red)' : activeCount > 0 ? 'var(--amber)' : 'var(--green)',
      prog:  undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-2xl p-4 border border-border bg-bg-2">
          <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-2">{t.label}</div>
          <div className="font-mono text-[24px] font-bold leading-none mb-1" style={{ color: t.color }}>
            {t.value}
          </div>
          <div className="text-[11px] text-text-sub mb-2">{t.sub}</div>
          {t.prog !== undefined && (
            <ProgressBar value={t.prog} color={t.color} height="xs" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Readiness Panel ──────────────────────────────────────────────────────────

function ReadinessPanel() {
  const { state } = useCareerStore();
  const scores    = useMemo(() => buildVerifyScores(state.verify), [state.verify]);
  const metrics   = { mocks: state.score.mocks, commits: state.score.commits, oss: state.score.oss };

  const tiers = [
    { id: 'B' as const, label: 'Tier B — Fast hire',   color: 'var(--teal)'   },
    { id: 'C' as const, label: 'Tier C — Competitive', color: 'var(--green)'  },
    { id: 'D' as const, label: 'Tier D — Top tier',    color: 'var(--purple)' },
  ];

  return (
    <div className="rounded-2xl border border-border bg-bg-2 p-5">
      <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-4">Package Readiness</div>
      <div className="space-y-4">
        {tiers.map(({ id, label, color }) => {
          const { pct, gap } = calcTierReady(id, scores, metrics);
          return (
            <div key={id}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] text-text-muted">{label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-text-sub">{gap}</span>
                  <span className="font-mono text-[15px] font-bold" style={{ color }}>{pct}%</span>
                </div>
              </div>
              <ProgressBar value={pct} color={color} height="sm" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function Today() {
  return (
    <div className="space-y-5">
      <StartNowHero />
      <NonNegotiablesPanel />
      <StatusRow />
      <MissionPanel />
      <ActiveRisksPanel />
      <StatGrid />
      <ReadinessPanel />
    </div>
  );
}
