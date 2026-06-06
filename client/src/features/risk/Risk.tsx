import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Tile } from '@/components/ui/Tile';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { RISK_LEVELS, RISK_RECOVERY } from '@/lib/engine';
import type { RiskId } from '@/types';

interface RiskDef {
  id: RiskId;
  title: string;
  rec: string;
}

const RISKS: RiskDef[] = [
  { id: 'no-dsa',            title: 'No DSA for 3+ days',                     rec: RISK_RECOVERY['no-dsa'] },
  { id: 'no-commit',         title: 'No commits for 3+ days',                  rec: RISK_RECOVERY['no-commit'] },
  { id: 'new-project',       title: 'Started a new project (not HireOnyx)',    rec: RISK_RECOVERY['new-project'] },
  { id: 'plan-only',         title: 'More planning than coding this week',      rec: RISK_RECOVERY['plan-only'] },
  { id: 'tutorial',          title: 'Watching tutorials instead of building',   rec: RISK_RECOVERY['tutorial'] },
  { id: 'no-mock',           title: 'Missed weekly mock interview',             rec: RISK_RECOVERY['no-mock'] },
  { id: 'consume',           title: 'Consuming more than producing',            rec: RISK_RECOVERY['consume'] },
  { id: 'not-owned',         title: 'Problems "done" but not owned',            rec: RISK_RECOVERY['not-owned'] },
  { id: 'internship-window', title: 'Internship window approaching, no companies researched', rec: RISK_RECOVERY['internship-window'] },
  { id: 'no-review',         title: 'Sunday Weekly Review not done',            rec: RISK_RECOVERY['no-review'] },
];

const LEVEL_STYLES = {
  critical: {
    bg:    'rgba(229,85,85,.06)',
    border:'rgba(229,85,85,.25)',
    badge: { bg: 'var(--rdim)', color: '#f5b8b8', label: 'CRIT' },
  },
  high: {
    bg:    'rgba(240,160,48,.06)',
    border:'rgba(240,160,48,.2)',
    badge: { bg: 'var(--adim)', color: '#f5d8a0', label: 'HIGH' },
  },
  medium: {
    bg:    'rgba(74,158,222,.05)',
    border:'rgba(74,158,222,.15)',
    badge: { bg: 'rgba(74,158,222,.2)', color: 'var(--blue)', label: 'MED' },
  },
};

function RiskItem({ def }: { def: RiskDef }) {
  const { state } = useCareerStore();
  const { toggleRisk } = useCareerActions();
  const active = state.risks[def.id] ?? false;
  const level = RISK_LEVELS[def.id];
  const styles = LEVEL_STYLES[level];

  return (
    <div
      className={cn('rounded-[5px] px-[13px] py-[10px] border mb-[7px] flex gap-3 items-start last:mb-0', active ? '' : 'opacity-45 bg-bg-3 border-border')}
      style={active ? { background: styles.bg, borderColor: styles.border } : undefined}
    >
      {/* Badge */}
      <span
        className="font-mono text-[10px] px-[6px] py-[2px] rounded-[3px] whitespace-nowrap flex-shrink-0 mt-[1px]"
        style={{ background: styles.badge.bg, color: styles.badge.color }}
      >
        {styles.badge.label}
      </span>

      {/* Body */}
      <div className="flex-1">
        <div className="text-[13px] font-medium mb-[3px]">{def.title}</div>
        <div className="text-[11px] text-text-muted mb-[5px] leading-[1.4]">{def.rec}</div>
        <Button
          size="sm"
          onClick={() => toggleRisk(def.id)}
          style={active ? { color: 'var(--red)' } : undefined}
        >
          {active ? 'Mark Cleared' : 'Mark Active'}
        </Button>
      </div>
    </div>
  );
}

export function Risk() {
  const { state } = useCareerStore();

  const counts = { critical: 0, high: 0, medium: 0, clear: 0 };
  for (const [id, active] of Object.entries(state.risks) as [RiskId, boolean | undefined][]) {
    if (!active) continue;
    const level = RISK_LEVELS[id];
    if (level) counts[level]++;
  }
  const total = counts.critical + counts.high + counts.medium;
  counts.clear = RISKS.length - total;

  const criticals = RISKS.filter((r) => RISK_LEVELS[r.id] === 'critical');
  const highs     = RISKS.filter((r) => RISK_LEVELS[r.id] === 'high');
  const mediums   = RISKS.filter((r) => RISK_LEVELS[r.id] === 'medium');

  return (
    <div>
      {/* Summary tiles */}
      <Card className="mb-[14px]">
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))' }}>
          <Tile label="Critical" value={counts.critical} color="var(--red)" />
          <Tile label="High"     value={counts.high}     color="var(--amber)" />
          <Tile label="Medium"   value={counts.medium}   color="var(--blue)" />
          <Tile label="Clear"    value={counts.clear}    color="var(--green)" />
        </div>
      </Card>

      {/* Critical */}
      <SectionTitle className="mb-[10px]">Critical</SectionTitle>
      {criticals.map((r) => <RiskItem key={r.id} def={r} />)}

      {/* High */}
      <SectionTitle className="mt-[14px] mb-[10px]">High</SectionTitle>
      {highs.map((r) => <RiskItem key={r.id} def={r} />)}

      {/* Medium */}
      <SectionTitle className="mt-[14px] mb-[10px]">Medium</SectionTitle>
      {mediums.map((r) => <RiskItem key={r.id} def={r} />)}
    </div>
  );
}
