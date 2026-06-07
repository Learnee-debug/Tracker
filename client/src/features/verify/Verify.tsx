import { useMemo } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { Card, SectionTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import { getVerifiedScore, calcTierReady, buildVerifyScores } from '@/lib/engine';
import { CHALLENGES, SKILL_KEYS } from '@/data/challenges';

function scoreColor(score: number): string {
  if (score >= 8) return 'var(--green)';
  if (score >= 6) return 'var(--teal)';
  if (score >= 3) return 'var(--amber)';
  return 'var(--red)';
}

export function Verify() {
  const { state } = useCareerStore();
  const { toggleVerify } = useCareerActions();

  const scores = useMemo(() => buildVerifyScores(state.verify), [state.verify]);
  const metrics = { mocks: state.score.mocks, commits: state.score.commits, oss: state.score.oss };

  return (
    <div>
      {/* Skill cards */}
      <Card>
        <SectionTitle>
          Objective Skill Verification — "Yes" only if you can do it right now without looking anything up.
        </SectionTitle>
        {SKILL_KEYS.map((key) => {
          const def = CHALLENGES[key];
          const score = getVerifiedScore(key, state.verify);
          const color = scoreColor(score);
          return (
            <div
              key={key}
              className="mb-4 pb-4 border-b border-border last:border-b-0 last:mb-0 last:pb-0"
            >
              {/* Header */}
              <div className="flex items-center gap-[10px] mb-2">
                <span className="font-mono text-[11px] text-text-muted uppercase tracking-[.06em] flex-1">
                  {def.label}
                </span>
                <span className="font-mono text-[14px] font-medium" style={{ color }}>
                  {score}/10
                </span>
              </div>
              <ProgressBar value={score * 10} color={color} height="xs" className="mb-2" />

              {/* Challenges */}
              {def.items.map((text, i) => {
                const checked = state.verify[`${key}_${i}`] ?? false;
                return (
                  <div
                    key={i}
                    className={cn(
                      'flex items-start gap-[9px] py-[5px] border-b border-bg-3 last:border-b-0 text-[12px]',
                      checked ? 'text-text-sub line-through' : 'text-text-muted'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleVerify(key, i)}
                      className="mt-[2px] w-[13px] h-[13px] cursor-pointer flex-shrink-0 accent-green"
                    />
                    <span>{text}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </Card>

      {/* Readiness */}
      <Card>
        <SectionTitle>Verified Readiness — based on challenge scores only</SectionTitle>
        {(['B', 'C', 'D'] as const).map((tier) => {
          const colors = { B: 'var(--teal)', C: 'var(--green)', D: 'var(--purple)' };
          const { pct, gap } = calcTierReady(tier, scores, metrics);
          const color = colors[tier];
          return (
            <div
              key={tier}
              className="grid items-center gap-[10px] py-[7px] border-b border-bg-3 last:border-b-0"
              style={{ gridTemplateColumns: '80px 1fr 48px 160px' }}
            >
              <span className="font-mono text-[11px] text-text-muted">Tier {tier}</span>
              <ProgressBar value={pct} color={color} height="sm" />
              <span className="font-mono text-[12px] font-medium text-right" style={{ color }}>
                {pct}%
              </span>
              <span className="text-[11px] text-text-sub">{gap}</span>
            </div>
          );
        })}
      </Card>

      {/* Score key */}
      <Card>
        <SectionTitle>Score Key — per skill</SectionTitle>
        <div className="font-mono text-[11px] text-text-muted leading-[2.2]">
          <span style={{ color: 'var(--red)' }}>0–2</span> Not yet functional — avoid claiming this skill in interviews<br />
          <span style={{ color: 'var(--amber)' }}>3–5</span> Developing — can build with guidance, not reliable under pressure<br />
          <span style={{ color: 'var(--teal)' }}>6–7</span> Functional — can build and explain this skill, internship-ready<br />
          <span style={{ color: 'var(--green)' }}>8–10</span> Strong — placement-ready, can handle follow-up questions
        </div>
      </Card>
    </div>
  );
}
