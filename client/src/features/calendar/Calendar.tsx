import { useMemo, useState, useEffect } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { cn } from '@/lib/utils';
import { calcStreak, getSprintDay } from '@/lib/engine';
import type { CalDayState } from '@/types';

const STATE_COLOR: Record<Exclude<CalDayState, ''>, string> = {
  good:    'var(--green)',
  partial: 'var(--amber)',
  miss:    'var(--red)',
};

// ─── Sprint Health ────────────────────────────────────────────────────────────

interface HealthConfig {
  label:   string;
  insight: string;
  color:   string;
  bg:      string;
  border:  string;
}

function getHealth(streak: number, good: number, partial: number, miss: number, logged: number): HealthConfig {
  if (logged === 0) return {
    label:   'NOT STARTED',
    insight: 'Set a start date and mark your first day.',
    color:   'var(--text3)',
    bg:      'rgba(255,255,255,.03)',
    border:  'rgba(255,255,255,.08)',
  };
  if (miss >= 3) return {
    label:   'DRIFT WARNING',
    insight: `${miss} misses detected. Identify the root cause before this becomes a pattern.`,
    color:   'var(--red)',
    bg:      'rgba(229,83,75,.07)',
    border:  'rgba(229,83,75,.25)',
  };
  if (partial >= 3 && good < partial) return {
    label:   'PARTIAL DRIFT',
    insight: 'More partial than good days. Commit to at least one non-negotiable minimum every day.',
    color:   'var(--amber)',
    bg:      'rgba(232,147,10,.07)',
    border:  'rgba(232,147,10,.25)',
  };
  if (streak >= 7) return {
    label:   'EXCEPTIONAL',
    insight: `${streak}-day streak. Rare momentum — protect it at all costs.`,
    color:   'var(--green)',
    bg:      'rgba(29,185,122,.07)',
    border:  'rgba(29,185,122,.22)',
  };
  if (streak >= 3) return {
    label:   'ON TRACK',
    insight: `${streak}-day streak established. Don't break the chain.`,
    color:   'var(--green)',
    bg:      'rgba(29,185,122,.06)',
    border:  'rgba(29,185,122,.18)',
  };
  if (streak === 0 && logged > 5) return {
    label:   'STREAK BROKEN',
    insight: 'Restart today. Focus on process, not the number.',
    color:   'var(--red)',
    bg:      'rgba(229,83,75,.06)',
    border:  'rgba(229,83,75,.2)',
  };
  return {
    label:   'IN PROGRESS',
    insight: 'Keep logging daily. Patterns take 2 weeks to become visible.',
    color:   'var(--amber)',
    bg:      'rgba(232,147,10,.05)',
    border:  'rgba(232,147,10,.15)',
  };
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

export function Calendar() {
  const { state }                       = useCareerStore();
  const { setSprintStart, cycleCalDay } = useCareerActions();

  const sprintDay = getSprintDay(state.sprintStart);
  const [dateText, setDateText] = useState(state.sprintStart);
  useEffect(() => { setDateText(state.sprintStart); }, [state.sprintStart]);

  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const streak = useMemo(() => calcStreak(state.cal, sprintDay ?? 0), [state.cal, sprintDay]);

  const stats = useMemo(() => {
    const vals = Object.values(state.cal);
    return {
      good:    vals.filter((v) => v === 'good').length,
      partial: vals.filter((v) => v === 'partial').length,
      miss:    vals.filter((v) => v === 'miss').length,
      logged:  vals.filter((v) => v !== '').length,
    };
  }, [state.cal]);

  const health = getHealth(streak, stats.good, stats.partial, stats.miss, stats.logged);

  return (
    <div className="space-y-5">
      {/* ── Sprint Health Hero ──────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl px-6 py-5 border"
        style={{ background: health.bg, borderColor: health.border }}
      >
        <div
          className="font-mono text-[10px] uppercase tracking-[0.14em] mb-2 font-semibold"
          style={{ color: health.color }}
        >
          Sprint Health
        </div>
        <div
          className="font-mono text-[32px] font-bold leading-none mb-3"
          style={{ color: health.color }}
        >
          {health.label}
        </div>
        <p className="text-[15px] leading-[1.55] text-text">{health.insight}</p>
      </div>

      {/* ── Stat tiles ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Streak',  value: streak,        color: 'var(--amber)' },
          { label: 'Good',    value: stats.good,    color: 'var(--green)' },
          { label: 'Partial', value: stats.partial, color: 'var(--amber)' },
          { label: 'Miss',    value: stats.miss,    color: 'var(--red)'   },
          { label: 'Logged',  value: stats.logged,  color: 'var(--text2)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-border bg-bg-2 px-4 py-4">
            <div className="font-mono text-[9px] text-text-sub uppercase tracking-[0.1em] mb-2">{label}</div>
            <div className="font-mono text-[24px] font-bold leading-none" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Calendar card ───────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-bg-2 p-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <span className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em]">
            60-Day Sprint
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[12px] text-text-sub">Start:</span>
            <input
              type="text"
              value={dateText}
              placeholder="YYYY-MM-DD"
              onChange={(e) => {
                const v = e.target.value;
                setDateText(v);
                if (v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v)) setSprintStart(v);
              }}
              className="bg-bg-3 border border-border rounded-xl px-3 py-[7px] text-text font-mono text-[12px] outline-none focus:border-border-2 w-[130px] transition-colors"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4">
          {(['good', 'partial', 'miss'] as const).map((s) => (
            <div key={s} className="flex items-center gap-2 text-[12px] text-text-sub">
              <div className="w-3 h-3 rounded-[3px]" style={{ background: STATE_COLOR[s] }} />
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </div>
          ))}
          <div className="flex items-center gap-2 text-[12px] text-text-sub">
            <div className="w-3 h-3 rounded-[3px] bg-bg-4 border border-border" />
            Not logged
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-[5px]" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
          {Array.from({ length: 60 }, (_, i) => {
            const day      = i + 1;
            const dayState = state.cal[`d${day}`] ?? '';
            const isFuture = state.sprintStart
              ? (() => {
                  const d = new Date(state.sprintStart);
                  d.setDate(d.getDate() + (day - 1));
                  d.setHours(0, 0, 0, 0);
                  return d > todayDate;
                })()
              : false;
            const isToday = sprintDay === day;

            return (
              <div
                key={day}
                onClick={() => !isFuture && cycleCalDay(day)}
                title={`Day ${day}`}
                className={cn(
                  'aspect-square rounded-lg flex items-center justify-center border transition-all relative',
                  isFuture
                    ? 'opacity-20 cursor-default border-border bg-bg-4'
                    : 'cursor-pointer hover:scale-[1.07] active:scale-100',
                  !isFuture && !dayState && 'border-border bg-bg-4 hover:border-border-2',
                  isToday && !isFuture && 'ring-2 ring-white/40 ring-offset-1 ring-offset-bg'
                )}
                style={
                  dayState && !isFuture
                    ? { background: STATE_COLOR[dayState as Exclude<CalDayState, ''>], borderColor: STATE_COLOR[dayState as Exclude<CalDayState, ''>] }
                    : undefined
                }
              >
                <span className="font-mono text-[9px] text-white/50 pointer-events-none select-none">
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
