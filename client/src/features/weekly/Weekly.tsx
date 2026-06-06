import { useState } from 'react';
import { useCareerActions } from '@/store/careerStore';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea, Select } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { calcWeeklyScore } from '@/lib/engine';
import { useCareerStore } from '@/store/careerStore';
import type { WeeklyReviewInputs } from '@/types';

function scoreLabel(score: number): { text: string; color: string } {
  if (score >= 85) return { text: 'Strong. Maintain.',               color: 'var(--green)' };
  if (score >= 65) return { text: 'OK. Something slipped.',          color: 'var(--teal)' };
  if (score >= 40) return { text: 'Drift. Course correct now.',      color: 'var(--amber)' };
  return             { text: 'Serious drift. Check Five Destroyers.', color: 'var(--red)' };
}

const COMMIT_OPTIONS = [
  { value: '',  label: 'Select...' },
  { value: '6', label: 'Every day (6–7)' },
  { value: '4', label: 'Most (4–5)' },
  { value: '2', label: 'Some (2–3)' },
  { value: '1', label: 'One day' },
  { value: '0', label: 'None' },
];

const BUILD_OPTIONS = [
  { value: '',  label: 'Select...' },
  { value: '3', label: 'Yes — deployed' },
  { value: '2', label: 'Partial — worked but nothing shipped' },
  { value: '1', label: 'Bug fixes only' },
  { value: '0', label: 'No building' },
];

export function Weekly() {
  const { state } = useCareerStore();
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
  const [saved, setSaved] = useState(false);

  const score = calcWeeklyScore(inputs);
  const { text: labelText, color: labelColor } = scoreLabel(score);

  function handleSave() {
    if (!inputs.avoidText.trim()) {
      setSaveError('Fill in what you avoided — required for an honest review.');
      return;
    }
    setSaveError('');
    saveWeekly(score, inputs.avoidText, inputs.changeText);
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  }

  return (
    <div>
      {/* Score + key — stacked on mobile, 2-col on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <Card className="mb-0">
          <SectionTitle>This Week&apos;s Score</SectionTitle>
          <div
            className="font-mono text-[40px] font-medium text-center py-3"
            style={{ color: score > 0 ? labelColor : 'var(--text3)' }}
          >
            {score > 0 ? score : '—'}
          </div>
          <div className="text-center text-[12px] text-text-muted mt-[2px]">{labelText}</div>
          <ProgressBar value={score} color={labelColor} height="normal" animated className="mt-[10px]" />
          {/* Completion feedback */}
          {saved && (
            <div className="mt-3 pt-3 border-t border-[rgba(34,201,141,.2)] font-mono text-[12px] text-green">
              Week logged — Score: {score}/100 ✓
            </div>
          )}
        </Card>

        <Card className="mb-0">
          <SectionTitle>Score Key</SectionTitle>
          <div className="font-mono text-[11px] leading-[2.2] text-text-muted">
            <span style={{ color: 'var(--green)' }}>85–100</span> Strong. Maintain.<br />
            <span style={{ color: 'var(--teal)' }}>65–84</span> OK. Something slipped.<br />
            <span style={{ color: 'var(--amber)' }}>40–64</span> Drift. Course correct.<br />
            <span style={{ color: 'var(--red)' }}>&lt;40</span> Serious drift. Review 5 destroyers.
          </div>
        </Card>
      </div>

      {/* Review form */}
      <Card>
        <SectionTitle>Sunday Review</SectionTitle>

        <div className="mb-4">
          <label className="block text-[13px] text-text font-medium mb-1">
            1. DSA problems owned this week (new)
          </label>
          <input
            type="number"
            min={0}
            placeholder="e.g. 14"
            className="bg-bg-3 border border-border rounded px-[10px] py-[8px] text-text outline-none focus:border-border-2 w-full"
            onChange={(e) => setInputs((p) => ({ ...p, dsaCount: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <div className="mb-4">
          <Select
            label="2. Committed every day?"
            options={COMMIT_OPTIONS}
            onChange={(e) => setInputs((p) => ({ ...p, commitLevel: parseInt(e.target.value) || 0 }))}
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <Select
            label="3. Built and shipped real features?"
            options={BUILD_OPTIONS}
            onChange={(e) => setInputs((p) => ({ ...p, buildLevel: parseInt(e.target.value) || 0 }))}
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <Textarea
            label="4. What did you avoid? (honest — required for points)"
            placeholder="e.g. Trees problems, error handling, this very review..."
            rows={2}
            onChange={(e) => setInputs((p) => ({ ...p, avoidText: e.target.value }))}
          />
        </div>

        <div className="mb-4">
          <Textarea
            label="5. Biggest bottleneck?"
            placeholder="e.g. Confusion on useEffect, decision fatigue..."
            rows={2}
            onChange={(e) => setInputs((p) => ({ ...p, blockText: e.target.value }))}
          />
        </div>

        <div className="mb-4">
          <Textarea
            label="6. Specific change next week (concrete action = points)"
            placeholder="e.g. DSA before Slack daily, Trees Mon–Wed..."
            rows={2}
            onChange={(e) => setInputs((p) => ({ ...p, changeText: e.target.value }))}
          />
        </div>

        {saveError && (
          <div className="text-[11px] text-red mb-3 border-l-4 border-red pl-3">{saveError}</div>
        )}

        <Button onClick={handleSave} variant="primary" className="w-full sm:w-auto">
          Save This Week
        </Button>
      </Card>

      {/* History */}
      <Card>
        <SectionTitle>History</SectionTitle>
        {state.weeklyHistory.length === 0 ? (
          <div className="text-text-sub text-[12px]">No reviews yet.</div>
        ) : (
          state.weeklyHistory.map((entry) => {
            const { color } = scoreLabel(entry.score);
            return (
              <div
                key={entry.id}
                className="flex gap-[10px] items-center py-[10px] border-b border-bg-3 last:border-b-0 text-[12px]"
              >
                <span className="font-mono text-[11px] text-text-sub min-w-[72px]">
                  {entry.date}
                </span>
                <span className="font-mono min-w-[50px] font-medium" style={{ color }}>
                  {entry.score}/100
                </span>
                <span className="text-text-sub text-[11px]">
                  {entry.change || entry.avoid || '—'}
                </span>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}
