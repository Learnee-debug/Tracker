import { useMemo, useRef } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { buildVerifyScores, calcCompanyReadiness } from '@/lib/engine';
import { COMPANIES } from '@/data/companies';
import { cn } from '@/lib/utils';
import type { PipelineStatus } from 'shared/types';

const PIPELINE_STATUSES: PipelineStatus[] = [
  'Target', 'Researching', 'Applying', 'OA Done', 'Interview', 'Offer', 'Rejected',
];

function getGap(
  weights: Record<string, number>,
  scores: Record<string, number>,
  readiness: number
): string {
  if (readiness >= 70) return 'Competitive';
  const sorted = Object.entries(weights).sort(([, a], [, b]) => b - a);
  const weakest = sorted.find(([k]) => (scores[k] ?? 0) < 6);
  return weakest ? `Gap: ${weakest[0].toUpperCase()} (${scores[weakest[0]] ?? 0}/10)` : 'Near ready';
}

export function Matrix() {
  const { state } = useCareerStore();
  const { saveCoNote, addPipeline, removePipeline } = useCareerActions();

  const scores = useMemo(() => buildVerifyScores(state.verify), [state.verify]);

  // Debounce note saves — only save after 800ms of no typing
  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  function handleNoteChange(name: string, value: string) {
    if (noteTimers.current[name]) clearTimeout(noteTimers.current[name]);
    noteTimers.current[name] = setTimeout(() => saveCoNote(name, value), 800);
  }

  // Pipeline form refs
  const coRef     = useRef<HTMLInputElement>(null);
  const notesRef  = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);

  function handleAddCompany() {
    const co = coRef.current?.value.trim() ?? '';
    if (!co) return;
    const status  = (statusRef.current?.value ?? 'Target') as PipelineStatus;
    const notes   = notesRef.current?.value.trim() ?? '';
    addPipeline(co, status, notes);
    if (coRef.current)    coRef.current.value = '';
    if (notesRef.current) notesRef.current.value = '';
    if (statusRef.current) statusRef.current.selectedIndex = 0;
  }

  return (
    <div>
      {/* Company matrix */}
      <Card className="mb-3">
        <SectionTitle>Company Target Matrix — research + personal readiness</SectionTitle>
        <div className="text-[11px] text-text-sub mb-[10px] font-mono">
          Readiness computed from Verify tab scores. Update Verify → Matrix auto-updates.
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Company', 'OA Format', 'What They Test', 'Window', 'My Readiness', 'Notes'].map((h) => (
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
                const r = calcCompanyReadiness(co.weights, scores);
                const readinessColor = r >= 70 ? 'var(--green)' : r >= 40 ? 'var(--amber)' : 'var(--red)';
                const gap = getGap(co.weights as Record<string, number>, scores, r);
                const note = state.coNotes[co.name] ?? '';

                return (
                  <tr key={co.name} className="hover:[&>td]:bg-bg-3">
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
                    <td className="px-2 py-2 border-b border-bg-3 align-top text-[11px] text-text-muted">
                      {co.oa}
                    </td>
                    <td className="px-2 py-2 border-b border-bg-3 align-top text-[11px] text-text-muted">
                      {co.tests}
                    </td>
                    <td className="px-2 py-2 border-b border-bg-3 align-top font-mono text-[11px] text-amber">
                      {co.window}
                    </td>
                    <td className="px-2 py-2 border-b border-bg-3 align-top">
                      <span
                        className="font-mono text-[11px] px-[7px] py-[2px] rounded-[3px]"
                        style={{
                          background: `color-mix(in srgb, ${readinessColor} 10%, transparent)`,
                          color: readinessColor,
                        }}
                      >
                        {r}%
                      </span>
                      <div className="text-[11px] text-text-sub mt-[2px]">{gap}</div>
                    </td>
                    <td className="px-2 py-2 border-b border-bg-3 align-top">
                      <input
                        defaultValue={note}
                        onChange={(e) => handleNoteChange(co.name, e.target.value)}
                        placeholder="Add notes..."
                        className="w-full bg-bg-3 border-none border-b border-border text-text-muted px-1 py-[2px] outline-none text-[11px] focus:border-border-2"
                        style={{ borderBottom: '1px solid var(--border)' }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pipeline tracker */}
      <Card>
        <SectionTitle>Internship Pipeline Tracker</SectionTitle>

        {/* Add form */}
        <div className="flex gap-2 mb-[10px] flex-wrap">
          <input
            ref={coRef}
            placeholder="Company"
            className="bg-bg-3 border border-border rounded px-[9px] py-[5px] text-text font-mono text-[11px] outline-none focus:border-border-2"
            style={{ minWidth: 120 }}
          />
          <select
            ref={statusRef}
            className="bg-bg-3 border border-border rounded px-[9px] py-[5px] text-text font-mono text-[11px] outline-none focus:border-border-2"
          >
            {PIPELINE_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            ref={notesRef}
            placeholder="Notes / lesson"
            className="bg-bg-3 border border-border rounded px-[9px] py-[5px] text-text font-mono text-[11px] outline-none focus:border-border-2 flex-1"
            style={{ minWidth: 150 }}
          />
          <Button onClick={handleAddCompany}>Add</Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Company', 'Status', 'Notes', ''].map((h) => (
                  <th key={h} className="font-mono text-[10px] text-text-sub uppercase tracking-[.07em] text-left px-2 py-[6px] border-b border-border">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.pipeline.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-text-sub text-[12px] px-2 py-[10px]">
                    No pipeline entries yet.
                  </td>
                </tr>
              ) : (
                state.pipeline.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-2 py-2 border-b border-bg-3 font-medium text-[13px]">
                      {entry.co}
                    </td>
                    <td className="px-2 py-2 border-b border-bg-3">
                      <span className="font-mono text-[10px] px-[7px] py-[2px] rounded-[3px] bg-bg-4 text-text-muted">
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 border-b border-bg-3 text-text-muted text-[11px]">
                      {entry.notes || '—'}
                    </td>
                    <td className="px-2 py-2 border-b border-bg-3">
                      <Button size="sm" onClick={() => removePipeline(entry.id)}>×</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
