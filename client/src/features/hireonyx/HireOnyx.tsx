import { useMemo, useState, useEffect } from 'react';
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

  const overall     = useMemo(() => calcHxOverallPct(state.hx), [state.hx]);
  const backendPct  = useMemo(() => calcHxSectionPct('backend',    state.hx), [state.hx]);
  const frontendPct = useMemo(() => calcHxSectionPct('frontend',   state.hx), [state.hx]);
  const deployPct   = useMemo(
    () => Math.round((calcHxSectionPct('deployment', state.hx) + calcHxSectionPct('docs', state.hx)) / 2),
    [state.hx]
  );

  // Auto-collapse 100%-complete sections on mount
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  useEffect(() => {
    const done = HX_ORDER.filter((k) => calcHxSectionPct(k, state.hx) === 100);
    setCollapsed(new Set(done));
  }, []); // intentionally run once on mount only

  function toggleCollapsed(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <Card>
      <SectionTitle>HireOnyx Command Center</SectionTitle>

      {/* Completion banner */}
      {overall === 100 && (
        <div className="mb-5 p-4 rounded-lg border border-[rgba(34,201,141,.3)] bg-[rgba(34,201,141,.06)] font-mono text-[13px] text-green">
          HireOnyx Complete — ready to demo and submit. ✓
        </div>
      )}

      {/* Build order note */}
      <div
        className="text-[11px] py-[6px] px-[10px] mb-[14px] leading-[1.4]"
        style={{
          color: 'var(--amber)',
          background: 'rgba(240,160,48,.06)',
          borderLeft: '4px solid var(--amber)',
          borderRadius: '0 3px 3px 0',
        }}
      >
        Build order: Database → Backend → Auth → Frontend → Deployment → Docs → Resume Value
      </div>

      {/* Overall hero tile */}
      <div className="mb-3">
        <Tile
          label="Overall Completion"
          value={`${overall}%`}
          color="var(--green)"
          progress={overall}
          progressColor="var(--green)"
          size="lg"
        />
      </div>

      {/* Sub-tiles */}
      <div className="grid grid-cols-3 gap-2 mb-[14px]">
        <Tile label="Backend"     value={`${backendPct}%`}  color="var(--blue)"   progress={backendPct}  progressColor="var(--blue)" />
        <Tile label="Frontend"    value={`${frontendPct}%`} color="var(--purple)" progress={frontendPct} progressColor="var(--purple)" />
        <Tile label="Deploy+Docs" value={`${deployPct}%`}   color="var(--amber)"  progress={deployPct}   progressColor="var(--amber)" />
      </div>

      {/* Sections */}
      {HX_ORDER.map((sectionKey) => {
        const section   = HX_DEFS[sectionKey];
        const pct       = calcHxSectionPct(sectionKey, state.hx);
        const isCollapsed = collapsed.has(sectionKey);

        return (
          <div key={sectionKey} className="mb-[14px] last:mb-0">
            {/* Section header — clickable */}
            <button
              onClick={() => toggleCollapsed(sectionKey)}
              className="w-full flex items-center gap-[10px] mb-[7px] text-left hover:opacity-80 transition-opacity"
            >
              <span className="font-mono text-[11px] uppercase tracking-[.07em] text-text-muted flex-1">
                {section.label}
              </span>
              <span className="font-mono text-[11px]" style={{ color: section.color }}>
                {pct}%
              </span>
              <span className="text-text-sub text-[10px]">{isCollapsed ? '▼' : '▲'}</span>
            </button>

            {!isCollapsed && (
              <>
                <ProgressBar value={pct} color={section.color} height="thin" animated className="mb-[7px]" />
                {section.tasks.map((task) => {
                  const done = state.hx[task.id] ?? false;
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        'flex items-start gap-2 py-[8px] border-b border-bg-3 last:border-b-0 text-[12px]',
                        done ? 'text-text-sub line-through' : 'text-text-muted'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => toggleHx(task.id)}
                        className="mt-[1px] w-[15px] h-[15px] cursor-pointer flex-shrink-0 accent-green"
                      />
                      <span>{task.label}</span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        );
      })}
    </Card>
  );
}
