import { useRef } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { PipelineStatus } from '@/types';

const PIPELINE_STATUSES: PipelineStatus[] = [
  'Target', 'Researching', 'Applying', 'OA Done', 'Interview', 'Offer', 'Rejected',
];

const STATUS_COLOR: Record<PipelineStatus, string> = {
  Target:      'bg-[rgba(59,130,246,.12)] text-blue',
  Researching: 'bg-[rgba(139,92,246,.12)] text-purple',
  Applying:    'bg-[rgba(232,147,10,.12)] text-amber',
  'OA Done':   'bg-[rgba(20,184,166,.12)] text-teal',
  Interview:   'bg-[rgba(232,147,10,.15)] text-amber',
  Offer:       'bg-[rgba(29,185,122,.12)] text-green',
  Rejected:    'bg-[rgba(229,83,75,.12)] text-red',
};

const INPUT_CLS = 'bg-bg-3 border border-border rounded-xl px-3 py-[8px] text-text font-mono text-[12px] outline-none focus:border-border-2 transition-colors';

export function PipelineTracker() {
  const { state }                    = useCareerStore();
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
    <div className="rounded-2xl border border-border bg-bg-2 p-5">
      <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-4">Internship Pipeline Tracker</div>

      {/* Add form */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <input
          ref={coRef}
          placeholder="Company name"
          onKeyDown={handleKeyDown}
          className={INPUT_CLS}
          style={{ minWidth: 140 }}
        />
        <select ref={statusRef} className={INPUT_CLS}>
          {PIPELINE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          ref={notesRef}
          placeholder="Notes / lesson learned"
          onKeyDown={handleKeyDown}
          className={`${INPUT_CLS} flex-1`}
          style={{ minWidth: 150 }}
        />
        <Button onClick={handleAdd} variant="primary">Add</Button>
      </div>

      {/* Pipeline entries */}
      {state.pipeline.length === 0 ? (
        <p className="text-[13px] text-text-sub text-center py-6">No pipeline entries yet. Add your first target company above.</p>
      ) : (
        <div className="space-y-2">
          {state.pipeline.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-3 border border-border"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[14px] font-semibold truncate">{entry.co}</span>
                  <span
                    className={cn(
                      'font-mono text-[10px] px-2 py-[2px] rounded-md uppercase tracking-[0.07em] font-semibold shrink-0',
                      STATUS_COLOR[entry.status]
                    )}
                  >
                    {entry.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-text-sub">{entry.date}</span>
                  {entry.notes && (
                    <span className="text-[12px] text-text-muted truncate">{entry.notes}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => removePipeline(entry.id)}
                className="font-mono text-[11px] text-text-sub hover:text-red transition-colors shrink-0 px-2 py-1 rounded-lg border border-border bg-bg-4 hover:border-red"
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
