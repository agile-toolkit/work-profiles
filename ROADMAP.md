# Work Profiles — Roadmap

Derived from GOAL.md. Rebuilt when GOAL changes or an epic ships.

## Current epic
None — idle. See `## Next epics` below.

## Next epics
1. **E1 remainder: Automated test suite** — serves #1. `publishExport`/`publishLastSession`/`publishSprintCapacity` payload-shape coverage now shipped (see Recently shipped) — still open: CSV parse/merge, skill-history delta sign, and endorsement eligibility, wired into the deploy workflow so regressions in core data flows are caught before Pages deploy. [#54](https://github.com/agile-toolkit/work-profiles/issues/54) (needs-review, stale since 2026-07-02).
2. **E2 remainder: More sibling-app integrations** — serves #4. Kanban Designer active-card-count badge on profile cards ([#55](https://github.com/agile-toolkit/work-profiles/issues/55), needs-review, stale). [#57](https://github.com/agile-toolkit/work-profiles/issues/57)'s core gap (Moving Motivators' snapshot key was written but never read) shipped 2026-09-03 as a simpler "new profile with these motivators" banner — the issue stays open for its fuller attach-to-existing-profile design, if still wanted.
3. **E3: Full data portability** — serves #1. Versioned JSON export/import of both `work-profiles-data` and `work-profiles-credits` with replace semantics, complementing the existing lossy CSV-only export. [#56](https://github.com/agile-toolkit/work-profiles/issues/56) (needs-review, stale since 2026-07-02).
4. **E4: Skill search & directory export** — serves #2. Profile search + skill gap analysis screen ([#4](https://github.com/agile-toolkit/work-profiles/issues/4)) and CSV/printable-HTML directory export ([#5](https://github.com/agile-toolkit/work-profiles/issues/5)) — both spec-revised and blocked on human `approved` label, not implementation-ready yet.
5. **E5: Credits trend view** — serves #3. Monthly-bucketed sparkline/bar view per person in CreditsView, complementing the existing all-time leaderboard total. [#59](https://github.com/agile-toolkit/work-profiles/issues/59) (needs-review, stale since 2026-07-04).

## Recently shipped
**Add glass effect to the header** (2026-09-04) — see `## Shipped`. `AppHeader.tsx`'s background changed to a translucent blur, matching the Dashboard's own nav — user-reported inconsistency.

**Facilitator Mode persists across suite apps** (2026-09-03) — see `## Shipped`. `useFacilitatorMode`'s storage key changed to the shared `agile-toolkit:facilitatorMode` so the mode survives switching to another suite app in the same tab, per direct user request.

**Replace decorative ✕/× emoji with SVG icons** (2026-09-03) — see `## Shipped`. Part of a suite-wide emoji→SVG sweep the user asked for.

**Facilitator Mode** (2026-09-03) — see `## Shipped`. A user asked for the presentation/projector mode already built for Team Identity to be adopted suite-wide; this is repo 7 of an 11-repo rollout, adopting the pattern now shared in `design-system/`.

**Receive Moving Motivators' motivator snapshot** (2026-09-03) — see `## Shipped`. [#57](https://github.com/agile-toolkit/work-profiles/issues/57)'s core gap: the snapshot key existed since Moving Motivators shipped its export button, unread here. A suite-wide cross-app link audit found it independently. Now surfaced as a dismissible "new profile with these motivators" banner.

**Fix LanguagePicker dark mode** (2026-09-02) — see `## Shipped`. The design-system's canonical `LanguagePicker.tsx` never got dark-mode classes; this app's copy inherited the gap. Synced with the now-fixed design-system source.

