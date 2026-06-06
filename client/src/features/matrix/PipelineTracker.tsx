// ─────────────────────────────────────────────────────────────────────────────
// PipelineTracker — internship application pipeline.
// Business logic (addPipeline, removePipeline) untouched.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PipelineStatus } from '@/types';

const PIPELINE_STATUSES: PipelineStatus[] = [
  'Target', 'Researching', 'Applying', 'OA Done', 'Interview', 'Offer', 'Rejected',
];

const STATUS_STYLE: Record<PipelineStatus, { bg: string; color: string }> = {
  Target:      { bg: 'rgba(74,158,222,.15)',  color: 'var(--blue)' },
  Researching: { bg: 'rgba(144,136,224,.15)', color: 'var(--purple)' },
  Applying:    { bg: 'rgba(240,160,48,.15)',  color: 'var(--amber)' },
  'OA Done':   { bg: 'rgba(59,189,173,.15)',  color: 'var(--teal)' },
  Interview:   { bg: 'rgba(34,201,141,.15)',  color: 'var(--green)' },
  Offer:       { bg: 'rgba(34,201,141,.3)',   color: 'var(--green)' },
  Rejected:    { bg: 'rgba(229,85,85,.12)',   color: 'var(--red)' },
};

const INPUT_CLS =
  'bg-bg-3 border border-border rounded px-[9px] py-[8px] text-text font-mono text-[11px] outline-none focus:border-border-2';

export function PipelineTracker() {
  const { state } = useCareerStore();
  const { addPipeline, removePipeline } = useCareerActions();

  const coRef     = useRef<HTMLInputElement>(null);
  const notesRef  = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);

  function handleAdd() {
    const co = coRef.current?.value.trim() ?? '';
    if (!co) return;
    const status = (statusRef.current?.value ?? 'Target') as PipelineStatus;
    const notes  = notesRef.current?.value.trim() ?? '';
    addPipeline(co, status, notes);
    if (coRef.current)     coRef.current.value = '';
    if (notesRef.current)  notesRef.current.value = '';
    if (statusRef.current) statusRef.current.selectedIndex = 0;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd();
  }

  return (
    <Card>
      <SectionTitle>Internship Pipeline Tracker</SectionTitle>

      {/* Add form — stacked on mobile, row on desktop */}
      <div className="flex flex-col sm:flex-row gap-2 mb-[14px]">
        <input
          ref={coRef}
          placeholder="Company"
          onKeyDown={handleKeyDown}
          className={INPUT_CLS}
        />
        <select ref={statusRef} className={INPUT_CLS}>
          {PIPELINE_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          ref={notesRef}
          placeholder="Notes / lesson"
          onKeyDown={handleKeyDown}
          className={`${INPUT_CLS} sm:flex-1`}
        />
        <Button onClick={handleAdd} variant="primary">Add</Button>
      </div>

      {/* Pipeline list */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Company', 'Status', 'Notes', ''].map((h) => (
                <th
                  key={h}
                  className="font-mono text-[10px] text-text-sub uppercase tracking-[.07em] text-left px-2 py-[6px] border-b border-border"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.pipeline.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-text-sub text-[12px] px-2 py-[14px]">
                  No pipeline entries yet. Add your first target company above.
                </td>
              </tr>
            ) : (
              state.pipeline.map((entry) => {
                const style = STATUS_STYLE[entry.status] ?? { bg: 'var(--bg4)', color: 'var(--text2)' };
                return (
                  <tr key={entry.id}>
                    <td className="px-2 py-3 border-b border-bg-3 font-medium text-[13px]">
                      {entry.co}
                    </td>
                    <td className="px-2 py-3 border-b border-bg-3">
                      <span
                        className="font-mono text-[10px] px-[7px] py-[3px] rounded-[3px]"
                        style={{ background: style.bg, color: style.color }}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-2 py-3 border-b border-bg-3 text-text-muted text-[11px]">
                      {entry.notes || '—'}
                    </td>
                    <td className="px-2 py-3 border-b border-bg-3">
                      <Button
                        size="sm"
                        onClick={() => removePipeline(entry.id)}
                        className="min-h-[32px]"
                      >
                        ×
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
