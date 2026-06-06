import { useMemo, useState } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { Card, SectionTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import { getVerifiedScore, calcTierReady, buildVerifyScores } from '@/lib/engine';
import { CHALLENGES, SKILL_KEYS, type SkillKey } from '@/data/challenges';

function scoreColor(score: number): string {
  if (score >= 8) return 'var(--green)';
  if (score >= 6) return 'var(--teal)';
  if (score >= 3) return 'var(--amber)';
  return 'var(--red)';
}

export function Verify() {
  const { state } = useCareerStore();
  const { toggleVerify } = useCareerActions();
  const [expanded, setExpanded] = useState<SkillKey | null>(null);
  const [showScoreKey, setShowScoreKey] = useState(false);

  const scores = useMemo(() => buildVerifyScores(state.verify), [state.verify]);
  const metrics = { mocks: state.score.mocks, commits: state.score.commits, oss: state.score.oss };

  return (
    <div>
      {/* Instruction banner */}
      <div className="font-mono text-[11px] text-amber mb-4 px-1">
        YES only if you can do it right now — no looking anything up.
      </div>

      {/* Verified Readiness — pinned at top */}
      <Card className="mb-4">
        <SectionTitle>Verified Readiness — based on challenge scores only</SectionTitle>
        {(['B', 'C', 'D'] as const).map((tier) => {
          const colors = { B: 'var(--teal)', C: 'var(--green)', D: 'var(--purple)' };
          const { pct, gap } = calcTierReady(tier, scores, metrics);
          const color = colors[tier];
          return (
            <div
              key={tier}
              className="grid items-center gap-[10px] py-[7px] border-b border-bg-3 last:border-b-0"
              style={{ gridTemplateColumns: '80px 1fr 48px 1fr' }}
            >
              <span className="font-mono text-[11px] text-text-muted">Tier {tier}</span>
              <ProgressBar value={pct} color={color} height="normal" animated />
              <span className="font-mono text-[12px] font-medium text-right" style={{ color }}>
                {pct}%
              </span>
              <span className="text-[11px] text-text-sub">{gap}</span>
            </div>
          );
        })}

        {/* Score key — inline collapsible */}
        <button
          onClick={() => setShowScoreKey(!showScoreKey)}
          className="flex items-center gap-1 mt-3 font-mono text-[11px] text-text-sub hover:text-text-muted transition-colors cursor-pointer border-none bg-none"
        >
          ⓘ Score guide {showScoreKey ? '▲' : '▼'}
        </button>
        {showScoreKey && (
          <div className="font-mono text-[11px] text-text-muted mt-2 leading-[2.2]">
            <span style={{ color: 'var(--red)' }}>0–2</span> Not yet functional — avoid claiming in interviews<br />
            <span style={{ color: 'var(--amber)' }}>3–5</span> Developing — not reliable under pressure<br />
            <span style={{ color: 'var(--teal)' }}>6–7</span> Functional — internship-ready<br />
            <span style={{ color: 'var(--green)' }}>8–10</span> Strong — can handle follow-up questions
          </div>
        )}
      </Card>

      {/* Skill accordion */}
      <div className="flex flex-col gap-2">
        {SKILL_KEYS.map((key) => {
          const def = CHALLENGES[key];
          const score = getVerifiedScore(key, state.verify);
          const color = scoreColor(score);
          const isOpen = expanded === key;

          return (
            <div key={key} className="bg-bg-2 border border-border rounded-md overflow-hidden">
              {/* Accordion header */}
              <button
                onClick={() => setExpanded(isOpen ? null : key)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg-3 transition-colors"
              >
                <span className="font-mono text-[11px] uppercase tracking-[.06em] text-text-muted flex-1">
                  {def.label}
                </span>
                <ProgressBar
                  value={score * 10}
                  color={color}
                  height="thin"
                  className="w-20 flex-shrink-0"
                />
                <span
                  className="font-mono text-[13px] font-medium w-[40px] text-right flex-shrink-0"
                  style={{ color }}
                >
                  {score}/10
                </span>
                <span className="text-text-sub text-[10px] ml-1 flex-shrink-0">
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* Accordion body */}
              {isOpen && (
                <div className="px-4 pb-3 border-t border-border">
                  {def.items.map((text, i) => {
                    const checked = state.verify[`${key}_${i}`] ?? false;
                    return (
                      <div
                        key={i}
                        className={cn(
                          'flex items-start gap-[9px] py-[8px] border-b border-bg-3 last:border-b-0 text-[12px]',
                          checked ? 'text-text-sub line-through' : 'text-text-muted'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleVerify(key, i)}
                          className="mt-[2px] w-[14px] h-[14px] cursor-pointer flex-shrink-0 accent-green"
                        />
                        <span>{text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
