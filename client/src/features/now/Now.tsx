import { useMemo, useRef } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { cn } from '@/lib/utils';
import { getSprintDay, get7Days, pace, type DotState } from '@/lib/engine';
import { HX_DEFS, HX_ORDER } from '@/data/hxDefs';

// ─── Alert Banner ─────────────────────────────────────────────────────────────

function AlertBanner({ done }: { done: number }) {
  if (done >= 3) return null;
  return (
    <div className="flex items-center gap-3 px-[18px] py-3 rounded-r-[8px] border-l-2"
      style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'var(--red)' }}>
      <span className="font-mono text-[10px] font-bold px-2 py-[3px] rounded-[5px] border shrink-0"
        style={{ background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.20)', color: 'var(--red)' }}>
        {done}/3
      </span>
      <span className="text-[13px] font-medium text-text">Nothing done yet. Open LeetCode and start.</span>
    </div>
  );
}

// ─── Non-Negotiables ──────────────────────────────────────────────────────────
// Reused from Today.tsx — same logic, updated labels per architecture lock.

const NN_DEFS = [
  { n: 1 as const, key: 'DSA',    main: 'Solve one problem out loud'              },
  { n: 2 as const, key: 'COMMIT', main: 'Push working code'                       },
  { n: 3 as const, key: 'LOG',    main: 'Record one thing you cannot yet re-solve' },
];

