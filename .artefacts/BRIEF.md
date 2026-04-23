# Work Profiles — Brief

## Overview

Skills and capacity profiles, skill matrix, and project credits. React 18, Vite, Tailwind, react-i18next. Deploy: GitHub Pages.

## Features

- [x] Profiles directory — add/edit/delete, Dreyfus copy (`ProfilesView.tsx`, `ProfileCard.tsx`)
- [x] Profile form — skills, capacity, work types via dynamic keys where wired
- [x] Skill matrix and credits flows (`SkillMatrix.tsx`, `CreditsView.tsx`)
- [x] Wire orphan i18n keys — `profiles.title`, `profiles.work_types`, `matrix.all_skills`, `credits.total_points`, `credits.delete` all wired; `profiles.directory_heading` removed

## Backlog
<!-- Issues awaiting human review; agent appends here during research runs -->
- [ ] [#2] Feature: complete ES and BE locale files (language switcher only covers EN/RU)
- [ ] [#3] Integration: link Work Profiles capacity data to Planning Poker and Sprint Metrics
- [ ] [#4] Feature: profile search and skill gap analysis

## Tech notes

- `` t(`profile_form.proficiency.${n}`) `` / work_types patterns — confirm before deleting nested keys.

## Agent Log

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
