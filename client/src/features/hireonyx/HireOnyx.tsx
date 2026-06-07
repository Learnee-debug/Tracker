import { useMemo } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Tile } from '@/components/ui/Tile';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import { calcHxSectionPct, calcHxOverallPct } from '@/lib/engine';
import { HX_DEFS, HX_ORDER } from '@/data/hxDefs';

export function HireOnyx() {
  const { state } = useCareerStore();
  const { toggleHx } = useCareerActions();

  const overall = useMemo(() => calcHxOverallPct(state.hx), [state.hx]);
  const backendPct  = useMemo(() => calcHxSectionPct('backend',    state.hx), [state.hx]);
  const frontendPct = useMemo(() => calcHxSectionPct('frontend',   state.hx), [state.hx]);
  const deployPct   = useMemo(() => Math.round((calcHxSectionPct('deployment', state.hx) + calcHxSectionPct('docs', state.hx)) / 2), [state.hx]);

  return (
    <Card>
      <SectionTitle>HireOnyx Command Center</SectionTitle>

      {/* Note */}
      <div
        className="text-[11px] py-[6px] px-[10px] mb-[10px] leading-[1.4]"
        style={{ color: 'var(--amber)', background: 'rgba(240,160,48,.06)', borderLeft: '2px solid var(--amber)', borderRadius: '0 3px 3px 0' }}
      >
        Build order: Database → Backend → Auth → Frontend → Deployment → Docs → Resume Value
      </div>

      {/* Summary tiles */}
      <div className="grid gap-2 mb-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))' }}>
        <Tile label="Overall"     value={`${overall}%`}    color="var(--green)"  progress={overall}    progressColor="var(--green)" />
        <Tile label="Backend"     value={`${backendPct}%`}  color="var(--blue)"   progress={backendPct}  progressColor="var(--blue)" />
        <Tile label="Frontend"    value={`${frontendPct}%`} color="var(--purple)" progress={frontendPct} progressColor="var(--purple)" />
        <Tile label="Deploy+Docs" value={`${deployPct}%`}   color="var(--amber)"  progress={deployPct}   progressColor="var(--amber)" />
      </div>

      {/* Sections */}
      {HX_ORDER.map((sectionKey) => {
        const section = HX_DEFS[sectionKey];
        const pct = calcHxSectionPct(sectionKey, state.hx);
        return (
          <div key={sectionKey} className="mb-[14px] last:mb-0">
            {/* Section header */}
            <div className="flex items-center gap-[10px] mb-[7px]">
              <span className="font-mono text-[11px] uppercase tracking-[.07em] text-text-muted flex-1">
                {section.label}
              </span>
              <span className="font-mono text-[11px]" style={{ color: section.color }}>
                {pct}%
              </span>
            </div>
            <ProgressBar value={pct} color={section.color} height="xs" className="mb-[7px]" />

            {/* Tasks */}
            {section.tasks.map((task) => {
              const done = state.hx[task.id] ?? false;
              return (
                <div
                  key={task.id}
                  className={cn(
                    'flex items-start gap-2 py-[5px] border-b border-bg-3 last:border-b-0 text-[12px]',
                    done ? 'text-text-sub line-through' : 'text-text-muted'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => toggleHx(task.id)}
                    className="mt-[1px] w-[13px] h-[13px] cursor-pointer flex-shrink-0 accent-green"
                  />
                  <span>{task.label}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </Card>
  );
}
