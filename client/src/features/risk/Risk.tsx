import { useState } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Tile } from '@/components/ui/Tile';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { RISK_LEVELS, RISK_RECOVERY } from '@/lib/engine';
import type { RiskId } from '@/types';

interface RiskDef {
  id: RiskId;
  title: string;
  rec: string;
}

const RISKS: RiskDef[] = [
  { id: 'no-dsa',            title: 'No DSA for 3+ days',                                     rec: RISK_RECOVERY['no-dsa'] },
  { id: 'no-commit',         title: 'No commits for 3+ days',                                  rec: RISK_RECOVERY['no-commit'] },
  { id: 'new-project',       title: 'Started a new project (not HireOnyx)',                    rec: RISK_RECOVERY['new-project'] },
  { id: 'plan-only',         title: 'More planning than coding this week',                      rec: RISK_RECOVERY['plan-only'] },
  { id: 'tutorial',          title: 'Watching tutorials instead of building',                   rec: RISK_RECOVERY['tutorial'] },
  { id: 'no-mock',           title: 'Missed weekly mock interview',                             rec: RISK_RECOVERY['no-mock'] },
  { id: 'consume',           title: 'Consuming more than producing',                            rec: RISK_RECOVERY['consume'] },
  { id: 'not-owned',         title: 'Problems "done" but not owned',                            rec: RISK_RECOVERY['not-owned'] },
  { id: 'internship-window', title: 'Internship window approaching, no companies researched',   rec: RISK_RECOVERY['internship-window'] },
  { id: 'no-review',         title: 'Sunday Weekly Review not done',                            rec: RISK_RECOVERY['no-review'] },
];

const LEVEL_BADGE: Record<'critical' | 'high' | 'medium', { variant: 'red' | 'amber' | 'blue'; label: string }> = {
  critical: { variant: 'red',   label: 'CRIT' },
  high:     { variant: 'amber', label: 'HIGH' },
  medium:   { variant: 'blue',  label: 'MED'  },
};

const LEVEL_BORDER: Record<'critical' | 'high' | 'medium', { bg: string; border: string }> = {
  critical: { bg: 'rgba(229,85,85,.06)',   border: 'rgba(229,85,85,.25)' },
  high:     { bg: 'rgba(240,160,48,.06)',  border: 'rgba(240,160,48,.2)' },
  medium:   { bg: 'rgba(74,158,222,.05)',  border: 'rgba(74,158,222,.15)' },
};

// ─── Active risk card ─────────────────────────────────────────────────────────

function ActiveRiskCard({ def }: { def: RiskDef }) {
  const { toggleRisk } = useCareerActions();
  const level = RISK_LEVELS[def.id];
  const badge = LEVEL_BADGE[level];
  const colors = LEVEL_BORDER[level];

  return (
    <div
      className="rounded-[5px] px-[13px] py-[10px] border mb-[7px] last:mb-0"
      style={{ background: colors.bg, borderColor: colors.border }}
    >
      <div className="flex items-start justify-between gap-3 mb-[3px]">
        <div className="flex items-center gap-2">
          <Badge variant={badge.variant}>{badge.label}</Badge>
          <span className="text-[13px] font-medium">{def.title}</span>
        </div>
        <Button
          size="sm"
          variant="danger"
          onClick={() => toggleRisk(def.id)}
          className="flex-shrink-0 min-h-[30px]"
        >
          Clear
        </Button>
      </div>
      <div className="text-[11px] text-text-muted leading-[1.4] mt-1">{def.rec}</div>
    </div>
  );
}

// ─── Inactive risk row (compact) ─────────────────────────────────────────────

