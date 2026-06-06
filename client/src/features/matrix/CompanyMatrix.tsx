// ─────────────────────────────────────────────────────────────────────────────
// CompanyMatrix — card-based layout replacing the table.
// All business logic (buildVerifyScores, calcCompanyReadiness, getGap,
// debounced note saves) is unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useRef } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { buildVerifyScores, calcCompanyReadiness } from '@/lib/engine';
import { COMPANIES } from '@/data/companies';

function getGap(
  weights: Record<string, number>,
  scores: Record<string, number>,
  readiness: number
): string {
  if (readiness >= 70) return 'Competitive';
  const sorted = Object.entries(weights).sort(([, a], [, b]) => b - a);
  const weakest = sorted.find(([k]) => (scores[k] ?? 0) < 6);
  return weakest
    ? `Gap: ${weakest[0].toUpperCase()} (${scores[weakest[0]] ?? 0}/10)`
    : 'Near ready';
}

export function CompanyMatrix() {
  const { state } = useCareerStore();
  const { saveCoNote } = useCareerActions();

  const scores = useMemo(() => buildVerifyScores(state.verify), [state.verify]);

  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  function handleNoteChange(name: string, value: string) {
    if (noteTimers.current[name]) clearTimeout(noteTimers.current[name]);
    noteTimers.current[name] = setTimeout(() => saveCoNote(name, value), 800);
  }

  return (
    <div className="mb-4">
      <div className="font-mono text-[10px] text-text-sub mb-3 px-1">
        COMPANY TARGET MATRIX — Readiness auto-updates from Verify scores.
      </div>

      <div className="flex flex-col gap-3">
        {COMPANIES.map((co) => {
          const readiness = calcCompanyReadiness(co.weights, scores);
          const color     = readiness >= 70 ? 'var(--green)' : readiness >= 40 ? 'var(--amber)' : 'var(--red)';
          const gap       = getGap(co.weights as Record<string, number>, scores, readiness);
          const note      = state.coNotes[co.name] ?? '';

          return (
            <div
              key={co.name}
              className="bg-bg-3 rounded-lg p-4 border border-border"
            >
              {/* Row 1: Company name + tier + window */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-medium text-[14px] text-text leading-tight">{co.name}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={co.tier === 'D' ? 'purple' : 'green'} size="sm">
                    Tier {co.tier}
                  </Badge>
                  <span className="font-mono text-[10px] text-amber">{co.window}</span>
                </div>
              </div>

              {/* Row 2: OA format */}
              <div className="text-[11px] text-text-sub mb-1">{co.oa}</div>

              {/* Row 3: What they test */}
              <div className="text-[11px] text-text-muted mb-3 leading-[1.4]">{co.tests}</div>

              {/* Divider */}
              <div className="border-t border-border mb-3" />

              {/* Readiness bar */}
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-[10px] text-text-sub w-[70px] flex-shrink-0">Readiness</span>
                <ProgressBar value={readiness} color={color} height="normal" animated className="flex-1" />
                <span className="font-mono text-[12px] font-medium w-[36px] text-right flex-shrink-0" style={{ color }}>
                  {readiness}%
                </span>
              </div>
              <div className="text-[11px] text-text-sub mb-3 pl-[78px]">{gap}</div>

              {/* Notes */}
              <input
                defaultValue={note}
                onChange={(e) => handleNoteChange(co.name, e.target.value)}
                placeholder="Add notes..."
                className="w-full bg-bg-2 text-text-muted px-3 py-[8px] rounded border border-border text-[11px] outline-none focus:border-border-2 placeholder:text-text-sub"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
