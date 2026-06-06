// ─────────────────────────────────────────────────────────────────────────────
// CompanyMatrix — the research + readiness table for target companies.
// Reads verify scores and coNotes from the store. No pipeline logic here.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useRef } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { Card, SectionTitle } from '@/components/ui/Card';
import { buildVerifyScores, calcCompanyReadiness } from '@/lib/engine';
import { COMPANIES } from '@/data/companies';
import { cn } from '@/lib/utils';

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

const TABLE_HEADERS = ['Company', 'OA Format', 'What They Test', 'Window', 'My Readiness', 'Notes'];

export function CompanyMatrix() {
  const { state } = useCareerStore();
  const { saveCoNote } = useCareerActions();

  const scores = useMemo(() => buildVerifyScores(state.verify), [state.verify]);

  // Debounce per-company note saves — avoids a PUT on every keystroke.
  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  function handleNoteChange(name: string, value: string) {
    if (noteTimers.current[name]) clearTimeout(noteTimers.current[name]);
    noteTimers.current[name] = setTimeout(() => saveCoNote(name, value), 800);
  }

  return (
    <Card className="mb-3">
      <SectionTitle>Company Target Matrix — research + personal readiness</SectionTitle>
      <div className="text-[11px] text-text-sub mb-[10px] font-mono">
        Readiness computed from Verify tab scores. Update Verify → Matrix auto-updates.
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {TABLE_HEADERS.map((h) => (
                <th
                  key={h}
                  className="font-mono text-[10px] text-text-sub uppercase tracking-[.07em] text-left px-2 py-[6px] border-b border-border"
                  style={{ minWidth: h === 'Company' || h === 'Notes' ? 130 : undefined }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPANIES.map((co) => {
              const readiness = calcCompanyReadiness(co.weights, scores);
              const color     = readiness >= 70 ? 'var(--green)' : readiness >= 40 ? 'var(--amber)' : 'var(--red)';
              const gap       = getGap(co.weights as Record<string, number>, scores, readiness);
              const note      = state.coNotes[co.name] ?? '';

              return (
                <tr key={co.name} className="hover:[&>td]:bg-bg-3">
                  {/* Company + tier badge */}
                  <td className="px-2 py-2 border-b border-bg-3 align-top">
                    <div className="font-medium text-text text-[13px] mb-[2px]">{co.name}</div>
                    <span
                      className={cn(
                        'font-mono text-[10px] px-[6px] py-[1px] rounded-[3px]',
                        co.tier === 'D'
                          ? 'bg-[rgba(144,136,224,.12)] text-purple'
                          : 'bg-[rgba(34,201,141,.12)] text-green'
                      )}
                    >
                      {co.tier}
                    </span>
                  </td>

                  {/* OA format */}
                  <td className="px-2 py-2 border-b border-bg-3 align-top text-[11px] text-text-muted">
                    {co.oa}
                  </td>

                  {/* What they test */}
                  <td className="px-2 py-2 border-b border-bg-3 align-top text-[11px] text-text-muted">
                    {co.tests}
                  </td>

                  {/* Application window */}
                  <td className="px-2 py-2 border-b border-bg-3 align-top font-mono text-[11px] text-amber">
                    {co.window}
                  </td>

                  {/* Readiness % + gap */}
                  <td className="px-2 py-2 border-b border-bg-3 align-top">
                    <span
                      className="font-mono text-[11px] px-[7px] py-[2px] rounded-[3px]"
                      style={{
                        background: `color-mix(in srgb, ${color} 10%, transparent)`,
                        color,
                      }}
                    >
                      {readiness}%
                    </span>
                    <div className="text-[11px] text-text-sub mt-[2px]">{gap}</div>
                  </td>

                  {/* Notes — debounced inline save */}
                  <td className="px-2 py-2 border-b border-bg-3 align-top">
                    <input
                      defaultValue={note}
                      onChange={(e) => handleNoteChange(co.name, e.target.value)}
                      placeholder="Add notes..."
                      className="w-full bg-bg-3 text-text-muted px-1 py-[2px] outline-none text-[11px]"
                      style={{ border: 'none', borderBottom: '1px solid var(--border)' }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
