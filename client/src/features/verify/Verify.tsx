import { useState, useMemo } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import { calcTierReady, buildVerifyScores } from '@/lib/engine';
import { CHALLENGES, SKILL_KEYS } from '@/data/challenges';

function scoreColor(score: number): string {
  if (score >= 8) return 'var(--green)';
  if (score >= 6) return 'var(--teal)';
  if (score >= 3) return 'var(--amber)';
  return 'var(--red)';
}

export function Verify() {
  const { state }        = useCareerStore();
  const { toggleVerify } = useCareerActions();

  const scores  = useMemo(() => buildVerifyScores(state.verify), [state.verify]);
  const metrics = { mocks: state.score.mocks, commits: state.score.commits, oss: state.score.oss };

  // Sort weakest first so the accordion default-expands what needs the most work
  const sortedKeys = useMemo(
    () => [...SKILL_KEYS].sort((a, b) => scores[a] - scores[b]),
    [scores]
  );

  const [expanded, setExpanded] = useState<string | null>(sortedKeys[0] ?? null);

  function toggle(key: string) {
    setExpanded((prev) => (prev === key ? null : key));
  }

  return (
    <div>
      {/* ── Overview grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        {SKILL_KEYS.map((key) => {
          const score = scores[key] ?? 0;
          const color = scoreColor(score);
          const isActive = expanded === key;
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={cn(
                'rounded-2xl p-4 border text-left transition-all',
                isActive
                  ? 'border-border-2 bg-bg-3'
                  : 'border-border bg-bg-2 hover:border-border-2 hover:bg-bg-3'
              )}
            >
              <div className="font-mono text-[9px] text-text-sub uppercase tracking-[0.1em] mb-2 truncate">
                {CHALLENGES[key].label}
              </div>
              <div className="font-mono leading-none mb-2">
                <span className="text-[24px] font-bold" style={{ color }}>{score}</span>
                <span className="text-[12px] text-text-sub">/10</span>
              </div>
              <ProgressBar value={score * 10} color={color} height="xs" />
            </button>
          );
        })}
      </div>

      {/* ── Accordion ──────────────────────────────────────────────────────────── */}
      <div className="space-y-2 mb-5">
        {sortedKeys.map((key) => {
          const def    = CHALLENGES[key];
          const score  = scores[key] ?? 0;
          const color  = scoreColor(score);
          const isOpen = expanded === key;
          const doneCount = def.items.filter((_, i) => state.verify[`${key}_${i}`]).length;

          return (
            <div
              key={key}
              className={cn('rounded-2xl border overflow-hidden transition-colors', isOpen ? 'border-border-2' : 'border-border')}
            >
              {/* Header row */}
              <button
                onClick={() => toggle(key)}
                className="w-full flex items-center gap-4 px-5 py-4 bg-bg-2 hover:bg-bg-3 transition-colors text-left"
              >
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <span className="text-[15px] font-semibold truncate">{def.label}</span>
                  <span className="text-[12px] text-text-sub shrink-0">{doneCount}/5 done</span>
                </div>
                <ProgressBar value={score * 10} color={color} height="sm" className="w-20 shrink-0" />
                <span className="font-mono text-[14px] font-bold w-10 text-right shrink-0" style={{ color }}>
                  {score}/10
                </span>
                <span className="text-text-sub text-[11px] shrink-0 w-4 text-center">
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* Challenge list */}
              {isOpen && (
                <div className="bg-bg-3 border-t border-border px-5 py-3">
                  <p className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-3">
                    "Yes" only if you can do it right now without looking anything up
                  </p>
                  {def.items.map((text, i) => {
                    const checked = state.verify[`${key}_${i}`] ?? false;
                    return (
                      <label
                        key={i}
                        className={cn(
                          'flex items-start gap-3 py-[10px] cursor-pointer border-b border-bg-4 last:border-b-0',
                          checked && 'opacity-50'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleVerify(key, i)}
                          className="mt-[3px] w-4 h-4 cursor-pointer flex-shrink-0 accent-green"
                        />
                        <span className={cn('text-[14px] leading-[1.5]', checked ? 'line-through text-text-sub' : 'text-text-muted')}>
                          {text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Tier Readiness ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-bg-2 p-5 mb-4">
        <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-5">Verified Readiness</div>
        <div className="space-y-5">
          {(['B', 'C', 'D'] as const).map((tier) => {
            const colors = { B: 'var(--teal)', C: 'var(--green)', D: 'var(--purple)' };
            const labels = { B: 'Tier B — Fast hire', C: 'Tier C — Competitive', D: 'Tier D — Top tier' };
            const { pct, gap } = calcTierReady(tier, scores, metrics);
            const color = colors[tier];
            return (
              <div key={tier}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-text-muted">{labels[tier]}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-text-sub">{gap}</span>
                    <span className="font-mono text-[15px] font-bold" style={{ color }}>{pct}%</span>
                  </div>
                </div>
                <ProgressBar value={pct} color={color} height="md" />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Score Key ──────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-bg-2 p-5">
        <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-4">Score Key</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { range: '0–2',  desc: 'Not functional — avoid claiming in interviews', color: 'var(--red)'   },
            { range: '3–5',  desc: 'Developing — not reliable under pressure',       color: 'var(--amber)' },
            { range: '6–7',  desc: 'Functional — internship-ready',                  color: 'var(--teal)'  },
            { range: '8–10', desc: 'Strong — placement-ready',                       color: 'var(--green)' },
          ].map(({ range, desc, color }) => (
            <div key={range} className="flex items-start gap-3 p-3 rounded-xl bg-bg-3">
              <span className="font-mono text-[13px] font-bold shrink-0" style={{ color }}>{range}</span>
              <span className="text-[13px] text-text-muted">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
