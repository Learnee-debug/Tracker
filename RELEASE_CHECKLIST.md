# Release Checklist — v2.0.0

## Gate: branch `career-os-final-migration` → `master`

All items must be checked before merge.

---

### Code Quality

- [x] `npx tsc --noEmit` — TypeScript clean (zero errors)
- [x] `npx vitest run` — 37/37 tests pass
- [x] `npx vite build` — production build clean (zero warnings)
- [x] Dead code scan: no unused imports in active files
- [x] No `console.log` left in production code
- [x] No `// TODO` comments referencing unfinished features

---

### Architecture Conformance

- [x] Exactly 3 tabs: NOW / BUILD / REVIEW (no others)
- [x] No 4th screen added
- [x] No scoring system (0–100 weekly score removed)
- [x] No gamification elements (points, streaks count hidden, levels removed)
- [x] No AI features
- [x] No risk matrix
- [x] No calendar beyond 7-dot streak row
- [x] No tier readiness bars
- [x] Header shows: wordmark + Day N/60 + sync + user only
- [x] Max-width 640px centered layout
- [x] Both fonts loaded: JetBrains Mono (identifiers) + Inter (prose)

---

### Data Integrity

- [x] `LOAD_STATE` migrates legacy `hx` → `taskIdx` on first load
- [x] `state.cal` preserved (streak history intact for existing users)
- [x] `RESET_NN_IF_NEW_DAY` persists previous day's NN state to cal on rollover
- [x] `DEFAULT_STATE` has all required fields with correct types

---

### Documentation

- [x] `ARCHITECTURE_LOCK.md` updated: version 2.0.0, corrected task count (53 tasks / 7 sections), undo toast noted as pending
- [x] `CHANGELOG.md` created with full migration record
- [x] `RELEASE_CHECKLIST.md` created (this file)

---

### Deployment (post-merge)

- [ ] Merge `career-os-final-migration` → `master`
- [ ] Push `master` to origin
- [ ] Vercel deployment triggered automatically
- [ ] Verify production URL loads without blank screen
- [ ] Verify NOW tab opens by default
- [ ] Verify NNs toggle and persist across page refresh
- [ ] Verify +1 on DSA Owned increments and syncs
- [ ] Verify BUILD task advances on Mark Complete
- [ ] Verify REVIEW retro saves to history
- [ ] Verify Day N/60 shows correct sprint day
- [ ] Verify 7-dot streak row renders (may show all 'miss' for new users — expected)

---

### Known Technical Debt (permitted in maintenance mode)

| Item | Priority | Notes |
|------|----------|-------|
| Undo toast for +1 mis-taps | Medium | Mentioned in ARCHITECTURE_LOCK §8. Broke during migration (useMemo pattern invalid). Needs useRef + setTimeout approach. |
| `state.hx` legacy field | Low | Still in CareerState for graceful deserialization. Not written to. Can be removed once hx migration is proven stable in production (≥4 weeks). |
| Error boundaries | Low | No React error boundaries. A runtime error in one screen crashes the whole app. |
| Sync failure UX | Low | `syncStatus === 'error'` shows `!` in header but no retry or user messaging. |