**Soften the credit leaderboard; guard localStorage writes** (2026-09-02) — see `## Shipped`. A suite-wide UX/scope audit flagged Project Credits' numbered leaderboard as contradicting `GOAL.md`'s own "not a ranking/individual-tracking tool" boundary; removed the rank badge and reframed it as "Contribution Totals." Also closed [#58](https://github.com/agile-toolkit/work-profiles/issues/58) (unguarded localStorage writes), fixed two low-contrast delete icons, and removed the unused `ProfileForm.tsx`.

**Remove Management 3.0 references; E1 (partial): publish-function tests** (2026-09-02) — see `## Shipped`. Extracted `publishExport`/`publishLastSession`/`publishSprintCapacity` out of `App.tsx` into `src/publish.ts` so they're testable without pulling in the PWA-registration component tree, and added `publish.test.ts` (7 tests). CSV parse/merge and skill-history/endorsement coverage remain open as the rest of E1.

**E2 (partial): Scrum Facilitator sprint-capacity integration** (2026-09-02) — see `## Shipped`. [#50](https://github.com/agile-toolkit/work-profiles/issues/50) shipped; #55/#57 remain queued above as the rest of E2.

## Polish backlog
- No open polish items.

## Shipped
- ~~Add glass/backdrop-blur effect to the header, matching the Dashboard's own nav~~
- ~~Unify Facilitator Mode's storage key to the shared `agile-toolkit:facilitatorMode` so it persists across suite apps~~
- ~~Replace decorative ✕/× text-glyph buttons with shared SVG icons~~
- ~~Facilitator Mode — bigger UI + hidden nav/language picker for in-room presentation, adopted from the shared design-system pattern~~
- ~~Receive Moving Motivators' `?motivators=`/`work-profiles:motivatorSnapshot` handoff as a dismissible "new profile with these motivators" banner~~
- ~~Profile directory (create/edit/archive) with Dreyfus proficiency skills, capacity, work types~~
- ~~Skill Matrix and Team Overview tab (role/capacity charts, skill-category radar, mentoring pairs)~~
- ~~Project credits leaderboard~~
- ~~4-language i18n (EN/ES/BE/RU) and light/dark theme~~
- ~~PWA offline support~~
- ~~CSV bulk import, role-based starter templates, onboarding empty state~~
- ~~Profile comparison view, skill progression history, availability windows & timezone~~
- ~~Peer skill endorsement, skill category tagging, skill learning targets~~
- ~~Print-optimized profile card, keyboard accessibility (ARIA) audit~~
- ~~Skill name autocomplete from team vocabulary~~
- ~~`wp-profiles-export` and `work-profiles:lastSession` localStorage contracts for Planning Poker, Sprint Metrics, and Dashboard~~
- ~~Improvement Board integration (open items shown on profile cards)~~

**v0.2.0 — [E2 (partial): Scrum Facilitator sprint-capacity integration](https://github.com/agile-toolkit/work-profiles/issues/50)** (2026-09-02):
- ~~`wp-sprint-capacity` localStorage contract — total capacity, member/OOO counts, OOO member names, and active timezones, recomputed on every profile mutation~~

**v0.2.1 — Remove Management 3.0 references; E1 (partial): publish-function tests** (2026-09-02):
- ~~Removed "Management 3.0" text from the Learn intro, meta description,
  and README~~
- ~~Extracted the three `publish*()` functions into `src/publish.ts`;
  added `vitest` + `jsdom` and 7 tests~~
- ~~Fixed invisible `brand-200`/`300`/`800`/`900` borders/backgrounds/text
  (undefined in `tailwind.config.js`)~~

**v0.2.2 — Soften the credit leaderboard; guard localStorage writes** (2026-09-02):
- ~~Removed the numbered rank badge from Project Credits' totals view and
  reframed "Leaderboard" as "Contribution Totals" across all 4 locales~~
- ~~Guarded the 3 unguarded `localStorage.setItem` call sites with
  try/catch (#58)~~
- ~~Fixed two low-contrast delete icons; added a missing aria-label~~
- ~~Removed the unused `ProfileForm.tsx`~~

**v0.2.3 — Fix LanguagePicker dark mode** (2026-09-02):
- ~~Synced `LanguagePicker.tsx` with the design-system's now-fixed
  canonical copy — full `dark:` coverage~~
