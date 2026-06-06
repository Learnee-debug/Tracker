import { useMemo, useState } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Tile } from '@/components/ui/Tile';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import {
  getSprintDay,
  genMission,
  buildVerifyScores,
  calcTierReady,
  calcStreak,
  getActiveCriticalRisks,
} from '@/lib/engine';
import { CHALLENGES, SKILL_KEYS } from '@/data/challenges';
import type { TabId } from '@/components/layout/Tabs';

// ─── Focus Block ──────────────────────────────────────────────────────────────

interface FocusBlockProps {
  dsaTask: string;
  d1Done: boolean;
  onDone: () => void;
}

function FocusBlock({ dsaTask, d1Done, onDone }: FocusBlockProps) {
  const [expanded, setExpanded] = useState(true);

  if (d1Done) {
    return (
      <div className="mb-4 rounded-lg px-4 py-3 border border-[rgba(34,201,141,.3)] bg-[rgba(34,201,141,.06)] flex items-center justify-between">
        <span className="font-mono text-[12px] text-green">DSA Complete ✓ — Check all 3 non-negotiables</span>
      </div>
    );
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full mb-4 rounded-lg px-4 py-3 border-l-4 border border-border bg-bg-3 flex items-center justify-between text-left hover:bg-bg-4 transition-colors"
        style={{ borderLeftColor: 'var(--green)' }}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-green">▶ START NOW</span>
          <span className="text-[13px] text-text">{dsaTask}</span>
          <span className="font-mono text-[11px] text-amber">25 min</span>
        </div>
        <span className="font-mono text-[10px] text-text-sub">▼</span>
      </button>
    );
  }

  return (
    <div
      className="mb-4 rounded-lg border border-border bg-bg-2"
      style={{ borderLeftWidth: 4, borderLeftColor: 'var(--green)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <span className="font-mono text-[11px] text-green tracking-[.08em]">START NOW</span>
        <button
          onClick={() => setExpanded(false)}
          className="font-mono text-[10px] text-text-sub hover:text-text transition-colors cursor-pointer border-none bg-none"
        >
          minimize ▲
        </button>
      </div>

      {/* Task */}
      <div className="px-5 pb-2">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[20px] font-medium text-text leading-tight">{dsaTask}</span>
          <span className="font-mono text-[13px] text-amber flex-shrink-0">25 min</span>
        </div>
        <div className="text-[12px] text-text-muted mt-1">DSA problem — verbal explanation required</div>
      </div>

      {/* Success criteria */}
      <div className="px-5 py-3">
        <span className="text-[12px] text-green">
          Success: solve without hints, explain your approach aloud before coding.
        </span>
      </div>

      {/* Divider + actions */}
      <div className="border-t border-border px-5 py-3 flex flex-col sm:flex-row gap-2 justify-between">
        <a
          href="https://leetcode.com/problemset/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] px-[14px] py-[6px] rounded border border-border bg-bg-3 text-text-muted hover:bg-bg-4 hover:text-text transition-colors text-center"
        >
          Open LeetCode
        </a>
        <Button variant="primary" onClick={onDone} className="sm:w-auto">
          Done for today ✓
        </Button>
      </div>
    </div>
  );
}

// ─── Status Hero ──────────────────────────────────────────────────────────────

interface StatusHeroProps {
  done: number;
  sprintDay: number | null;
  hasCritical: boolean;
  setTab?: (tab: TabId) => void;
}

function StatusHero({ done, sprintDay, hasCritical, setTab }: StatusHeroProps) {
  let label: string;
  let sub: string;
  let colorVar: string;
  let bgRgba: string;
  let borderColor: string;
  let useGlow = false;

  if (hasCritical) {
    label = 'CRITICAL RISK';
    sub = 'Clear red flags in Risk tab immediately.';
    colorVar = 'var(--red)';
    bgRgba = 'rgba(229,85,85,.10)';
    borderColor = 'var(--red)';
    useGlow = true;
  } else if (done === 3) {
    label = 'WINNING';
    sub = 'All 3 non-negotiables complete. No critical risks.';
    colorVar = 'var(--green)';
    bgRgba = 'rgba(34,201,141,.10)';
    borderColor = 'var(--green)';
  } else if (done >= 2) {
    label = 'CLOSE';
    sub = `${done}/3 done — finish the day strong.`;
    colorVar = 'var(--amber)';
    bgRgba = 'rgba(240,160,48,.08)';
    borderColor = 'var(--amber)';
  } else {
    label = 'BEHIND';
    sub = `${done}/3 non-negotiables done. Open LeetCode now.`;
    colorVar = 'var(--red)';
    bgRgba = 'rgba(229,85,85,.08)';
    borderColor = 'var(--red)';
  }

  const sprintPct = sprintDay ? Math.round((sprintDay / 60) * 100) : 0;

  return (
    <div
      className="mb-4 rounded-lg p-5 border"
      style={{
        background: bgRgba,
        borderColor: borderColor,
        borderLeftWidth: 4,
        boxShadow: useGlow ? 'var(--glow-red)' : 'none',
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-1">
        <span
          className="font-mono font-medium leading-none text-[36px] sm:text-[40px]"
          style={{ color: colorVar }}
        >
          {label}
        </span>
        {sprintDay ? (
          <span className="font-mono text-[11px] text-amber flex-shrink-0 mt-1">
            SPRINT D{sprintDay}/60
          </span>
        ) : (
          <button
            onClick={() => setTab?.('calendar')}
            className="font-mono text-[11px] text-amber hover:underline cursor-pointer bg-none border-none flex-shrink-0 mt-1"
          >
            Set sprint start →
          </button>
        )}
      </div>
      <div className="text-[13px] text-text-muted mb-3">{sub}</div>
      {sprintDay && (
        <ProgressBar
          value={sprintPct}
          color={colorVar}
          height="lg"
          animated
          label={`Day ${sprintDay} / 60`}
        />
      )}
    </div>
  );
}

// ─── Mission Box ──────────────────────────────────────────────────────────────

const MISSION_BADGE: Record<string, { label: string; variant: 'amber' | 'blue' | 'teal' | 'purple' }> = {
  DSA:    { label: 'DSA',    variant: 'amber' },
  BUILD:  { label: 'BUILD',  variant: 'blue' },
  REVIEW: { label: 'REVIEW', variant: 'teal' },
  HABIT:  { label: 'HABIT',  variant: 'purple' },
};

function MissionBox() {
  const { state } = useCareerStore();
  const sprintDay = getSprintDay(state.sprintStart);
  const scores = useMemo(() => buildVerifyScores(state.verify), [state.verify]);
  const mission = useMemo(
    () => genMission(sprintDay, state.risks, state.hx, scores, state.score.mocks),
    [sprintDay, state.risks, state.hx, scores, state.score.mocks]
  );

  return (
    <Card
      className="h-full !mb-0"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: mission.isCritical ? 'var(--red)' : 'var(--green)',
      } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 mb-3">
        <Badge variant={mission.isCritical ? 'red' : 'green'} size="md">
          {mission.isCritical ? 'CRITICAL' : 'ON TRACK'}
        </Badge>
        <span className="font-mono text-[10px] text-text-sub tracking-[.08em] uppercase">
          Today's Mission
        </span>
      </div>
      {(
        [
          { type: 'DSA',    text: mission.dsa    },
          { type: 'BUILD',  text: mission.build  },
          { type: 'REVIEW', text: mission.review },
          { type: 'HABIT',  text: mission.habit  },
        ] as const
      ).map((row) => {
        const b = MISSION_BADGE[row.type];
        return (
          <div
            key={row.type}
            className="grid gap-3 py-[10px] border-b border-bg-4 last:border-b-0"
            style={{ gridTemplateColumns: '68px 1fr' }}
          >
            <Badge variant={b.variant}>{b.label}</Badge>
            <span className="text-[13px] text-text leading-[1.4]">{row.text}</span>
          </div>
        );
      })}
    </Card>
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
  const done = [state.nn.d1, state.nn.d2, state.nn.d3].filter(Boolean).length;
  const allDone = done === 3;

  return (
    <Card
      variant={allDone ? 'success' : 'default'}
      className="h-full !mb-0"
    >
      <SectionTitle
        right={
          <span
            className="font-mono text-[11px]"
            style={{ color: done === 3 ? 'var(--green)' : done === 2 ? 'var(--amber)' : 'var(--text3)' }}
          >
            {done}/3
          </span>
        }
      >
        Non-Negotiables
      </SectionTitle>

      {NN_ITEMS.map(({ n, main, sub }) => {
        const key = `d${n}` as 'd1' | 'd2' | 'd3';
        const checked = state.nn[key];
        return (
          <div
            key={n}
            className="flex items-start gap-3 py-[12px] border-b border-border last:border-b-0 min-h-[48px]"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleNN(n)}
              className="mt-[2px] w-[16px] h-[16px] cursor-pointer flex-shrink-0 accent-green"
            />
            <div>
              <div className={cn('text-[13px] transition-all duration-200', checked && 'line-through text-text-sub')}>
                {main}
              </div>
              <div className="text-[11px] text-text-muted mt-[1px]">{sub}</div>
            </div>
          </div>
        );
      })}

      {allDone && (
        <div className="mt-3 pt-3 border-t border-[rgba(34,201,141,.2)] font-mono text-[13px] text-green">
          Day Complete ✓
        </div>
      )}
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      <Tile
        label="DSA Owned"
        value={state.score.owned}
        sub="Target: 130/Day 60"
        color="var(--green)"
        progress={Math.min(100, Math.round(state.score.owned / 130 * 100))}
        progressColor="var(--green)"
        size="lg"
      />
      <Tile
        label="Streak"
        value={streak}
        sub="Consecutive good days"
        color="var(--amber)"
        size="lg"
        glow={streak >= 7}
      />
      <Tile
        label="Mock Int."
        value={state.score.mocks}
        sub="Target: 8/Day 60"
        color="var(--purple)"
        progress={Math.min(100, Math.round(state.score.mocks / 8 * 100))}
        progressColor="var(--purple)"
        size="lg"
      />
      <Tile
        label="Active Risks"
        value={activeRisks}
        sub={activeRisks > 0 ? 'Check Risk tab' : 'All clear'}
        color={activeRisks > 0 ? 'var(--red)' : 'var(--green)'}
        size="lg"
      />
    </div>
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
    <Card className="mb-4">
      <SectionTitle>Top Package Readiness</SectionTitle>
      {tiers.map(({ id, color, label }) => {
        const { pct, gap } = calcTierReady(id, scores, metrics);
        return (
          <div key={id} className="py-[7px] border-b border-bg-3 last:border-b-0">
            {/* Desktop: 4-col grid */}
            <div className="hidden sm:grid items-center gap-[10px]"
              style={{ gridTemplateColumns: '90px 1fr 44px 1fr' }}
            >
              <span className="font-mono text-[11px] text-text-muted">{label}</span>
              <ProgressBar value={pct} color={color} height="normal" animated />
              <span className="font-mono text-[12px] font-medium text-right" style={{ color }}>
                {pct}%
              </span>
              <span className="text-[11px] text-text-sub">{gap}</span>
            </div>
            {/* Mobile: stacked */}
            <div className="sm:hidden">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[11px] text-text-muted w-[60px]">{label}</span>
                <ProgressBar value={pct} color={color} height="normal" animated className="flex-1" />
                <span className="font-mono text-[12px] font-medium" style={{ color }}>{pct}%</span>
              </div>
              <div className="text-[11px] text-text-sub pl-[68px]">{gap}</div>
            </div>
          </div>
        );
      })}
      <div className="text-[10px] text-text-sub mt-2 font-mono">
        Based on Verify tab scores + process metrics
      </div>
    </Card>
  );
}

// ─── North Star Progress ──────────────────────────────────────────────────────

function getNorthStarData(
  scores: Record<string, number>,
  metrics: { mocks: number; commits: number; oss: number },
  owned: number,
) {
  // Overall %: Tier C readiness is the primary internship target
  const dsaPct     = Math.min(100, Math.round(owned / 130 * 100));
  const avgSkill   = Math.round(
    SKILL_KEYS.reduce((acc, k) => acc + (scores[k] ?? 0), 0) / SKILL_KEYS.length * 10
  );
  const mocksPct   = Math.min(100, Math.round(metrics.mocks / 8 * 100));
  const commitsPct = Math.min(100, Math.round(metrics.commits / 60 * 100));
  // Weighted composite: DSA 35%, Verify skills 40%, Mocks 15%, Commits 10%
  const overall = Math.round(dsaPct * 0.35 + avgSkill * 0.40 + mocksPct * 0.15 + commitsPct * 0.10);

  // Top 3 bottlenecks: lowest verify scores
  const bottlenecks = SKILL_KEYS
    .map((k) => ({ label: CHALLENGES[k].label, score: scores[k] ?? 0 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  // Next milestones
  const milestones: string[] = [];

  const weakSkill = SKILL_KEYS
    .filter((k) => (scores[k] ?? 0) < 6)
    .sort((a, b) => (scores[a] ?? 0) - (scores[b] ?? 0))[0];
  if (weakSkill) {
    milestones.push(`Verify ${CHALLENGES[weakSkill].label} to 6/10`);
  }

  if (owned < 130) {
    const gap = Math.min(10, 130 - owned);
    milestones.push(`Own ${gap} more DSA problems`);
  }

  if (metrics.mocks < 8) {
    const gap = 8 - metrics.mocks;
    milestones.push(`Complete ${gap} more mock interview${gap > 1 ? 's' : ''}`);
  }

  if (milestones.length < 3 && metrics.commits < 60) {
    milestones.push(`Log ${60 - metrics.commits} more GitHub commits`);
  }

  return { overall, bottlenecks, milestones: milestones.slice(0, 3) };
}

function NorthStarProgress() {
  const { state } = useCareerStore();
  const scores = useMemo(() => buildVerifyScores(state.verify), [state.verify]);
  const metrics = {
    mocks:   state.score.mocks,
    commits: state.score.commits,
    oss:     state.score.oss,
  };

  const { overall, bottlenecks, milestones } = useMemo(
    () => getNorthStarData(scores, metrics, state.score.owned),
    [scores, metrics, state.score.owned]
  );

  const color = overall >= 70 ? 'var(--green)' : overall >= 40 ? 'var(--amber)' : 'var(--red)';

  return (
    <Card>
      <SectionTitle>North Star — Internship Readiness</SectionTitle>

      {/* Overall % */}
      <div className="flex items-end gap-4 mb-4">
        <div>
          <div className="font-mono font-medium leading-none mb-1" style={{ fontSize: 'var(--text-data)', color }}>
            {overall}%
          </div>
          <div className="text-[11px] text-text-sub">Overall readiness</div>
        </div>
        <ProgressBar
          value={overall}
          color={color}
          height="lg"
          animated
          className="flex-1 mb-[18px]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top 3 bottlenecks */}
        <div>
          <div className="font-mono text-[10px] text-text-sub uppercase tracking-[.08em] mb-2">
            Top Bottlenecks
          </div>
          {bottlenecks.map(({ label, score }) => (
            <div key={label} className="flex items-center gap-2 mb-[6px]">
              <span className="text-[12px] text-text-muted flex-1">{label}</span>
              <ProgressBar
                value={score * 10}
                color={score >= 6 ? 'var(--teal)' : score >= 3 ? 'var(--amber)' : 'var(--red)'}
                height="thin"
                className="w-20"
              />
              <span className="font-mono text-[11px] text-text-sub w-[28px] text-right">
                {score}/10
              </span>
            </div>
          ))}
        </div>

        {/* Next milestones */}
        <div>
          <div className="font-mono text-[10px] text-text-sub uppercase tracking-[.08em] mb-2">
            Next Milestones
          </div>
          {milestones.length > 0 ? (
            milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-2 mb-[6px]">
                <span className="text-green font-mono text-[11px] mt-[1px] flex-shrink-0">→</span>
                <span className="text-[12px] text-text-muted">{m}</span>
              </div>
            ))
          ) : (
            <div className="text-[12px] text-green font-mono">All milestones met ✓</div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Today (root) ─────────────────────────────────────────────────────────────

interface TodayProps {
  setTab?: (tab: TabId) => void;
}

export function Today({ setTab }: TodayProps) {
  const { state } = useCareerStore();
  const { toggleNN } = useCareerActions();
  const sprintDay = getSprintDay(state.sprintStart);
  const criticals = getActiveCriticalRisks(state.risks);
  const done = [state.nn.d1, state.nn.d2, state.nn.d3].filter(Boolean).length;

  const scores = useMemo(() => buildVerifyScores(state.verify), [state.verify]);
  const mission = useMemo(
    () => genMission(sprintDay, state.risks, state.hx, scores, state.score.mocks),
    [sprintDay, state.risks, state.hx, scores, state.score.mocks]
  );

  return (
    <div>
      {/* 1. Focus Block — Action First */}
      <FocusBlock
        dsaTask={mission.dsa}
        d1Done={state.nn.d1}
        onDone={() => toggleNN(1)}
      />

      {/* 2. Status Hero */}
      <StatusHero
        done={done}
        sprintDay={sprintDay}
        hasCritical={criticals.length > 0}
        setTab={setTab}
      />

      {/* 3. Mission + Non-Negotiables */}
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-3 mb-4">
        <MissionBox />
        <NonNegotiables />
      </div>

      {/* 4. Quick Stats */}
      <QuickStats />

      {/* 5. Readiness Bars */}
      <ReadinessBars />

      {/* 6. North Star */}
      <NorthStarProgress />
    </div>
  );
}
