import { useMemo, useState, useEffect } from 'react';
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

  const [dateText, setDateText] = useState(state.sprintStart);
  useEffect(() => { setDateText(state.sprintStart); }, [state.sprintStart]);

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
        <SectionTitle>60-Day Sprint Calendar</SectionTitle>

        {/* Sprint start input */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="font-mono text-[10px] text-text-sub">Sprint start:</span>
          <input
            type="text"
            value={dateText}
            placeholder="YYYY-MM-DD"
            onChange={(e) => {
              const v = e.target.value;
              setDateText(v);
              if (v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v)) setSprintStart(v);
            }}
            className="bg-bg-3 border border-border rounded px-[9px] py-[5px] text-text font-mono text-[11px] outline-none focus:border-border-2 w-[130px]"
          />
          <span className="font-mono text-[10px] text-text-sub">
            Click a day: empty → good → partial → miss
          </span>
        </div>

        {/* Legend */}
        <div className="flex gap-3 mb-[10px]">
          {(['good', 'partial', 'miss'] as const).map((s) => (
            <div key={s} className="flex items-center gap-[5px] text-[11px] text-text-sub">
              <div
                className="w-3 h-3 rounded-[2px]"
                style={{ background: STATE_COLOR[s] }}
              />
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </div>
          ))}
          <div className="flex items-center gap-[5px] text-[11px] text-text-sub">
            <div className="w-3 h-3 rounded-[2px] bg-bg-4 border border-border" />
            Not started
          </div>
        </div>

        {/* Grid */}
        <div
          className="grid gap-[5px] mb-3"
          style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}
        >
          {Array.from({ length: 60 }, (_, i) => {
            const day = i + 1;
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
                  'aspect-square rounded flex items-center justify-center border transition-transform relative',
                  isFuture
                    ? 'opacity-30 cursor-default border-border bg-bg-4'
                    : 'cursor-pointer hover:scale-[1.08] hover:z-10',
                  !isFuture && !dayState && 'border-border bg-bg-4',
                  isToday && 'ring-2 ring-text'
                )}
                style={
                  dayState && !isFuture
                    ? { background: STATE_COLOR[dayState as Exclude<CalDayState, ''>], borderColor: STATE_COLOR[dayState as Exclude<CalDayState, ''>] }
                    : undefined
                }
              >
                <span className="font-mono text-[9px] text-white/60 pointer-events-none">
                  {day}
                </span>
              </div>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="flex gap-4 flex-wrap">
          {[
            { label: 'Streak',    value: streak,        color: 'var(--amber)' },
            { label: 'Good Days', value: stats.good,    color: 'var(--green)' },
            { label: 'Partial',   value: stats.partial, color: 'var(--amber)' },
            { label: 'Miss',      value: stats.miss,    color: 'var(--red)' },
            { label: 'Logged',    value: stats.logged,  color: 'var(--text-muted)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className="font-mono text-[20px] font-medium" style={{ color }}>
                {value}
              </div>
              <div className="text-[10px] text-text-sub uppercase tracking-[.06em]">
                {label}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pattern key */}
      <Card>
        <SectionTitle>Sprint Pattern — what the calendar tells you</SectionTitle>
        <div className="font-mono text-[11px] text-text-muted leading-[2.2]">
          <span style={{ color: 'var(--green)' }}>3+ consecutive green</span> → Pattern established. Protect it.<br />
          <span style={{ color: 'var(--amber)' }}>2 amber in a row</span> → Drift starting. Identify cause in Weekly tab.<br />
          <span style={{ color: 'var(--red)' }}>Any red</span> → Not a disaster. But 2 red in same week = serious drift.<br />
          <span className="text-text-sub">Blank squares past Day 20</span> → You are behind. Sprint is failing.
        </div>
      </Card>
    </div>
  );
}
