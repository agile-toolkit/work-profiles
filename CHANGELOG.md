# Changelog

All notable changes to this project are documented here. See `.artefacts/BRIEF.md` for the detailed run-by-run build history that preceded this file.

## Unreleased

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
