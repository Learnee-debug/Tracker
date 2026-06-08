# ARCHITECTURE_LOCK.md
# Career OS — Architecture Lock

**Status: LOCKED — Maintenance Mode Only**
**Locked: June 2026**
**Version: 1.0.0**

---

## Final Architecture

Career OS is a 3-screen personal productivity tool for a software engineering student.
Its sole purpose is to increase execution toward an internship and placement.

### Screen 1: NOW
**Opens on launch. Used daily. Ideal session: 60 seconds.**

Contains exactly:
1. Alert banner — conditional, fires when 0/3 non-negotiables are unchecked
2. Non-Negotiables — 3 fixed checkboxes, reset at midnight
3. Today's Focus — 2 rows: DSA (user-editable) + BUILD (auto-synced from current task)
4. Metric tiles — 4 tiles: DSA Owned, Commits, Mocks, HireOnyx %; each with +1 tap
5. Streak row — 7-day dot history + sprint day counter

### Screen 2: BUILD
**Opened for work sessions. 2–3× per week.**

Contains exactly:
1. PHASE / MILESTONE breadcrumb (inside the hero card)
2. NEXT TASK — single task name, large Inter text
3. Time estimate
4. DONE WHEN — collapsed by default, opens on first encounter per task
5. Mark Complete button — advances to the next task
6. Progress footer — HireOnyx %, last commit indicator

### Screen 3: REVIEW
**Sunday only. 15–20 minutes. Once per week.**

Contains exactly:
- Section A: 4-question weekly retrospective + history
- Section B: 15-item skill check (3 per category × 5 categories)
- Section C: 8-company reference list (expandable) + pipeline tracker

---

## Design Principles

1. **60-second daily sessions.** The app should be opened, read, and closed. It is not a workspace.

2. **One source of truth.** BUILD row in Today's Focus auto-syncs from BUILD screen. No manual entry for computed data.

3. **Execution over tracking.** Every element either triggers an action or records that an action happened. Passive information display is excluded.

4. **Mobile-first touch targets.** All interactive elements minimum 44px touch target. The +1 button is the most-used element in the product and must be reliably tappable.

5. **Two-font system, strict rule.**
   - JetBrains Mono: numbers, labels, identifiers, badges, navigation
   - Inter: body text, descriptions, form inputs, anything read as prose

6. **Premium but not decorative.** Visual reference: Linear, Vercel, Raycast. Rgba borders, subtle backgrounds, thin progress bars. Zero decoration that doesn't carry information.

7. **Honest metrics.** DSA Owned means re-solvable without hints. REVIEW exists to audit metric drift. Both must be used.

8. **Undo for every increment.** The +1 button will be mis-tapped. A 3-second undo toast is not optional.

---

## Metric Definitions

| Metric | Definition | Target |
|--------|-----------|--------|
| DSA Owned | Problems you can re-solve from scratch, right now, without hints | 130 by Day 60 |
| Commits | Any meaningful push to HireOnyx | 60 by Day 60 |
| Mocks | Timed, verbal, recorded sessions | 8 by Day 60 |
| HireOnyx % | Completed tasks / 31 total tasks × 100 | 100% = deployment |

Pace indicator formula: `expected = round((target / 60) × sprintDay)`
If actual ≥ expected: "on pace". If actual < expected: "X behind".

---

## Non-Negotiables — Fixed, Not Editable

These three habits are permanent. The labels and descriptions do not change.

| Label | Description |
|-------|-------------|
| DSA | Solve one problem out loud |
| COMMIT | Push working code |
| LOG | Record one thing you cannot yet re-solve |

The habit is the constant. The project (HireOnyx today, something else in 6 months) changes.
Non-negotiable descriptions are intentionally generic so they remain accurate over 2 years.

---

## HireOnyx Build Sequence

31 tasks across 5 phases, completed in strict order.
One task visible at a time. No skipping. No reordering.

