# Changelog

All notable changes to this project are documented here. See `.artefacts/BRIEF.md` for the detailed run-by-run build history that preceded this file.

## Unreleased

## 0.2.4 — Receive Moving Motivators' motivator snapshot (2026-09-03)

- **fix (broken integration)**: Moving Motivators has sent a top-3-motivators
  snapshot to Work Profiles since it shipped, both as a `?motivators=` URL
  param and a `work-profiles:motivatorSnapshot` localStorage write — nothing
  here ever read either. Tracked in [#57](https://github.com/agile-toolkit/work-profiles/issues/57)
  (needs-review, stale since 2026-07-04) and found independently by a
  suite-wide cross-app link audit. Added `src/utils/motivatorHandoff.ts`
  (tested) and a dismissible banner in `ProfilesView.tsx` offering to open
  the Add Profile form pre-filled with the top 3 motivators in `interests`.
  Simpler than #57's original proposal (no "which person is this?" picker
  or persistent per-profile field) — see the issue comment for what's still
  open if the fuller design is wanted.

## 0.2.3 — Fix LanguagePicker dark mode (2026-09-02)

- **fix**: `LanguagePicker.tsx` had zero `dark:` classes — the
  design-system's canonical copy never got dark-mode classes, and this
  app's copy inherited the gap. Synced with the now-fixed design-system
  source.

## 0.2.2 — Soften the credit leaderboard; guard localStorage writes (2026-09-02)

- **fix (scope)**: `GOAL.md` explicitly says this app is "not an
  evaluation or ranking tool" and "no instrument for tracking
  individuals," but Project Credits shipped a numbered, sorted leaderboard
  contradicting that. Removed the `1/2/3...` rank badge from
  `CreditsView.tsx` so it reads as a contribution-totals summary rather
  than a competitive ranking, and renamed the "Leaderboard" toggle/copy to
  "Contribution Totals" across all 4 locales (it was already opt-in and
  hidden by default — the framing was the problem, not the visibility
  default).
- **fix**: guarded the 3 unguarded `localStorage.setItem` call sites
  (`App.tsx`'s `save()`, and `publish.ts`'s `publishLastSession`/
  `publishSprintCapacity`/`publishExport`) with try/catch, so a full or
  unavailable storage quota (e.g. private browsing) degrades to in-memory
  state instead of throwing uncaught and silently breaking the
  Planning-Poker/Sprint-Metrics/Scrum-Facilitator publish path. Closes
  [#58](https://github.com/agile-toolkit/work-profiles/issues/58).
- **fix**: two icon-only delete buttons (`CreditsView.tsx`,
  `ProfilesView.tsx`) used `text-gray-200`/`gray-300` — well below WCAG AA
  contrast, nearly invisible until hover. Bumped to `gray-400`/`gray-500`
  and added a missing `aria-label` on `ProfilesView.tsx`'s skill-remove
  button.
- **chore**: deleted `src/components/ProfileForm.tsx` — a second,
  unused profile-editing component with no imports anywhere in the repo.
- Found via a suite-wide UX/scope audit.

## 0.2.1 — Remove Management 3.0 references; test coverage (2026-09-02)

- **content**: removed "Management 3.0" text from the Learn page intro,
  `index.html`'s meta description, and `README.md` across all 4 locales
  — reworded to reference Work Profiles/Project Credits directly.
- **refactor**: extracted `publishExport`/`publishLastSession`/
  `publishSprintCapacity` out of `App.tsx` into `src/publish.ts` so
  they're testable without pulling in the PWA-registration component
  tree.
- **test**: added `vitest` + `jsdom` (this repo's first automated test
  coverage — partial E1/#54). `src/publish.test.ts` covers all three
  publish functions, including the OOO-date boundary and timezone
  deduplication. `npm test` now passes cleanly: 1 file, 7 tests.
- **fix**: `brand-200`/`brand-300`/`brand-800`/`brand-900` were
  referenced but never defined in `tailwind.config.js` — invisible
  borders/backgrounds/text in both light and dark mode. Same class of
  bug found and fixed across several repos this session.

## 0.2.0 — E2 (partial): Scrum Facilitator sprint-capacity integration (2026-09-02)

- **feat**: publish a `wp-sprint-capacity` localStorage key alongside the
  existing `wp-profiles-export`/`work-profiles:lastSession` keys, recomputed
  on every profile mutation and at startup. Gives Scrum Facilitator a
  sprint-focused view: total capacity of *available* (non-archived,
  non-OOO) members, member/available/OOO counts, OOO member names, and the
  deduplicated set of active timezones. A profile is OOO when `oooUntil` is
  set and is today or later.
- **docs**: refresh `GOAL.md` from the suite-wide `GOALS.md` platform
  thesis and rebuild `ROADMAP.md` around it; document the new key in
  `README.md`.
- Docs-only: added `.artefacts/GOAL.md` and `.artefacts/ROADMAP.md`, expanded `README.md` with dev commands, localStorage key contracts, and tech notes, and added this changelog. No behavior change — documents existing functionality that previously only lived in `.artefacts/BRIEF.md`.
- docs: move GOAL.md and ROADMAP.md from .artefacts/ to the repo root.
