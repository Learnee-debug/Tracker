// ─────────────────────────────────────────────────────────────────────────────
// Career OS — global state store
//
// Architecture: useReducer + Context (Option B from design spec).
//   - State lives in memory after login.
//   - Every dispatch is instant (no waiting for network).
//   - A separate sync hook watches state changes and persists to the server.
//   - If the server is unreachable, the user doesn't notice — they keep working.
//
// Why not Zustand: this codebase is simple enough that the React primitives
// are the right tool. Adding Zustand would be an extra dependency without
// meaningful benefit at this scale.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { CareerState, RiskId, PipelineEntry, PipelineStatus } from '@/types';
import type { SkillKey } from '@/data/challenges';
import { generateId } from '@/lib/utils';

// ─── Default state ────────────────────────────────────────────────────────────

export const DEFAULT_STATE: CareerState = {
  score:          { solved: 0, owned: 0, verbal: 0, commits: 0, mocks: 0, lc: 0, apps: 0, oss: 0 },
  nn:             { d1: false, d2: false, d3: false },
  nnDate:         '',
  risks:          {},
  verify:         {},
  hx:             {},
  cal:            {},
  sprintStart:    '',
  weeklyHistory:  [],
  pipeline:       [],
  coNotes:        {},
};

// ─── Action types ─────────────────────────────────────────────────────────────

export type Action =
  | { type: 'LOAD_STATE';        payload: CareerState }
  | { type: 'SET_SPRINT_START';  payload: string }
  | { type: 'TOGGLE_NN';        payload: 1 | 2 | 3 }
  | { type: 'RESET_NN_IF_NEW_DAY' }
  | { type: 'TOGGLE_RISK';       payload: RiskId }
  | { type: 'TOGGLE_VERIFY';     payload: { key: SkillKey; index: number } }
  | { type: 'TOGGLE_HX';         payload: string }
  | { type: 'CYCLE_CAL_DAY';     payload: number }
  | { type: 'UPDATE_SCORE';      payload: { key: keyof CareerState['score']; delta: number } }
  | { type: 'ADD_PIPELINE';      payload: { co: string; status: PipelineStatus; notes: string } }
  | { type: 'REMOVE_PIPELINE';   payload: string }
  | { type: 'SAVE_CO_NOTE';      payload: { name: string; note: string } }
  | { type: 'SAVE_WEEKLY';       payload: { score: number; avoid: string; change: string } };

// ─── Reducer ──────────────────────────────────────────────────────────────────

const CAL_CYCLE = ['', 'good', 'partial', 'miss'] as const;

