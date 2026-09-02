# Changelog

All notable changes to this project are documented here. See `.artefacts/BRIEF.md` for the detailed run-by-run build history that preceded this file.

## Unreleased

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