| Phase | Tasks |
|-------|-------|
| DATABASE | 7 tasks |
| BACKEND | 8 tasks |
| INTEGRATION | 5 tasks |
| FRONTEND | 6 tasks |
| DEPLOYMENT | 4 tasks (incl. README) |

---

## Features Intentionally Excluded

The following must never be added. They were explicitly removed after multiple design cycles.

**Navigation and structure:**
- A 4th screen of any kind
- Sub-tabs within any screen
- A left sidebar or icon-based navigation
- Version numbers or system status indicators
- Overview/Analytics/Archive tabs on REVIEW

**Metrics and tracking:**
- A weekly or daily score (0–100 or any variant)
- Score gauge or performance rating
- DSA Solved as a separate metric from DSA Owned (they are the same thing; only ownership counts)
- Verbal Explanations as a separate metric
- LeetCode Contests tracking
- OSS PR tracking
- Internship application count (reintroduce only after Month 3, if ever)
- Tier B/C/D package readiness bars
- Company readiness percentages
- System Load or "Next Milestone" gamification

**Screens and features:**
- A calendar or habit grid beyond the 7-day streak row
- A Risk matrix or threat tracking tab
- A 60-day sprint calendar view
- A dedicated HireOnyx tab with full accordion checklist
- Push notifications or in-app alerts beyond the banner
- AI-generated suggestions or recommendations
- A Pomodoro or work timer
- Social features or comparisons
- Export or integration features
- "Project Visual Narrative" or any AI-generated decorative content
- Server status indicators (CORE_TEMP, UPTIME, NODE_SERVER_04, etc.)

---

## Rules for Future Development

**Permitted in maintenance mode:**
1. Bug fixes — broken interactions, incorrect calculations, display errors
2. Typo corrections in task definitions or company data
3. Usability improvements that remove friction without adding features
4. Performance improvements
5. Updating HireOnyx task definitions as the project evolves
6. Adding companies to the REVIEW reference list (max 12 total)
7. Adjusting metric targets if sprint length changes

**Requires explicit re-approval (not permitted by default):**
1. Any new screen
2. Any new metric
3. Any new section within an existing screen
4. Any change to the 3 non-negotiable habits
5. Any change to the BUILD task order or phase structure

**Never permitted without full architecture review:**
1. A 4th screen
2. A scoring system
3. A gamification layer
4. An AI features layer
5. A social layer

---

## The Calibration Loop

Career OS works because of the relationship between two screens:

- **NOW** records what you claim to have done (+1 on DSA Owned, etc.)
- **REVIEW** audits whether those claims are true (Skill Check)

If you tap DSA Owned 340 times but score 8/15 on the Skill Check, the gap is visible.
REVIEW is not a reflection tool. It is a calibration audit.

**This means: REVIEW is not optional. It cannot be simplified below its current form.
If REVIEW is skipped consistently, the entire metric system becomes dishonest.**

---

## What Will Eventually Annoy the User (Known Issues, Not Bugs)

1. **DSA Owned drift** — the metric will become loose over time as the habit of tapping +1 becomes automatic. REVIEW/Skill Check is the correction mechanism. No product fix exists.

2. **+1 mis-taps** — approximately 3–5 per week at sustained daily use. The undo toast mitigates this but does not eliminate it.

3. **TODAY'S FOCUS DSA staleness** — if not updated daily, the DSA row shows stale content. The visual indicator (text color shift) signals staleness. The user must form the habit of updating it.

4. **Non-negotiables reset behavior** — the app currently resets on page reload for demo purposes. In production, reset should occur at midnight of the user's local time, not on page load.

5. **Streak count persistence** — streak count and best streak are manually maintained in state. They do not auto-calculate from history on fresh load. This is a known simplification for the initial build.

---

*Career OS enters maintenance mode after this document is committed.*
*All design iteration is complete. The architecture is locked.*
*Future work is limited to what is explicitly permitted above.*
