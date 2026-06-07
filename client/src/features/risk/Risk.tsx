import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { cn } from '@/lib/utils';
import { RISK_LEVELS, RISK_RECOVERY } from '@/lib/engine';
import type { RiskId } from '@/types';

const RISKS: { id: RiskId; title: string }[] = [
  { id: 'no-dsa',            title: 'No DSA for 3+ days'                                         },
  { id: 'no-commit',         title: 'No commits for 3+ days'                                       },
  { id: 'new-project',       title: 'Started a new project (not HireOnyx)'                         },
  { id: 'plan-only',         title: 'More planning than coding this week'                          },
  { id: 'tutorial',          title: 'Watching tutorials instead of building'                       },
  { id: 'no-mock',           title: 'Missed weekly mock interview'                                 },
  { id: 'consume',           title: 'Consuming more than producing'                                },
  { id: 'not-owned',         title: 'Problems "done" but not owned'                               },
  { id: 'internship-window', title: 'Internship window approaching, no companies researched'       },
  { id: 'no-review',         title: 'Sunday Weekly Review not done'                               },
];

const LEVEL_STYLE = {
  critical: {
    bg:    'rgba(229,83,75,.07)',
    border:'rgba(229,83,75,.25)',
    badge: 'bg-[rgba(229,83,75,.15)] text-red',
    label: 'CRITICAL',
  },
  high: {
    bg:    'rgba(232,147,10,.06)',
    border:'rgba(232,147,10,.22)',
    badge: 'bg-[rgba(232,147,10,.15)] text-amber',
    label: 'HIGH',
  },
  medium: {
    bg:    'rgba(59,130,246,.05)',
    border:'rgba(59,130,246,.18)',
    badge: 'bg-[rgba(59,130,246,.12)] text-blue',
    label: 'MEDIUM',
  },
};

export function Risk() {
  const { state }      = useCareerStore();
  const { toggleRisk } = useCareerActions();

  const active   = RISKS.filter((r) => state.risks[r.id] === true);
  const inactive = RISKS.filter((r) => !state.risks[r.id]);

  const counts = { critical: 0, high: 0, medium: 0 };
  for (const r of active) counts[RISK_LEVELS[r.id]]++;

  return (
    <div>
      {/* ── Summary tiles ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Critical', value: counts.critical,              color: 'var(--red)'   },
          { label: 'High',     value: counts.high,                  color: 'var(--amber)' },
          { label: 'Medium',   value: counts.medium,                color: 'var(--blue)'  },
          { label: 'Clear',    value: RISKS.length - active.length, color: 'var(--green)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-border bg-bg-2 p-5">
            <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-3">{label}</div>
            <div className="font-mono text-[36px] font-bold leading-none" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Active risks ───────────────────────────────────────────────────────── */}
      {active.length > 0 ? (
        <div className="mb-6">
          <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-3">
            Active Risks — {active.length}
          </div>
          <div className="space-y-3">
            {active.map((r) => {
              const level = RISK_LEVELS[r.id];
              const cfg   = LEVEL_STYLE[level];
              return (
                <div
                  key={r.id}
                  className="rounded-2xl p-5 border"
                  style={{ background: cfg.bg, borderColor: cfg.border }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={cn('font-mono text-[10px] px-2 py-[3px] rounded-md uppercase tracking-[0.08em] font-semibold shrink-0', cfg.badge)}>
                        {cfg.label}
                      </span>
                      <span className="text-[15px] font-semibold">{r.title}</span>
                    </div>
                    <button
                      onClick={() => toggleRisk(r.id)}
                      className="font-mono text-[11px] text-text-sub hover:text-green transition-colors shrink-0 px-3 py-[6px] rounded-lg border border-border bg-bg-3 hover:border-green whitespace-nowrap"
                    >
                      Mark Cleared
                    </button>
                  </div>
                  <p className="text-[13px] text-text-muted leading-[1.55]">{RISK_RECOVERY[r.id]}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl p-6 mb-6 border text-center"
          style={{ background: 'rgba(29,185,122,.05)', borderColor: 'rgba(29,185,122,.2)' }}
        >
          <div className="font-mono text-[10px] text-green uppercase tracking-[0.1em] mb-2">All Clear</div>
          <div className="text-[17px] font-semibold text-text">No active risks.</div>
          <div className="text-[13px] text-text-sub mt-1">Mark a risk active if you recognize yourself in it today.</div>
        </div>
      )}

      {/* ── Inactive risks — compact list ──────────────────────────────────────── */}
      {inactive.length > 0 && (
        <div>
          <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-3">
            {active.length > 0 ? 'Other Risks' : 'Risk Checklist — mark any you recognize'}
          </div>
          <div className="rounded-2xl border border-border bg-bg-2 overflow-hidden">
            {inactive.map((r, i) => {
              const cfg = LEVEL_STYLE[RISK_LEVELS[r.id]];
              return (
                <div
                  key={r.id}
                  className={cn(
                    'flex items-center gap-3 px-5 py-[11px]',
                    i < inactive.length - 1 && 'border-b border-border'
                  )}
                >
                  <span className={cn('font-mono text-[9px] px-[6px] py-[2px] rounded uppercase tracking-[0.08em] font-semibold shrink-0', cfg.badge)}>
                    {cfg.label}
                  </span>
                  <span className="text-[13px] text-text-muted flex-1">{r.title}</span>
                  <button
                    onClick={() => toggleRisk(r.id)}
                    className="font-mono text-[10px] text-text-sub hover:text-amber transition-colors shrink-0 px-3 py-[5px] rounded-lg border border-border bg-bg-3 hover:border-amber whitespace-nowrap"
                  >
                    Mark Active
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