function reducer(state: CareerState, action: Action): CareerState {
  switch (action.type) {

    case 'LOAD_STATE':
      return action.payload;

    case 'SET_SPRINT_START':
      return { ...state, sprintStart: action.payload };

    case 'TOGGLE_NN': {
      const key = `d${action.payload}` as 'd1' | 'd2' | 'd3';
      return { ...state, nn: { ...state.nn, [key]: !state.nn[key] } };
    }

    case 'RESET_NN_IF_NEW_DAY': {
      const todayStr = new Date().toDateString();
      if (state.nnDate === todayStr) return state;
      return {
        ...state,
        nn:     { d1: false, d2: false, d3: false },
        nnDate: todayStr,
      };
    }

    case 'TOGGLE_RISK':
      return {
        ...state,
        risks: { ...state.risks, [action.payload]: !state.risks[action.payload] },
      };

    case 'TOGGLE_VERIFY': {
      const k = `${action.payload.key}_${action.payload.index}`;
      return {
        ...state,
        verify: { ...state.verify, [k]: !state.verify[k] },
      };
    }

    case 'TOGGLE_HX':
      return {
        ...state,
        hx: { ...state.hx, [action.payload]: !state.hx[action.payload] },
      };

    case 'CYCLE_CAL_DAY': {
      const key = `d${action.payload}`;
      const current = state.cal[key] ?? '';
      const nextIndex = (CAL_CYCLE.indexOf(current as typeof CAL_CYCLE[number]) + 1) % CAL_CYCLE.length;
      return { ...state, cal: { ...state.cal, [key]: CAL_CYCLE[nextIndex] } };
    }

    case 'UPDATE_SCORE': {
      const { key, delta } = action.payload;
      const current = state.score[key] ?? 0;
      return {
        ...state,
        score: { ...state.score, [key]: Math.max(0, current + delta) },
      };
    }

    case 'ADD_PIPELINE': {
      const entry: PipelineEntry = {
        id:     generateId(),
        co:     action.payload.co.trim(),
        status: action.payload.status,
        notes:  action.payload.notes.trim(),
        date:   new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      };
      return { ...state, pipeline: [entry, ...state.pipeline] };
    }

    case 'REMOVE_PIPELINE':
      return {
        ...state,
        pipeline: state.pipeline.filter((e) => e.id !== action.payload),
      };

    case 'SAVE_CO_NOTE':
      return {
        ...state,
        coNotes: { ...state.coNotes, [action.payload.name]: action.payload.note },
      };

    case 'SAVE_WEEKLY': {
      const entry = {
        id:     generateId(),
        date:   new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        score:  action.payload.score,
        avoid:  action.payload.avoid,
        change: action.payload.change,
      };
      const history = [entry, ...state.weeklyHistory].slice(0, 8);
      return { ...state, weeklyHistory: history };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface CareerStoreContext {
  state: CareerState;
  dispatch: React.Dispatch<Action>;
}

const Context = createContext<CareerStoreContext | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ProviderProps {
  children: React.ReactNode;
  initialState?: CareerState;
}

export function CareerStoreProvider({ children, initialState }: ProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState ?? DEFAULT_STATE);

  return (
    <Context.Provider value={{ state, dispatch }}>
      {children}
    </Context.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCareerStore(): CareerStoreContext {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useCareerStore must be used inside CareerStoreProvider');
  return ctx;
}

// ─── Convenience action creators ─────────────────────────────────────────────
// Keep dispatch calls readable at the call site without string literals.

export function useCareerActions() {
  const { dispatch } = useCareerStore();

  return {
    loadState:       useCallback((s: CareerState) => dispatch({ type: 'LOAD_STATE', payload: s }), [dispatch]),
    setSprintStart:  useCallback((v: string)      => dispatch({ type: 'SET_SPRINT_START', payload: v }), [dispatch]),
    toggleNN:        useCallback((n: 1 | 2 | 3)   => dispatch({ type: 'TOGGLE_NN', payload: n }), [dispatch]),
    resetNNIfNewDay: useCallback(()                => dispatch({ type: 'RESET_NN_IF_NEW_DAY' }), [dispatch]),
    toggleRisk:      useCallback((id: RiskId)      => dispatch({ type: 'TOGGLE_RISK', payload: id }), [dispatch]),
    toggleVerify:    useCallback((key: SkillKey, index: number) => dispatch({ type: 'TOGGLE_VERIFY', payload: { key, index } }), [dispatch]),
    toggleHx:        useCallback((id: string)      => dispatch({ type: 'TOGGLE_HX', payload: id }), [dispatch]),
    cycleCalDay:     useCallback((day: number)     => dispatch({ type: 'CYCLE_CAL_DAY', payload: day }), [dispatch]),
    updateScore:     useCallback((key: keyof CareerState['score'], delta: number) => dispatch({ type: 'UPDATE_SCORE', payload: { key, delta } }), [dispatch]),
    addPipeline:     useCallback((co: string, status: PipelineStatus, notes: string) => dispatch({ type: 'ADD_PIPELINE', payload: { co, status, notes } }), [dispatch]),
    removePipeline:  useCallback((id: string)      => dispatch({ type: 'REMOVE_PIPELINE', payload: id }), [dispatch]),
    saveCoNote:      useCallback((name: string, note: string) => dispatch({ type: 'SAVE_CO_NOTE', payload: { name, note } }), [dispatch]),
    saveWeekly:      useCallback((score: number, avoid: string, change: string) => dispatch({ type: 'SAVE_WEEKLY', payload: { score, avoid, change } }), [dispatch]),
  };
}
