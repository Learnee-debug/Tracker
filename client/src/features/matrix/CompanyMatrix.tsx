import { useMemo, useRef, useState } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { buildVerifyScores, calcCompanyReadiness } from '@/lib/engine';
import { COMPANIES } from '@/data/companies';
import { cn } from '@/lib/utils';

function getGap(
  weights: Record<string, number>,
  scores: Record<string, number>,
  readiness: number
): string {
  if (readiness >= 70) return 'Competitive';
  const sorted  = Object.entries(weights).sort(([, a], [, b]) => b - a);
  const weakest = sorted.find(([k]) => (scores[k] ?? 0) < 6);
  return weakest
    ? `Gap: ${weakest[0].toUpperCase()} (${scores[weakest[0]] ?? 0}/10)`
    : 'Near ready';
}

export function CompanyMatrix() {
  const { state }      = useCareerStore();
  const { saveCoNote } = useCareerActions();

  const scores = useMemo(() => buildVerifyScores(state.verify), [state.verify]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  function toggle(name: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  function handleNoteChange(name: string, value: string) {
    if (noteTimers.current[name]) clearTimeout(noteTimers.current[name]);
    noteTimers.current[name] = setTimeout(() => saveCoNote(name, value), 800);
  }

  return (
    <div>
      <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-4">
        Company Target Matrix
      </div>

      <div className="space-y-2">
        {COMPANIES.map((co) => {
          const readiness = calcCompanyReadiness(co.weights, scores);
          const color     = readiness >= 70 ? 'var(--green)' : readiness >= 40 ? 'var(--amber)' : 'var(--red)';
          const gap       = getGap(co.weights as Record<string, number>, scores, readiness);
          const note      = state.coNotes[co.name] ?? '';
          const isOpen    = expanded.has(co.name);

          const tierStyle = co.tier === 'D'
            ? 'bg-[rgba(139,92,246,.12)] text-purple'
            : 'bg-[rgba(29,185,122,.12)] text-green';

          return (
            <div
              key={co.name}
              className={cn(
                'rounded-2xl border overflow-hidden transition-colors',
                isOpen ? 'border-border-2' : 'border-border'
              )}
            >
              {/* ── Compact row ─────────────────────────────────────────────── */}
              <button
                onClick={() => toggle(co.name)}
                className="w-full flex items-center gap-4 px-5 py-4 bg-bg-2 hover:bg-bg-3 transition-colors text-left cursor-pointer"
              >
                {/* Name */}
                <span className="flex-1 text-[14px] font-semibold truncate">{co.name}</span>

                {/* Tier */}
                <span
                  className={cn(
                    'font-mono text-[10px] px-2 py-[3px] rounded-md uppercase tracking-[0.08em] font-semibold shrink-0',
                    tierStyle
                  )}
                >
                  {co.tier}
                </span>

                {/* Window */}
                <span className="font-mono text-[12px] text-amber shrink-0 w-20 text-right hidden sm:block">
                  {co.window}
                </span>

                {/* Readiness */}
                <span
                  className="font-mono text-[18px] font-bold leading-none shrink-0 w-16 text-right"
                  style={{ color }}
                >
                  {readiness}%
                </span>

                {/* Gap */}
                <span className="text-[12px] text-text-sub shrink-0 w-36 text-right truncate hidden md:block">
                  {gap}
                </span>

                {/* Toggle */}
                <span className="text-text-sub text-[11px] shrink-0 w-4 text-center">
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* ── Expanded details ────────────────────────────────────────── */}
              {isOpen && (
                <div className="border-t border-border bg-bg-3 px-5 py-4 space-y-4">
                  {/* Progress bar + window on mobile */}
                  <div className="flex items-center gap-3 sm:hidden">
                    <span className="font-mono text-[12px] text-amber">{co.window}</span>
                    <span className="text-[12px] text-text-sub">{gap}</span>
                  </div>
                  <ProgressBar value={readiness} color={color} height="sm" />

                  <div>
                    <div className="font-mono text-[9px] text-text-sub uppercase tracking-[0.1em] mb-1">What They Test</div>
                    <p className="text-[13px] text-text-muted leading-[1.5]">{co.tests}</p>
                  </div>

                  <div>
                    <div className="font-mono text-[9px] text-text-sub uppercase tracking-[0.1em] mb-1">OA Format</div>
                    <p className="text-[13px] text-text-muted">{co.oa}</p>
                  </div>

                  <div>
                    <div className="font-mono text-[9px] text-text-sub uppercase tracking-[0.1em] mb-1">Notes</div>
                    <input
                      defaultValue={note}
                      onChange={(e) => handleNoteChange(co.name, e.target.value)}
                      placeholder="Add research notes..."
                      className="w-full bg-bg-4 border border-border rounded-xl px-3 py-[8px] text-text-muted outline-none text-[13px] focus:border-border-2 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
