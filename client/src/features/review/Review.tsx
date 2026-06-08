import { useState } from 'react';
import { useCareerStore, useCareerActions } from '@/store/careerStore';
import { cn } from '@/lib/utils';
import { COMPANIES } from '@/data/companies';
import type { PipelineStatus } from '@/types';

// ─── SKILL CHECK DATA ─────────────────────────────────────────────────────────
// 15-item flat list, 5 categories × 3 items, per architecture lock.

const SCATS = ['DSA', 'JAVASCRIPT', 'REACT', 'NODE / EXPRESS', 'FULL STACK'];

const SKILLS = [
  // DSA
  'Implement binary search from scratch — no hints, correct first try',
  'Reverse a linked list iteratively and recursively from memory',
  'Write BFS on a graph and state time + space complexity',
  // JavaScript
  'Implement debounce(fn, delay) from scratch without looking it up',
  'Explain the event loop: microtask vs macrotask with a code example',
  'Implement a basic Promise with .then() — no libraries, from scratch',
  // React
  'Build useFetch hook (loading, error, data states) from a blank file',
  'Explain why React re-renders and name two ways to prevent unnecessary ones',
  'Build a protected route that redirects unauthenticated users',
  // Node / Express
  'Build a working CRUD API with middleware and error handler under 90 min',
  'Implement JWT auth middleware from scratch — no tutorial or docs open',
  'Handle async errors globally without per-route try-catch blocks',
  // Full Stack
  'Explain CORS — what it is, why it exists, how to configure it in Express',
  'Trace the full auth flow: register → login → token → protected route',
  'Design a job board schema: users, employers, jobs, applications with relationships',
];

// ─── Section A: Weekly Retrospective ─────────────────────────────────────────
// Lifted from Weekly.tsx — score system removed, 4 questions per architecture.

