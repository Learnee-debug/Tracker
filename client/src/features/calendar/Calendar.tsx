import { useMemo } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { Card, SectionTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { calcStreak, getSprintDay } from '@/lib/engine';
import type { CalDayState } from '@/types';

const STATE_COLOR: Record<Exclude<CalDayState, ''>, string> = {
  good:    'var(--green)',
  partial: 'var(--amber)',
  miss:    'var(--red)',
};

export function Calendar() {
  const { state } = useCareerStore();
  const { setSprintStart, cycleCalDay } = useCareerActions();

  const sprintDay = getSprintDay(state.sprintStart);

  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const streak = useMemo(
    () => calcStreak(state.cal, sprintDay ?? 0),
    [state.cal, sprintDay]
  );

  const stats = useMemo(() => {
    const vals = Object.values(state.cal);
    return {
      good:    vals.filter((v) => v === 'good').length,
      partial: vals.filter((v) => v === 'partial').length,
      miss:    vals.filter((v) => v === 'miss').length,
      logged:  vals.filter((v) => v !== '').length,
    };
  }, [state.cal]);

  return (
    <div>
      <Card>
        {/* Section title + sprint start input inline */}
        <SectionTitle
          right={
            <input
              type="date"
              value={state.sprintStart}
              onChange={(e) => setSprintStart(e.target.value)}
              className="bg-bg-3 border border-border rounded px-[9px] py-[4px] text-text font-mono text-[10px] outline-none focus:border-border-2"
            />
          }
        >
          60-Day Sprint
        </SectionTitle>

        {/* Stats row — above the grid */}
        <div className="grid grid-cols-3 sm:flex sm:gap-6 mb-4">
          {[
            { label: 'Streak',    value: streak,        color: 'var(--amber)' },
            { label: 'Good',      value: stats.good,    color: 'var(--green)' },
            { label: 'Partial',   value: stats.partial, color: 'var(--amber)' },
            { label: 'Miss',      value: stats.miss,    color: 'var(--red)' },
            { label: 'Logged',    value: stats.logged,  color: 'var(--text2)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center sm:text-left">
              <div className="font-mono text-[22px] font-medium leading-none mb-[2px]" style={{ color }}>
                {value}
              </div>
              <div className="text-[10px] text-text-sub uppercase tracking-[.06em]">{label}</div>
            </div>
          ))}
        </div>

        {/* Grid — 11 cols: 1 label + 10 days */}
        <div
          className="grid gap-[5px] mb-3"
          style={{ gridTemplateColumns: '20px repeat(10, 1fr)' }}
        >
          {Array.from({ length: 6 }, (_, week) => {
            const days = Array.from({ length: 10 }, (_, d) => {
              const day = week * 10 + d + 1;
              const dayState = state.cal[`d${day}`] ?? '';
              const isFuture = state.sprintStart
                ? (() => {
                    const dt = new Date(state.sprintStart);
                    dt.setDate(dt.getDate() + (day - 1));
                    dt.setHours(0, 0, 0, 0);
                    return dt > todayDate;
                  })()
                : false;
              const isToday = sprintDay === day;

              return (
                <div
                  key={day}
                  onClick={() => !isFuture && cycleCalDay(day)}
                  title={`Day ${day}`}
                  className={cn(
                    'aspect-square rounded flex items-center justify-center border transition-transform relative',
                    isFuture
                      ? 'opacity-30 cursor-default border-border bg-bg-4'
                      : 'cursor-pointer hover:scale-[1.08] hover:z-10',
                    !isFuture && !dayState && 'border-border bg-bg-4',
                    isToday && 'ring-2 ring-white shadow-sm'
                  )}
                  style={
                    dayState && !isFuture
                      ? {
                          background: STATE_COLOR[dayState as Exclude<CalDayState, ''>],
                          borderColor: STATE_COLOR[dayState as Exclude<CalDayState, ''>],
                        }
                      : undefined
                  }
                >
                  <span
                    className={cn(
                      'font-mono pointer-events-none',
                      isToday ? 'text-[11px] text-white' : 'text-[9px] text-white/60'
                    )}
                  >
                    {day}
                  </span>
                </div>
              );
            });

            return [
              <div
                key={`w${week}`}
                className="flex items-center justify-end pr-1"
              >
                <span className="font-mono text-[9px] text-text-sub">W{week + 1}</span>
              </div>,
              ...days,
            ];
          })}
        </div>

        {/* Legend — inline */}
        <div className="flex flex-wrap gap-4 text-[10px] text-text-sub border-t border-border pt-3">
          {([
            { label: 'Good',        color: 'var(--green)' },
            { label: 'Partial',     color: 'var(--amber)' },
            { label: 'Miss',        color: 'var(--red)' },
          ] as const).map(({ label, color }) => (
            <span key={label} className="flex items-center gap-[5px]">
              <span className="w-3 h-3 rounded-[2px] inline-block" style={{ background: color }} />
              {label}
            </span>
          ))}
          <span className="flex items-center gap-[5px]">
            <span className="w-3 h-3 rounded-[2px] inline-block bg-bg-4 border border-border" />
            Not started
          </span>
        </div>

        {/* Pattern key — 3 lines inline */}
        <div className="mt-3 pt-3 border-t border-border font-mono text-[10px] text-text-sub leading-[2.2]">
          <span style={{ color: 'var(--green)' }}>3+ green</span> → Pattern locked. Protect it.{'  '}
          <span style={{ color: 'var(--amber)' }}>2 amber in row</span> → Check Weekly tab.{'  '}
          <span style={{ color: 'var(--red)' }}>Any red</span> → Not fatal. 2/week = serious.{'  '}
          <span className="text-text-sub">Blank past D20</span> → Sprint failing.
        </div>
      </Card>
    </div>
  );
}