function NonNegotiables() {
  const { state }    = useCareerStore();
  const { toggleNN } = useCareerActions();
  const done = [state.nn.d1, state.nn.d2, state.nn.d3].filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] text-text-sub uppercase tracking-[.10em]">Non-Negotiables</span>
        <span className="font-mono text-[11px] font-bold" style={{ color: done === 3 ? 'var(--green)' : 'var(--blue)' }}>{done}/3</span>
      </div>
      <div className="rounded-[10px] border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'rgba(255,255,255,0.07)' }}>
        {NN_DEFS.map(({ n, key, main }, i) => {
          const checked = state.nn[`d${n}` as 'd1' | 'd2' | 'd3'];
          return (
            <div
              key={n}
              onClick={() => toggleNN(n)}
              className={cn(
                'flex items-start gap-[14px] px-[18px] py-[14px] cursor-pointer min-h-[58px] select-none',
                i < NN_DEFS.length - 1 && 'border-b',
              )}
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}
            >
              <div className={cn(
                'w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 mt-[2px] transition-all',
                checked ? 'border-[var(--green)]' : 'border-[rgba(255,255,255,0.15)]',
              )}
                style={checked ? { background: 'var(--green)' } : {}}
              >
                {checked && <span className="text-[10px] font-bold text-black">✓</span>}
              </div>
              <div>
                <div className={cn('text-[13px] font-medium transition-all', checked && 'line-through text-text-sub')}>
                  <span className="font-mono text-[11px] font-bold tracking-[.07em] mr-2" style={{ color: 'var(--mu, #52525B)' }}>{key}</span>
                  {main}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Today's Focus ────────────────────────────────────────────────────────────

function TodaysFocus() {
  const { state }       = useCareerStore();
  const { setFocusDSA } = useCareerActions();
  const inputRef        = useRef<HTMLInputElement>(null);

  // Build row: next task label from taskIdx
  const buildFocus = useMemo(() => {
    let idx = 0;
    for (const k of HX_ORDER) {
      for (const t of HX_DEFS[k].tasks) {
        if (idx === state.taskIdx) return t.label;
        idx++;
      }
    }
    return 'All tasks complete';
  }, [state.taskIdx]);

  return (
    <div>
      <div className="mb-2">
        <span className="font-mono text-[10px] text-text-sub uppercase tracking-[.10em]">Today's Focus</span>
      </div>
      <div className="rounded-[10px] border px-5 flex flex-col gap-1 py-[14px]"
        style={{ background: 'var(--card)', borderColor: 'rgba(255,255,255,0.07)' }}>
        {/* DSA row — editable */}
        <div className="flex items-center gap-[10px] min-h-[36px]">
          <span className="font-mono text-[10px] font-medium uppercase px-2 rounded-[5px] h-5 inline-flex items-center shrink-0 border"
            style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.20)', color: 'var(--green)' }}>
            DSA
          </span>
          <input
            ref={inputRef}
            className="text-[13px] text-text bg-transparent border-none outline-none w-full"
            style={{ fontFamily: 'var(--sans, Inter, sans-serif)' }}
            defaultValue={state.focusDSA || 'Two Pointers — 2 problems from Blind 75'}
            placeholder="Today's DSA focus..."
            onBlur={(e) => setFocusDSA(e.target.value)}
          />
        </div>
        {/* BUILD row — auto-synced */}
        <div className="flex items-center gap-[10px] min-h-[36px]">
          <span className="font-mono text-[10px] font-medium uppercase px-2 rounded-[5px] h-5 inline-flex items-center shrink-0 border"
            style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.20)', color: 'var(--amber)' }}>
            BUILD
          </span>
          <span className="text-[13px] text-text truncate">{buildFocus}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Metric Tiles ─────────────────────────────────────────────────────────────
// Reused from Today.tsx StatGrid — simplified to 4 tiles with +1 tap.

const TILE_DEFS = [
  { key: 'owned'   as const, label: 'DSA OWNED', color: 'var(--green)', borderTop: 'rgba(34,197,94,1)'  },
  { key: 'commits' as const, label: 'COMMITS',   color: 'var(--amber)', borderTop: 'rgba(245,158,11,1)' },
  { key: 'mocks'   as const, label: 'MOCKS',     color: 'var(--blue)',  borderTop: 'rgba(59,130,246,1)'  },
] as const;

function MetricTiles() {
  const { state }     = useCareerStore();
  const { incMetric } = useCareerActions();
  const sprintDay = getSprintDay(state.sprintStart) ?? 0;
  const total     = useMemo(() => HX_ORDER.reduce((acc, k) => acc + HX_DEFS[k].tasks.length, 0), []);
  const hxPct     = useMemo(() => (total > 0 ? Math.round((state.taskIdx / total) * 100) : 0), [state.taskIdx, total]);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TILE_DEFS.map(({ key, label, color, borderTop }) => {
          const value = state.score[key] ?? 0;
          const p     = pace(key, value, sprintDay);
          return (
            <div key={key} className="rounded-[10px] border flex flex-col"
              style={{ background: 'var(--card)', borderColor: 'rgba(255,255,255,0.07)', borderTop: `2px solid ${borderTop}` }}>
              <div className="px-3 pt-[14px]">
                <div className="font-mono text-[26px] font-bold leading-none" style={{ color }}>{value}</div>
                <div className="font-mono text-[9px] uppercase tracking-[.08em] mt-1" style={{ color: '#A1A1AA' }}>{label}</div>
                <div className="text-[11px] mt-[2px]" style={{ color: '#52525B' }}>/ {TILE_DEFS.find(t=>t.key===key) ? ({owned:130,commits:60,mocks:8} as Record<string,number>)[key] : 0} target</div>
                <div className={cn('text-[11px] font-medium mt-[3px] mb-2', p.cls === 'ok' ? 'text-[var(--green)]' : 'text-[var(--red)]')}>{p.txt}</div>
              </div>
              <button
                onClick={() => incMetric(key)}
                className="mt-auto min-h-[44px] border-t font-mono text-[11px] font-medium uppercase tracking-[.06em] w-full flex items-center justify-center transition-colors rounded-b-[9px] cursor-pointer"
                style={{ borderColor: 'rgba(255,255,255,0.04)', background: 'transparent', color }}
              >
                +1
              </button>
            </div>
          );
        })}
        {/* HireOnyx % tile — auto, no +1 */}
        <div className="rounded-[10px] border flex flex-col"
          style={{ background: 'var(--card)', borderColor: 'rgba(255,255,255,0.07)', borderTop: '2px solid var(--purple)' }}>
          <div className="px-3 pt-[14px]">
            <div className="font-mono text-[26px] font-bold leading-none" style={{ color: 'var(--purple)' }}>{hxPct}%</div>
            <div className="font-mono text-[9px] uppercase tracking-[.08em] mt-1" style={{ color: '#A1A1AA' }}>HIREONYX</div>
            <div className="text-[11px] mt-[2px]" style={{ color: '#52525B' }}>project %</div>
            <div className="text-[11px] font-medium mt-[3px] mb-2" style={{ color: '#52525B' }}>auto</div>
          </div>
          <div className="mt-auto min-h-[44px] border-t flex items-center justify-center"
            style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <span className="font-mono text-[12px]" style={{ color: '#52525B' }}>—</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Streak Row ───────────────────────────────────────────────────────────────
// Reused streak logic from Today.tsx — rendered as 7-dot row per architecture.

const DOT_STYLE: Record<DotState, { bg: string; border: string }> = {
  done: { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.35)'  },
  part: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)' },
  miss: { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)'  },
  fut:  { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.07)' },
};

function StreakRow() {
  const { state } = useCareerStore();
  const sprintDay = getSprintDay(state.sprintStart) ?? 0;
  const nnDone    = [state.nn.d1, state.nn.d2, state.nn.d3].filter(Boolean).length;
  const dots      = useMemo(() => get7Days(state.cal, sprintDay, nnDone), [state.cal, sprintDay, nnDone]);

  return (
    <div className="rounded-[10px] border px-5 py-[14px] flex items-center justify-between"
      style={{ background: 'var(--card)', borderColor: 'rgba(255,255,255,0.07)' }}>
      <div className="flex gap-[7px]">
        {dots.map((d, i) => (
          <div key={i} className="w-4 h-4 rounded-full border"
            style={{ background: DOT_STYLE[d].bg, borderColor: DOT_STYLE[d].border }} />
        ))}
      </div>
      <div className="text-right">
        <div className="font-mono text-[11px]" style={{ color: '#52525B' }}>
          Day {sprintDay || '—'} of 60
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function Now() {
  const { state } = useCareerStore();
  const nnDone = [state.nn.d1, state.nn.d2, state.nn.d3].filter(Boolean).length;

  return (
    <div className="space-y-5">
      <AlertBanner done={nnDone} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <NonNegotiables />
        <TodaysFocus />
      </div>
      <MetricTiles />
      <StreakRow />
    </div>
  );
}
