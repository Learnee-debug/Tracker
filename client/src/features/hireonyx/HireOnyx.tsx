import { useState, useMemo } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import { calcHxSectionPct, calcHxOverallPct } from '@/lib/engine';
import { HX_DEFS, HX_ORDER } from '@/data/hxDefs';

export function HireOnyx() {
  const { state }    = useCareerStore();
  const { toggleHx } = useCareerActions();

  const overall = useMemo(() => calcHxOverallPct(state.hx), [state.hx]);

  // Auto-expand the first incomplete section
  const firstIncomplete = HX_ORDER.find((key) => calcHxSectionPct(key, state.hx) < 100);
  const [expanded, setExpanded] = useState<string | null>(firstIncomplete ?? HX_ORDER[0]);

  function toggle(key: string) {
    setExpanded((prev) => (prev === key ? null : key));
  }

  const currentStage = firstIncomplete ? HX_DEFS[firstIncomplete]?.label : 'All stages complete';

  return (
    <div>
      {/* ── Overall progress hero ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-bg-2 p-6 mb-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-2">HireOnyx Progress</div>
            <div className="text-[14px] text-text-sub">
              Currently: <span className="text-text font-semibold">{currentStage}</span>
            </div>
          </div>
          <div
            className="font-mono text-[56px] font-bold leading-none shrink-0"
            style={{ color: overall >= 80 ? 'var(--green)' : overall >= 40 ? 'var(--amber)' : 'var(--text3)' }}
          >
            {overall}%
          </div>
        </div>
        <ProgressBar value={overall} color={overall >= 80 ? 'var(--green)' : 'var(--amber)'} height="md" className="mb-3" />
        <p className="font-mono text-[10px] text-text-sub">
          Build order: Database → Backend → Auth → Frontend → Deployment → Docs → Resume Value
        </p>
      </div>

      {/* ── Milestone accordion ─────────────────────────────────────────────────── */}
      <div className="space-y-2">
        {HX_ORDER.map((sectionKey) => {
          const section  = HX_DEFS[sectionKey];
          const pct      = calcHxSectionPct(sectionKey, state.hx);
          const isOpen   = expanded === sectionKey;
          const doneCount = section.tasks.filter((t) => state.hx[t.id]).length;
          const isComplete = pct === 100;

          return (
            <div
              key={sectionKey}
              className={cn(
                'rounded-2xl border overflow-hidden transition-colors',
                isOpen ? 'border-border-2' : 'border-border'
              )}
            >
              {/* Section header */}
              <button
                onClick={() => toggle(sectionKey)}
                className="w-full flex items-center gap-4 px-5 py-4 bg-bg-2 hover:bg-bg-3 transition-colors text-left"
              >
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <span className={cn('text-[15px] font-semibold', isComplete && 'line-through text-text-sub')}>
                    {section.label}
                  </span>
                  <span className="text-[12px] text-text-sub shrink-0">{doneCount}/{section.tasks.length}</span>
                </div>
                <ProgressBar value={pct} color={section.color} height="sm" className="w-24 shrink-0" />
                <span
                  className="font-mono text-[14px] font-bold w-10 text-right shrink-0"
                  style={{ color: section.color }}
                >
                  {pct}%
                </span>
                <span className="text-text-sub text-[11px] shrink-0 w-4 text-center">
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* Task list */}
              {isOpen && (
                <div className="bg-bg-3 border-t border-border px-5 py-3">
                  {section.tasks.map((task) => {
                    const done = state.hx[task.id] ?? false;
                    return (
                      <label
                        key={task.id}
                        className={cn(
                          'flex items-start gap-3 py-[10px] cursor-pointer border-b border-bg-4 last:border-b-0',
                          done && 'opacity-45'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => toggleHx(task.id)}
                          className="mt-[3px] w-4 h-4 cursor-pointer flex-shrink-0 accent-green"
                        />
                        <span className={cn('text-[14px] leading-[1.5]', done ? 'line-through text-text-sub' : 'text-text-muted')}>
                          {task.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
