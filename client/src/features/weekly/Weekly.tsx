import { useState } from 'react';
import { useCareerActions, useCareerStore } from '@/store/careerStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { calcWeeklyScore } from '@/lib/engine';
import type { WeeklyReviewInputs } from '@/types';

function scoreLabel(score: number): { text: string; color: string } {
  if (score >= 85) return { text: 'Strong. Maintain.',                color: 'var(--green)' };
  if (score >= 65) return { text: 'OK. Something slipped.',          color: 'var(--teal)'  };
  if (score >= 40) return { text: 'Drift. Course correct now.',       color: 'var(--amber)' };
  return             { text: 'Serious drift. Check Five Destroyers.', color: 'var(--red)'   };
}

const COMMIT_OPTIONS = [
  { value: '',  label: 'Select...' },
  { value: '6', label: 'Every day (6–7 days)' },
  { value: '4', label: 'Most days (4–5 days)' },
  { value: '2', label: 'Some days (2–3 days)' },
  { value: '1', label: 'One day' },
  { value: '0', label: 'None' },
];

const BUILD_OPTIONS = [
  { value: '',  label: 'Select...' },
  { value: '3', label: 'Yes — deployed something' },
  { value: '2', label: 'Partial — worked but nothing shipped' },
  { value: '1', label: 'Bug fixes only' },
  { value: '0', label: 'No building this week' },
];

const FIELD = 'w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-text outline-none focus:border-border-2 text-[14px] transition-colors';
const LABEL = 'block text-[13px] font-medium text-text-muted mb-2';

export function Weekly() {
  const { state }      = useCareerStore();
  const { saveWeekly } = useCareerActions();

  const [inputs, setInputs] = useState<WeeklyReviewInputs>({
    dsaCount:    0,
    commitLevel: 0,
    buildLevel:  0,
    avoidText:   '',
    blockText:   '',
    changeText:  '',
  });
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved]         = useState(false);

  const hasInput  = inputs.avoidText || inputs.blockText || inputs.changeText || inputs.dsaCount > 0;
  const score     = calcWeeklyScore(inputs);
  const { text: labelText, color: labelColor } = scoreLabel(score);

  function handleSave() {
    if (!inputs.avoidText.trim()) {
      setSaveError('Fill in what you avoided — required for an honest review.');
      return;
    }
    setSaveError('');
    saveWeekly(score, inputs.avoidText, inputs.changeText);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      {/* ── Score hero ─────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-bg-2 p-6 mb-5">
        <div className="flex items-start gap-8">
          <div className="shrink-0">
            <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-3">This Week's Score</div>
            <div
              className="font-mono text-[72px] font-bold leading-none mb-2"
              style={{ color: hasInput ? labelColor : 'var(--text4)' }}
            >
              {hasInput ? score : '—'}
            </div>
            <div className="text-[14px]" style={{ color: hasInput ? labelColor : 'var(--text3)' }}>
              {hasInput ? labelText : 'Fill in the review to see your score'}
            </div>
          </div>

          <div className="flex-1 pt-7">
            <ProgressBar value={hasInput ? score : 0} color={labelColor} height="md" className="mb-5" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                { range: '85–100', label: 'Strong',        color: 'var(--green)' },
                { range: '65–84',  label: 'OK',            color: 'var(--teal)'  },
                { range: '40–64',  label: 'Drift',         color: 'var(--amber)' },
                { range: '<40',    label: 'Serious drift', color: 'var(--red)'   },
              ].map(({ range, label, color }) => (
                <div key={range} className="flex items-center gap-2">
                  <span className="font-mono text-[12px] font-semibold" style={{ color }}>{range}</span>
                  <span className="text-[12px] text-text-sub">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Review form ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-bg-2 p-6 mb-5">
        <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-6">Sunday Review</div>

        <div className="space-y-5">
          <div>
            <label className={LABEL}>1. DSA problems owned this week (new, not just solved)</label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 14"
              className={FIELD}
              onChange={(e) => setInputs((p) => ({ ...p, dsaCount: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div>
            <label className={LABEL}>2. Committed code every day?</label>
            <select
              className={FIELD}
              onChange={(e) => setInputs((p) => ({ ...p, commitLevel: parseInt(e.target.value) || 0 }))}
            >
              {COMMIT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className={LABEL}>3. Built and shipped real features?</label>
            <select
              className={FIELD}
              onChange={(e) => setInputs((p) => ({ ...p, buildLevel: parseInt(e.target.value) || 0 }))}
            >
              {BUILD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className={LABEL}>
              4. What did you avoid?{' '}
              <span className="text-amber font-normal">(honest — required for score)</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Trees problems, error handling, this very review..."
              className={`${FIELD} resize-none`}
              onChange={(e) => setInputs((p) => ({ ...p, avoidText: e.target.value }))}
            />
          </div>

          <div>
            <label className={LABEL}>5. Biggest bottleneck this week?</label>
            <textarea
              rows={2}
              placeholder="e.g. Confusion on useEffect, decision fatigue, unclear goals..."
              className={`${FIELD} resize-none`}
              onChange={(e) => setInputs((p) => ({ ...p, blockText: e.target.value }))}
            />
          </div>

          <div>
            <label className={LABEL}>
              6. Specific change next week{' '}
              <span className="text-text-sub font-normal">(concrete action = more points)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. DSA before Slack daily, Trees Mon–Wed..."
              className={`${FIELD} resize-none`}
              onChange={(e) => setInputs((p) => ({ ...p, changeText: e.target.value }))}
            />
          </div>
        </div>

        {saveError && (
          <p className="text-[13px] text-red mt-4">{saveError}</p>
        )}

        <div className="mt-6">
          <Button
            variant={saved ? 'success' : 'primary'}
            size="md"
            onClick={handleSave}
          >
            {saved ? 'Saved ✓' : 'Save This Week'}
          </Button>
        </div>
      </div>

      {/* ── Review history ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-bg-2 p-6">
        <div className="font-mono text-[10px] text-text-sub uppercase tracking-[0.1em] mb-5">Review History</div>
        {state.weeklyHistory.length === 0 ? (
          <p className="text-[13px] text-text-sub">No reviews saved yet. Complete your first Sunday review above.</p>
        ) : (
          <div className="space-y-3">
            {state.weeklyHistory.map((entry) => {
              const { text, color } = scoreLabel(entry.score);
              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 p-4 rounded-xl bg-bg-3 border border-border"
                >
                  <div className="shrink-0 text-center">
                    <div className="font-mono text-[26px] font-bold leading-none" style={{ color }}>
                      {entry.score}
                    </div>
                    <div className="font-mono text-[10px] text-text-sub mt-1">/100</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-[11px] text-text-sub">{entry.date}</span>
                      <span className="text-[12px]" style={{ color }}>{text}</span>
                    </div>
                    <p className="text-[13px] text-text-muted leading-[1.5] truncate">
                      {entry.change || entry.avoid || '—'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