function InactiveRiskRow({ def }: { def: RiskDef }) {
  const { toggleRisk } = useCareerActions();
  const level = RISK_LEVELS[def.id];
  const badge = LEVEL_BADGE[level];

  return (
    <div className="flex items-center gap-3 py-[8px] border-b border-border last:border-b-0">
      <Badge variant={badge.variant} className="opacity-60">{badge.label}</Badge>
      <span className="text-[12px] text-text-muted flex-1">{def.title}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => toggleRisk(def.id)}
        className="flex-shrink-0 min-h-[30px]"
      >
        Activate
      </Button>
    </div>
  );
}

// ─── Risk (root) ──────────────────────────────────────────────────────────────

export function Risk() {
  const { state } = useCareerStore();
  const [showInactive, setShowInactive] = useState(false);

  const activeRisks   = RISKS.filter((r) => state.risks[r.id] ?? false);
  const inactiveRisks = RISKS.filter((r) => !(state.risks[r.id] ?? false));

  const counts = { critical: 0, high: 0, medium: 0 };
  for (const r of activeRisks) {
    const level = RISK_LEVELS[r.id];
    if (level) counts[level]++;
  }
  const allClear = activeRisks.length === 0;

  // Group active risks by level for section headers
  const criticals = activeRisks.filter((r) => RISK_LEVELS[r.id] === 'critical');
  const highs     = activeRisks.filter((r) => RISK_LEVELS[r.id] === 'high');
  const mediums   = activeRisks.filter((r) => RISK_LEVELS[r.id] === 'medium');

  return (
    <div>
      {/* Summary */}
      {allClear ? (
        <Card variant="success" className="mb-[14px] flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green inline-block flex-shrink-0" />
          <span className="font-mono text-[13px] text-green">
            ALL CLEAR — 0 active risks. Sprint on track.
          </span>
        </Card>
      ) : (
        <Card className="mb-[14px]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Tile
              label="Critical"
              value={counts.critical}
              color="var(--red)"
              size="sm"
              glow={counts.critical > 0}
            />
            <Tile label="High"   value={counts.high}   color="var(--amber)" size="sm" />
            <Tile label="Medium" value={counts.medium} color="var(--blue)"  size="sm" />
            <Tile label="Clear"  value={inactiveRisks.length} color="var(--green)" size="sm" />
          </div>
        </Card>
      )}

      {/* Active risks */}
      {activeRisks.length > 0 && (
        <div className="mb-4">
          {criticals.length > 0 && (
            <div>
              <div className="font-mono text-[10px] text-text-sub uppercase tracking-[.1em] mb-2">
                Critical
              </div>
              {criticals.map((r) => <ActiveRiskCard key={r.id} def={r} />)}
            </div>
          )}
          {highs.length > 0 && (
            <div className={cn(criticals.length > 0 && 'mt-4')}>
              <div className="font-mono text-[10px] text-text-sub uppercase tracking-[.1em] mb-2">
                High
              </div>
              {highs.map((r) => <ActiveRiskCard key={r.id} def={r} />)}
            </div>
          )}
          {mediums.length > 0 && (
            <div className={cn((criticals.length > 0 || highs.length > 0) && 'mt-4')}>
              <div className="font-mono text-[10px] text-text-sub uppercase tracking-[.1em] mb-2">
                Medium
              </div>
              {mediums.map((r) => <ActiveRiskCard key={r.id} def={r} />)}
            </div>
          )}
        </div>
      )}

      {/* All risks reference (collapsible) */}
      <Card>
        <div className="flex items-center justify-between">
          <SectionTitle className="mb-0 pb-0 border-b-0">
            All Risks
          </SectionTitle>
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="font-mono text-[10px] text-text-sub hover:text-text-muted transition-colors cursor-pointer border-none bg-none"
          >
            {showInactive ? 'hide ▲' : `show ${inactiveRisks.length} inactive ▼`}
          </button>
        </div>

        {showInactive && (
          <div className="mt-3 pt-3 border-t border-border">
            {inactiveRisks.map((r) => <InactiveRiskRow key={r.id} def={r} />)}
            {inactiveRisks.length === 0 && (
              <div className="text-[12px] text-text-sub">All risks are currently active.</div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
