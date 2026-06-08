import { useState, useMemo } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';

import { HX_DEFS, HX_ORDER } from '@/data/hxDefs';

// ─── Derive current task from taskIdx ─────────────────────────────────────────

interface CurrentTask {
  phase: string;
  milestone: string;
  label: string;
  time: string;
  doneWhen: string;
  globalIdx: number;
  total: number;
}

function getCurrentTask(taskIdx: number): CurrentTask | null {
  let idx = 0;
  const total = HX_ORDER.reduce((acc, k) => acc + HX_DEFS[k].tasks.length, 0);

  for (const sectionKey of HX_ORDER) {
    const section = HX_DEFS[sectionKey];
    for (const task of section.tasks) {
      if (idx === taskIdx) {
        return {
          phase:     sectionKey.toUpperCase(),
          milestone: section.label.toUpperCase(),
          label:     task.label,
          time:      '—',           // hxDefs doesn't carry time estimates
          doneWhen:  task.doneWhen,
          globalIdx: idx,
          total,
        };
      }
      idx++;
    }
  }
  return null; // all complete
}

// ─── Build screen ─────────────────────────────────────────────────────────────

export function Build() {
  const { state }        = useCareerStore();
  const { completeTask } = useCareerActions();
  const [dwOpen, setDwOpen] = useState(true);

  const task    = useMemo(() => getCurrentTask(state.taskIdx), [state.taskIdx]);
  const overall = task ? Math.round((state.taskIdx / task.total) * 100) : 100;

  // All tasks complete
  if (!task) {
    return (
      <div className="text-center py-[60px] px-5">
        <div className="font-mono text-[14px] font-bold mb-2" style={{ color: 'var(--green)' }}>HIREONYX COMPLETE</div>
        <div className="text-[13px] text-text-sub">All tasks finished. Deploy and document.</div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Hero card ── */}
      <div className="rounded-[10px] border mb-5 overflow-hidden"
        style={{ background: 'var(--card)', borderColor: 'rgba(255,255,255,0.07)' }}>

        {/* Phase / Milestone breadcrumb */}
        <div className="px-5 pt-[18px]">
          <div className="flex items-baseline gap-[10px] mb-1">
            <span className="font-mono text-[9px] uppercase tracking-[.12em] w-20 shrink-0" style={{ color: '#52525B' }}>PHASE</span>
            <span className="font-mono text-[12px] text-text-sub">{task.phase}</span>
          </div>
          <div className="flex items-baseline gap-[10px] mb-4">
            <span className="font-mono text-[9px] uppercase tracking-[.12em] w-20 shrink-0" style={{ color: '#52525B' }}>MILESTONE</span>
            <span className="font-mono text-[12px] font-medium" style={{ color: 'var(--amber)' }}>{task.milestone}</span>
          </div>
        </div>

        <div className="border-t mx-0 mb-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }} />

        {/* Task body */}
        <div className="px-5 pt-5 pb-4">
          <div className="font-mono text-[10px] uppercase tracking-[.10em] mb-[14px]" style={{ color: 'var(--amber)' }}>NEXT TASK</div>
          <div className="text-[20px] font-semibold leading-[1.4] mb-[14px] text-text">{task.label}</div>
        </div>

        {/* Done When accordion */}
        <div
          className="flex items-center justify-between px-5 py-[14px] cursor-pointer select-none border-t"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          onClick={() => setDwOpen((v) => !v)}
        >
          <span className="font-mono text-[10px] uppercase tracking-[.10em]" style={{ color: '#52525B' }}>DONE WHEN</span>
          <span className="text-[11px] transition-transform duration-200" style={{
            color: '#52525B',
            display: 'inline-block',
            transform: dwOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>▾</span>
        </div>
        {dwOpen && (
          <div className="px-5 pb-[18px]">
            <p className="text-[13px] leading-[1.75]" style={{ color: '#A1A1AA' }}>{task.doneWhen}</p>
          </div>
        )}
      </div>

      {/* ── Mark Complete ── */}
      <button
        onClick={completeTask}
        className="w-full h-12 rounded-[10px] mb-2 font-semibold text-[14px] cursor-pointer transition-colors border"
        style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.20)', color: 'var(--green)' }}
      >
        Mark Complete
      </button>
      <p className="text-[12px] text-center mb-6" style={{ color: '#52525B' }}>Next task appears automatically</p>

      {/* ── Progress footer ── */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="font-mono text-[10px] uppercase tracking-[.08em]" style={{ color: '#52525B' }}>HIREONYX</span>
          <span className="text-[12px]" style={{ color: '#52525B' }}>{overall}% · {state.taskIdx} of {task.total}</span>
        </div>
        <div className="h-[3px] rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-[3px] rounded-full transition-all duration-300"
            style={{ width: `${overall}%`, background: 'var(--amber)' }} />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-[7px] h-[7px] rounded-full shrink-0"
            style={{ background: state.score.commits > 0 ? 'var(--green)' : 'var(--red)' }} />
          <span className="text-[12px]" style={{ color: '#A1A1AA' }}>
            {state.score.commits > 0 ? `${state.score.commits} commit${state.score.commits !== 1 ? 's' : ''}` : 'Last commit: never'}
          </span>
        </div>
      </div>

    </div>
  );
}