function SectionA() {
  const { state }     = useCareerStore();
  const { saveReview } = useCareerActions();

  const [dsa,        setDsa]        = useState('');
  const [avoided,    setAvoided]    = useState('');
  const [constraint, setConstraint] = useState('');
  const [change,     setChange]     = useState('');
  const [saved,      setSaved]      = useState(false);
  const [err,        setErr]        = useState('');

  function handleSave() {
    if (!avoided.trim()) {
      setErr('What you avoided is required — be honest.');
      return;
    }
    setErr('');
    saveReview(dsa, avoided, constraint, change);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const fi = 'w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-[8px] px-[14px] py-[10px] text-text text-[13px] outline-none transition-colors focus:border-[rgba(59,130,246,0.5)] placeholder:text-[#52525B]';

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[.10em] mb-1" style={{ color: 'var(--purple)' }}>
        WEEKLY RETROSPECTIVE
      </div>
      <div className="text-[12px] italic mb-[18px]" style={{ color: '#52525B' }}>Sunday only. Honest answers. No scoring.</div>

      <div className="mb-[14px]">
        <label className="block text-[13px] font-medium mb-[6px] text-text-sub">
          <span className="font-mono text-[11px] mr-1" style={{ color: '#52525B' }}>01 //</span>
          DSA owned this week — re-solvable without hints
        </label>
        <input type="number" placeholder="How many can you solve right now?" className={fi}
          value={dsa} onChange={(e) => setDsa(e.target.value)} />
      </div>

      <div className="mb-[14px]">
        <label className="block text-[13px] font-medium mb-[6px] text-text-sub">
          <span className="font-mono text-[11px] mr-1" style={{ color: '#52525B' }}>02 //</span>
          What did you avoid — name the exact things
        </label>
        <textarea rows={3} placeholder="Be specific. What exact tasks did you skip?"
          className={`${fi} resize-y min-h-[76px] leading-[1.6]`}
          value={avoided} onChange={(e) => setAvoided(e.target.value)} />
      </div>

      <div className="mb-[14px]">
        <label className="block text-[13px] font-medium mb-[6px] text-text-sub">
          <span className="font-mono text-[11px] mr-1" style={{ color: '#52525B' }}>03 //</span>
          Real constraint — not the excuse
        </label>
        <textarea rows={2} placeholder="What actually stopped you?"
          className={`${fi} resize-y min-h-[76px] leading-[1.6]`}
          value={constraint} onChange={(e) => setConstraint(e.target.value)} />
      </div>

      <div className="mb-[14px]">
        <label className="block text-[13px] font-medium mb-[6px] text-text-sub">
          <span className="font-mono text-[11px] mr-1" style={{ color: '#52525B' }}>04 //</span>
          One concrete change next week
        </label>
        <textarea rows={2} placeholder="Specific. Actionable. One thing."
          className={`${fi} resize-y min-h-[60px] leading-[1.6]`}
          value={change} onChange={(e) => setChange(e.target.value)} />
      </div>

      {err && <p className="text-[13px] mb-3" style={{ color: 'var(--red)' }}>{err}</p>}

      <button onClick={handleSave}
        className="w-full h-11 rounded-[10px] font-semibold text-[14px] cursor-pointer transition-colors border mt-1"
        style={{
          background:   saved ? 'rgba(34,197,94,0.08)'   : 'rgba(139,92,246,0.08)',
          borderColor:  saved ? 'rgba(34,197,94,0.20)'   : 'rgba(139,92,246,0.20)',
          color:        saved ? 'var(--green)'            : 'var(--purple)',
        }}>
        {saved ? 'Saved ✓' : 'Save Review'}
      </button>

      {/* History — reused from Weekly.tsx */}
      {state.weeklyHistory.length > 0 && (
        <div className="mt-5">
          <span className="font-mono text-[10px] uppercase tracking-[.10em] text-text-sub">HISTORY</span>
          <div className="rounded-[10px] border mt-2 overflow-hidden"
            style={{ background: 'var(--card)', borderColor: 'rgba(255,255,255,0.07)' }}>
            {state.weeklyHistory.slice(0, 6).map((r, i) => (
              <div key={r.id}
                className={cn('flex gap-[10px] items-baseline px-[10px] py-[10px] text-[12px]', i < Math.min(5, state.weeklyHistory.length - 1) && 'border-b')}
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <span className="font-mono text-[10px] shrink-0" style={{ color: '#52525B' }}>{r.date}</span>
                {r.dsa && <span className="font-mono text-[10px] shrink-0" style={{ color: 'var(--green)' }}>{r.dsa} owned</span>}
                <span className="text-text-sub truncate">{(r.avoid || '').slice(0, 60)}{(r.avoid || '').length > 60 ? '…' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section B: Skill Check ───────────────────────────────────────────────────

function scoreColor(n: number, of: number) {
  const r = n / of;
  if (r <= 0.33) return 'var(--red)';
  if (r <= 0.67) return 'var(--amber)';
  if (r < 1)     return 'var(--blue)';
  return 'var(--green)';
}

function SectionB() {
  const { state }       = useCareerStore();
  const { toggleSkill } = useCareerActions();
  const total = state.skills.filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[10px] uppercase tracking-[.10em] text-text-sub">SKILL CHECK</span>
        <span className="font-mono text-[13px] font-bold" style={{ color: scoreColor(total, 15) }}>{total}/15</span>
      </div>
      <div className="text-[12px] italic mb-[14px]" style={{ color: '#52525B' }}>
        Can you do this right now without looking anything up?
      </div>

      <div className="space-y-2">
        {SCATS.map((cat, ci) => {
          const sc = state.skills.slice(ci * 3, ci * 3 + 3).filter(Boolean).length;
          return (
            <div key={cat} className="rounded-[10px] border overflow-hidden"
              style={{ background: 'var(--card)', borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <span className="text-[13px] font-semibold text-text">{cat}</span>
                <span className="font-mono text-[11px] font-bold" style={{ color: scoreColor(sc, 3) }}>{sc}/3</span>
              </div>
              {[0, 1, 2].map((j) => {
                const idx = ci * 3 + j;
                const on  = state.skills[idx] ?? false;
                return (
                  <div key={idx}
                    onClick={() => toggleSkill(idx)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-[10px] cursor-pointer min-h-[44px] select-none',
                      j < 2 && 'border-b',
                    )}
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <div className={cn(
                      'w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 transition-all',
                      on ? 'border-[var(--green)]' : 'border-[rgba(255,255,255,0.15)]',
                    )} style={on ? { background: 'var(--green)' } : {}}>
                      {on && <span className="text-[10px] font-bold text-black">✓</span>}
                    </div>
                    <span className={cn('text-[13px] transition-all', on && 'line-through text-text-sub')}>
                      {SKILLS[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Section C: Companies + Pipeline ─────────────────────────────────────────
// Company list reused from companies.ts (weights field ignored).
// Pipeline logic reused from PipelineTracker.tsx.

const PIPELINE_STATUSES: PipelineStatus[] = ['Target', 'Researching', 'Applying', 'OA Done', 'Interview', 'Offer', 'Rejected'];

const STATUS_COLOR: Record<PipelineStatus, string> = {
  'Target':      '#52525B',
  'Researching': 'var(--blue)',
  'Applying':    'var(--amber)',
  'OA Done':     'var(--purple)',
  'Interview':   'var(--purple)',
  'Offer':       'var(--green)',
  'Rejected':    'var(--red)',
};

function SectionC() {
  const { state }                      = useCareerStore();
  const { addPipeline, removePipeline } = useCareerActions();

  const [expandedCo, setExpandedCo] = useState<number>(-1);
  const [plCo,  setPlCo]  = useState('');
  const [plSt,  setPlSt]  = useState<PipelineStatus>('Target');

  function handleAdd() {
    if (!plCo.trim()) return;
    addPipeline(plCo.trim(), plSt, '');
    setPlCo('');
  }

  const inputCls = 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-[8px] px-3 py-[9px] text-text text-[13px] outline-none focus:border-[rgba(59,130,246,0.5)] placeholder:text-[#52525B]';

  return (
    <div>
      {/* Companies expandable list */}
      <div className="font-mono text-[10px] uppercase tracking-[.10em] mb-1 text-text-sub">COMPANIES</div>
      <div className="text-[12px] italic mb-[10px]" style={{ color: '#52525B' }}>Reference only. Not updated weekly.</div>

      <div className="rounded-[10px] border overflow-hidden mb-8"
        style={{ background: 'var(--card)', borderColor: 'rgba(255,255,255,0.07)' }}>
        {COMPANIES.map((co, i) => {
          const ex = expandedCo === i;
          const wc = co.window.toLowerCase().includes('aug') ? 'a' : 'b';
          return (
            <div key={co.name}>
              <div
                onClick={() => setExpandedCo(ex ? -1 : i)}
                className={cn('flex items-center justify-between px-[18px] py-[14px] cursor-pointer select-none min-h-[52px]', i < COMPANIES.length - 1 && 'border-b')}
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <span className="text-[13px] font-medium text-text">{co.name}</span>
                <div className="flex items-center gap-[10px]">
                  <span className="font-mono text-[10px] font-medium px-[7px] py-[2px] rounded-[5px] border"
                    style={wc === 'b'
                      ? { background: 'rgba(59,130,246,0.08)',  borderColor: 'rgba(59,130,246,0.20)',  color: 'var(--blue)'  }
                      : { background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.20)', color: 'var(--amber)' }}>
                    {co.window}
                  </span>
                  <span className="text-[11px] transition-transform duration-200" style={{
                    color: '#52525B',
                    display: 'inline-block',
                    transform: ex ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>▾</span>
                </div>
              </div>
              {ex && (
                <div className={cn('px-[18px] pb-[14px] text-[12px] leading-[1.7]', i < COMPANIES.length - 1 && 'border-b')}
                  style={{ borderColor: 'rgba(255,255,255,0.04)', color: '#A1A1AA' }}>
                  <div className="font-mono text-[10px] uppercase tracking-[.08em] mb-[3px]" style={{ color: '#52525B' }}>FORMAT</div>
                  <div className="mb-[10px]">{co.oa}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[.08em] mb-[3px]" style={{ color: '#52525B' }}>WHAT THEY TEST</div>
                  <div>{co.tests}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pipeline — reused from PipelineTracker */}
      <div className="font-mono text-[10px] uppercase tracking-[.10em] mb-[10px] text-text-sub">MY PIPELINE</div>

      <div className="flex gap-2 mb-[10px] flex-wrap">
        <input
          className={`${inputCls} flex-1 min-w-[120px]`}
          placeholder="Company name"
          value={plCo}
          onChange={(e) => setPlCo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <select
          className={`${inputCls} cursor-pointer`}
          value={plSt}
          onChange={(e) => setPlSt(e.target.value as PipelineStatus)}
        >
          {PIPELINE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={handleAdd}
          className="px-4 font-semibold text-[13px] min-h-[40px] rounded-[8px] border cursor-pointer whitespace-nowrap"
          style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.20)', color: 'var(--green)' }}>
          Add
        </button>
      </div>

      {state.pipeline.length === 0 ? (
        <p className="text-[13px] text-center py-5" style={{ color: '#52525B' }}>
          No applications yet. Window opens Aug–Nov.
        </p>
      ) : (
        <div className="rounded-[10px] border overflow-hidden"
          style={{ background: 'var(--card)', borderColor: 'rgba(255,255,255,0.07)' }}>
          {state.pipeline.map((p, i) => (
            <div key={p.id}
              className={cn('flex items-center justify-between px-[10px] py-[10px] text-[13px]', i < state.pipeline.length - 1 && 'border-b')}
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              <span className="font-medium text-text">{p.co}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-medium px-[7px] py-[2px] rounded-[5px] border"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)', color: STATUS_COLOR[p.status] }}>
                  {p.status}
                </span>
                <button onClick={() => removePipeline(p.id)}
                  className="text-[16px] leading-none cursor-pointer hover:text-[var(--red)] transition-colors"
                  style={{ background: 'none', border: 'none', color: '#52525B' }}>
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return <hr className="my-7 border-none border-t" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />;
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function Review() {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <SectionA />
        <SectionB />
      </div>
      <Divider />
      <SectionC />
    </div>
  );
}
