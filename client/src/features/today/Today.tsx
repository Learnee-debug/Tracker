import { useMemo } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import type { TabId } from '@/components/layout/Tabs';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Tile } from '@/components/ui/Tile';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import {
  getSprintDay,
  genMission,
  buildVerifyScores,
  calcTierReady,
  calcStreak,
  getActiveCriticalRisks,
} from '@/lib/engine';

// ─── Mission Box ──────────────────────────────────────────────────────────────

function MissionBox() {
  const { state } = useCareerStore();
  const sprintDay = getSprintDay(state.sprintStart);
  const scores = useMemo(() => buildVerifyScores(state.verify), [state.verify]);
  const mission = useMemo(
    () => genMission(sprintDay, state.risks, state.hx, scores, state.score.mocks),
    [sprintDay, state.risks, state.hx, scores, state.score.mocks]
  );

  return (
    <div
      className={cn(
        'rounded-md p-[14px_16px] mb-3 border-l-[3px] border border-border bg-bg-3',
        mission.isCritical ? 'border-l-red' : 'border-l-green'
      )}
    >
      <div className="flex items-center justify-between mb-[10px]">
        <span
          className={cn(
            'font-mono text-[10px] uppercase tracking-[.1em]',
            mission.isCritical ? 'text-red' : 'text-green'
          )}
        >
          ▣ Today&apos;s Mission
        </span>
      </div>
      {(
        [
          { type: 'DSA',    text: mission.dsa    },
          { type: 'BUILD',  text: mission.build  },
          { type: 'REVIEW', text: mission.review },
          { type: 'HABIT',  text: mission.habit  },
        ] as const
      ).map((row) => (
        <div
          key={row.type}
          className="grid gap-2 py-[6px] border-b border-bg-4 last:border-b-0"
          style={{ gridTemplateColumns: '70px 1fr' }}
        >
          <span className="font-mono text-[10px] text-text-sub uppercase pt-[1px]">
            {row.type}
          </span>
          <span className="text-[13px] text-text leading-[1.4]">{row.text}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Status Block ─────────────────────────────────────────────────────────────

function StatusBlock() {
  const { state } = useCareerStore();
  const sprintDay = getSprintDay(state.sprintStart);
  const done = [state.nn.d1, state.nn.d2, state.nn.d3].filter(Boolean).length;
  const criticals = getActiveCriticalRisks(state.risks);

  let label: string;
  let sub: string;
  let colorClass: string;
  let bgStyle: React.CSSProperties;

  if (criticals.length > 0) {
    label = '▼ CRITICAL RISK';
    sub = 'Clear red flags in Risk tab immediately.';
    colorClass = 'text-red';
    bgStyle = { background: 'rgba(229,85,85,.07)', borderColor: 'rgba(229,85,85,.25)' };
  } else if (done === 3) {
    label = '▲ WINNING';
    sub = 'All 3 done. No critical risks.';
    colorClass = 'text-green';
    bgStyle = { background: 'rgba(34,201,141,.07)', borderColor: 'rgba(34,201,141,.28)' };
  } else if (done >= 2) {
    label = '⚡ CLOSE';
    sub = `${done}/3 done. Finish the day.`;
    colorClass = 'text-amber';
    bgStyle = { background: 'rgba(240,160,48,.07)', borderColor: 'rgba(240,160,48,.25)' };
  } else {
    label = '▼ BEHIND';
    sub = `${done}/3 done. Open LeetCode now.`;
    colorClass = 'text-red';
    bgStyle = { background: 'rgba(229,85,85,.07)', borderColor: 'rgba(229,85,85,.25)' };
  }

  return (
    <div
      className="rounded-md px-[18px] py-3 mb-3 border flex items-center justify-between flex-wrap gap-2"
      style={bgStyle}
    >
      <div>
        <div className={cn('font-mono text-[18px] font-medium', colorClass)}>{label}</div>
        <div className="text-[12px] text-text-muted">{sub}</div>
      </div>
      <div className="font-mono text-[10px] text-text-sub">
        {sprintDay ? `SPRINT DAY ${sprintDay}/60` : 'Set sprint start in Calendar tab'}
      </div>
    </div>
  );
}

// ─── Non-Negotiables ──────────────────────────────────────────────────────────

const NN_ITEMS = [
  { n: 1 as const, main: 'DSA solved out loud — before phone',      sub: 'Timer on. Approach stated before coding.' },
  { n: 2 as const, main: 'Working code committed to GitHub',        sub: 'Not planning. Committed, running code.' },
  { n: 3 as const, main: 'Failure log updated',                     sub: "What can't you re-solve yet?" },
];

function NonNegotiables() {
  const { state } = useCareerStore();
  const { toggleNN } = useCareerActions();

  return (
    <Card>
      <SectionTitle>Non-Negotiables — resets daily</SectionTitle>
      {NN_ITEMS.map(({ n, main, sub }) => {
        const key = `d${n}` as 'd1' | 'd2' | 'd3';
        const checked = state.nn[key];
        return (
          <div
            key={n}
            className="flex items-start gap-[10px] py-[9px] border-b border-border last:border-b-0"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleNN(n)}
              className="mt-[2px] w-[14px] h-[14px] cursor-pointer flex-shrink-0 accent-green"
            />
            <div>
              <div className={cn('text-[13px]', checked && 'line-through text-text-sub')}>
                {main}
              </div>
              <div className="text-[11px] text-text-muted mt-[1px]">{sub}</div>
            </div>
          </div>
        );
      })}
    </Card>
  );
}

// ─── Readiness Bars ───────────────────────────────────────────────────────────

function ReadinessBars() {
  const { state } = useCareerStore();
  const scores = useMemo(() => buildVerifyScores(state.verify), [state.verify]);
  const metrics = {
    mocks:   state.score.mocks,
    commits: state.score.commits,
    oss:     state.score.oss,
  };

  const tiers = [
    { id: 'B' as const, color: 'var(--teal)',   label: 'Tier B' },
    { id: 'C' as const, color: 'var(--green)',  label: 'Tier C' },
    { id: 'D' as const, color: 'var(--purple)', label: 'Tier D' },
  ];

  return (
    <Card>
      <SectionTitle>Top Package Readiness — process-based</SectionTitle>
      {tiers.map(({ id, color, label }) => {
        const { pct, gap } = calcTierReady(id, scores, metrics);
        return (
          <div
            key={id}
            className="grid items-center gap-[10px] py-[7px] border-b border-bg-3 last:border-b-0"
            style={{ gridTemplateColumns: '80px 1fr 48px 160px' }}
          >
            <span className="font-mono text-[11px] text-text-muted">{label}</span>
            <ProgressBar value={pct} color={color} height="normal" />
            <span className="font-mono text-[12px] font-medium text-right" style={{ color }}>
              {pct}%
            </span>
            <span className="text-[11px] text-text-sub">{gap}</span>
          </div>
        );
      })}
      <div className="text-[10px] text-text-sub mt-2 font-mono">
        Based on Verify tab scores + process metrics only
      </div>
    </Card>
  );
}

// ─── Quick Stats ──────────────────────────────────────────────────────────────

function QuickStats() {
  const { state } = useCareerStore();
  const sprintDay = getSprintDay(state.sprintStart);
  const streak = useMemo(
    () => calcStreak(state.cal, sprintDay ?? 0),
    [state.cal, sprintDay]
  );
  const activeRisks = Object.values(state.risks).filter(Boolean).length;

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))' }}>
      <Tile
        label="DSA Owned"
        value={state.score.owned}
        sub="Target: 130/Day60"
        color="var(--green)"
        progress={Math.min(100, Math.round(state.score.owned / 130 * 100))}
        progressColor="var(--green)"
      />
      <Tile
        label="Streak"
        value={streak}
        sub="Consecutive good days"
        color="var(--amber)"
      />
      <Tile
        label="Mock Int."
        value={state.score.mocks}
        sub="Target: 8/Day60"
        color="var(--purple)"
        progress={Math.min(100, Math.round(state.score.mocks / 8 * 100))}
        progressColor="var(--purple)"
      />
      <Tile
        label="Active Risks"
        value={activeRisks}
        sub={activeRisks > 0 ? 'Check Risk tab' : 'All clear'}
        color={activeRisks > 0 ? 'var(--red)' : 'var(--green)'}
      />
    </div>
  );
}

// ─── Today (root) ─────────────────────────────────────────────────────────────

interface TodayProps {
  setTab?: (tab: TabId) => void;
}

export function Today({ setTab: _setTab }: TodayProps) {
  return (
    <div>
      <MissionBox />
      <StatusBlock />
      <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <NonNegotiables />
        <ReadinessBars />
      </div>
      <QuickStats />
    </div>
  );
}
