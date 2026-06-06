// ─────────────────────────────────────────────────────────────────────────────
// PipelineTracker — internship application pipeline add/view/delete.
// No dependency on verify scores or company matrix data.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PipelineStatus } from 'shared/types';

const PIPELINE_STATUSES: PipelineStatus[] = [
  'Target', 'Researching', 'Applying', 'OA Done', 'Interview', 'Offer', 'Rejected',
];

const INPUT_CLS =
  'bg-bg-3 border border-border rounded px-[9px] py-[5px] text-text font-mono text-[11px] outline-none focus:border-border-2';

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

    // Reset form
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

      {/* Add form */}
      <div className="flex gap-2 mb-[10px] flex-wrap">
        <input
          ref={coRef}
          placeholder="Company"
          onKeyDown={handleKeyDown}
          className={INPUT_CLS}
          style={{ minWidth: 120 }}
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
          className={`${INPUT_CLS} flex-1`}
          style={{ minWidth: 150 }}
        />
        <Button onClick={handleAdd}>Add</Button>
      </div>

      {/* Pipeline table */}
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
  );
}
