# Work Profiles — Brief

## Overview

Skills and capacity profiles, skill matrix, and project credits. React 18, Vite, Tailwind, react-i18next. Deploy: GitHub Pages.

## Features

- [x] Profiles directory — add/edit/delete, Dreyfus copy (`ProfilesView.tsx`, `ProfileCard.tsx`)
- [x] Profile form — skills, capacity, work types via dynamic keys where wired
- [x] Skill matrix and credits flows (`SkillMatrix.tsx`, `CreditsView.tsx`)
- [x] Wire orphan i18n keys — `profiles.title`, `profiles.work_types`, `matrix.all_skills`, `credits.total_points`, `credits.delete` all wired; `profiles.directory_heading` removed
- [x] ES + BE locale files — full Spanish and Belarusian translations added; language switcher upgraded to 4-language `<select>` (EN/ES/BE/RU)

## Backlog
<!-- Issues awaiting human review; agent appends here during research runs -->
- [ ] [#3] Integration: link Work Profiles capacity data to Planning Poker and Sprint Metrics
- [ ] [#4] Feature: profile search and skill gap analysis (changes-requested — pending revision)
- [ ] [#5] Feature: export team directory as CSV and printable HTML (changes-requested — pending revision)
- [ ] [#6] UX: role-based starter templates to reduce blank-page friction
- [ ] [#7] Technical: PWA support for offline use and device installation

## Tech notes

- `` t(`profile_form.proficiency.${n}`) `` / work_types patterns — confirm before deleting nested keys.

## Agent Log

### 2026-04-28 — feat: ES + BE locale files and 4-language switcher
- Done: added `src/i18n/es.json` (Spanish) and `src/i18n/be.json` (Belarusian) with full translations of all keys; registered both locales in `src/i18n/index.ts`; replaced binary EN/RU toggle in `App.tsx` with a `<select>` dropdown covering all four languages (EN/ES/BE/RU); closed issue #2
- Remaining approved issues: #3 (Planning Poker/Sprint Metrics integration), #6 (role templates), #7 (PWA); changes-requested: #4, #5
- Next task: implement Integration — link Work Profiles capacity data to Planning Poker and Sprint Metrics (issue #3)

### 2026-04-26 — research: export, role templates, PWA
- Done: checked issues #2–#4 (all still needs-review, no human feedback yet); created issues #5 (CSV/HTML export), #6 (role starter templates), #7 (PWA offline support)
- Waiting for human review on all six open issues
- Next task: check needs-review issues for human feedback (#2 ES/BE locales, #3 suite integration, #4 skill search+gap analysis, #5 export, #6 role templates, #7 PWA)

### 2026-04-23 — research: locale gaps, suite integration, skill search
- Done: created issues #2 (ES/BE locales missing), #3 (integration with Planning Poker + Sprint Metrics via shared localStorage), #4 (skill-based profile filter + gap analysis)
- Waiting for human review on all three
- Next task: check needs-review issues for human feedback

### 2026-04-20 — feat: wire orphan i18n keys
- Done: `profiles.title` replaces `directory_heading` as section H2; `profiles.work_types` wired as work-type badge label in profile cards; `matrix.all_skills` wired as filter-clear button in SkillMatrix; `credits.total_points` replaces hardcoded "pts" in leaderboard; `credits.delete` wired as `aria-label` on credit delete button; `profiles.directory_heading` removed from locales
- All BRIEF features now implemented
- Next task: check needs-review issues for human feedback; run research cycle for market/integration/UX improvements

### 2026-04-19 — docs: BRIEF template (AGENT_AUTONOMOUS)

- Done: Template migration; listed unverified locale keys.
- Next task: Grep `profiles.title`, `profiles.work_types`, `matrix.all_skills`, `credits.total_points`, `credits.delete`; delete from locales or wire in `ProfilesView` / `SkillMatrix` / `CreditsView`.
