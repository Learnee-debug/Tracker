# Changelog

All notable changes to Career OS are documented here.

---

## [2.0.0] — 2026-06-08 — 3-Screen Architecture Migration

### Summary
Complete migration from an 8-tab layout to a locked 3-screen architecture (NOW / BUILD / REVIEW).
All deprecated features removed. Architecture locked. Maintenance mode begins.

### Added
- `client/src/features/now/Now.tsx` — Screen 1: daily driver with alert banner, non-negotiables, today's focus, 4 metric tiles, 7-day streak row
- `client/src/features/build/Build.tsx` — Screen 2: single next-task card, done-when accordion, mark-complete flow, progress footer
- `client/src/features/review/Review.tsx` — Screen 3: 4-question weekly retro + history, 15-item skill check, company list + pipeline tracker
- `engine.ts`: `hxToTaskIdx()` — migration function from legacy hx map to linear taskIdx
- `engine.ts`: `get7Days()` — 7-dot streak computation reading from `state.cal`
- `engine.ts`: `pace()` — pace label for metric tiles (on pace / X behind)
- `careerStore.tsx`: `INC_METRIC`, `DEC_METRIC`, `COMPLETE_TASK`, `TOGGLE_SKILL`, `SAVE_REVIEW`, `SET_FOCUS_DSA` action types
- `careerStore.tsx`: `RESET_NN_IF_NEW_DAY` now persists previous day's NN state to `state.cal` on rollover
- `hxDefs.ts`: `doneWhen` acceptance criteria text on all 53 tasks
- `shared/types.ts` + `client/src/types/index.ts`: `taskIdx`, `focusDSA`, `skills[]` fields on `CareerState`; extended `WeeklyEntry` with `dsa`, `constraint` fields

### Changed
- `Tabs.tsx` — reduced from 8 tabs to 3 (NOW / BUILD / REVIEW), each with per-tab active color
- `App.tsx` — max-width 640px centered layout, tab default `'now'` (was `'today'`)
- `Header.tsx` — removed risk badge; now shows wordmark + Day N/60 + sync + user only
- `index.css` — design tokens updated to match career-os.html reference: Zinc-950 palette, `--card: #111115`, colors updated (green → #22C55E, amber → #F59E0B, red → #EF4444), fonts updated to JetBrains Mono + Inter

### Removed
- **Legacy feature files** (8 deleted): `calendar/`, `hireonyx/`, `matrix/`, `risk/`, `score/`, `today/`, `verify/`, `weekly/`
- **Deprecated engine functions** (10 removed): `getVerifiedScore`, `buildVerifyScores`, `calcTierReady`, `calcCompanyReadiness`, `getActiveCriticalRisks`, `genMission`, `calcWeeklyScore`, `getNextHxTask`, `calcHxSectionPct`, `calcHxOverallPct`
- **Deprecated engine constants**: `RISK_LEVELS`, `RISK_RECOVERY`, `CRITICAL_RISK_IDS`
- **Deprecated types**: `RiskId`, `RiskLevel`, `WeeklyReviewInputs`, `TierId`, `TierResult`, `Mission`
- **Deprecated state fields**: `risks`, `verify` removed from `CareerState`
- **Deprecated store actions**: `TOGGLE_RISK`, `TOGGLE_VERIFY`, `TOGGLE_HX`, `CYCLE_CAL_DAY`, `UPDATE_SCORE`, `SAVE_WEEKLY`
- **Deprecated tests** (50 removed): tests for all deleted engine functions

### Migration notes (user data)
- Existing `hx` records are auto-migrated to `taskIdx` via `hxToTaskIdx()` on first `LOAD_STATE`
- Existing `risks` and `verify` data in server state is silently dropped on load (spread ignored)
- `state.cal` is preserved and read by `get7Days()` for streak history
- `state.hx` is preserved in state (not written to, but retained for graceful deserialization of old data)

### Stats
| Metric | Value |
|--------|-------|
| Files added | 3 new screens + 1 engine rewrite |
| Files removed | 10 legacy feature files |
| Files refactored | 7 (engine, store, types ×2, tabs, app, header, css) |
| Reuse achieved | ~75% (state, engine core, hxDefs, auth, api, hooks all reused) |
| Test count | 37 (was 87 — 50 deprecated tests removed) |
| Build size JS | 281 KB gzip 85.8 KB (−0.4 KB) |
| Build size CSS | 21.4 KB gzip 5.1 KB (−7 KB) |
| Production build | ✓ clean |
| TypeScript | ✓ clean |

---

## [1.x] — Pre-migration

8-tab layout: Today, HireOnyx, Calendar, Risk, Verify, Score, Matrix, Weekly.
See git history on `master` for individual changes.
