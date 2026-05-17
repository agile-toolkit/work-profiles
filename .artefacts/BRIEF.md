# Work Profiles — Brief

## Overview

Skills and capacity profiles, skill matrix, and project credits. React 18, Vite, Tailwind, react-i18next. Deploy: GitHub Pages.

## Features

- [x] Profiles directory — add/edit/delete, Dreyfus copy (`ProfilesView.tsx`, `ProfileCard.tsx`)
- [x] Profile form — skills, capacity, work types via dynamic keys where wired
- [x] Skill matrix and credits flows (`SkillMatrix.tsx`, `CreditsView.tsx`)
- [x] Wire orphan i18n keys — `profiles.title`, `profiles.work_types`, `matrix.all_skills`, `credits.total_points`, `credits.delete` all wired; `profiles.directory_heading` removed
- [x] ES + BE locale files — full Spanish and Belarusian translations added; language switcher upgraded to 4-language `<select>` (EN/ES/BE/RU)
- [x] Integration export — writes `wp-profiles-export` localStorage key on every profile change and at startup; payload: `{teamCapacity, profiles:[{id,name,role,skills,capacity,workTypes}]}`; Planning Poker and Sprint Metrics can read this key directly (issue #3)
- [x] Role-based starter templates — 5 static role pills (Frontend Dev, Backend Dev, Scrum Master, Product Owner, QA Engineer) appear in the New Profile form; selecting one pre-fills role, skills (5 per template at appropriate Dreyfus levels), and preferred work types; only shown for new profiles (issue #6)

## Backlog
<!-- Issues awaiting human review; agent appends here during research runs -->
- [x] [#3] Integration: link Work Profiles capacity data to Planning Poker and Sprint Metrics — implemented via `wp-profiles-export` localStorage key
- [ ] [#4] Feature: profile search and skill gap analysis (ready — spec revised: dedicated Gap Analysis screen + both phases)
- [ ] [#5] Feature: export team directory as CSV and printable HTML (ready — spec revised: header button, CSV only, "Skill: Level – Label" format)
- [x] [#6] UX: role-based starter templates to reduce blank-page friction — implemented, In Review
- [x] [#7] Technical: PWA support for offline use and device installation — implemented, In Review
- [ ] [#12] Integration: work-profiles:lastSession localStorage key for Dashboard card (needs-review)
- [ ] [#13] Integration: Team Identity can auto-populate members from Work Profiles (needs-review)
- [ ] [#14] Feature: bulk import team profiles from CSV (needs-review)
- [ ] [#15] Integration: Change Planner — auto-populate stakeholders from Work Profiles (needs-review)
- [ ] [#16] UX: improve empty state and first-run onboarding for new teams (needs-review)
- [ ] [#17] Feature: profile archive (soft delete) to preserve history (needs-review)

## Tech notes

- `` t(`profile_form.proficiency.${n}`) `` / work_types patterns — confirm before deleting nested keys.
- `wp-profiles-export` localStorage contract: `{ teamCapacity: number, profiles: Array<{ id, name, role, skills: Skill[], capacity: number, workTypes: WorkType[] }> }`. Written by `publishExport()` in `App.tsx` on every `updateProfiles` call and at app startup. Planning Poker and Sprint Metrics read this key directly — do not rename it.

## Agent Log

### 2026-05-17 — research: Change Planner integration, onboarding UX, profile archive
- Done: checked all open issues — #4 and #5 (changes-requested, specs already revised to Ready in last run), #6 and #7 (approved, already implemented), #12/#13/#14 (needs-review, awaiting human); created #15 (Change Planner stakeholder auto-fill from wp-profiles-export), #16 (empty state + first-run onboarding with 3 action cards and step checklist), #17 (profile archive/soft-delete to preserve credits history); set all three to Backlog in project
- Waiting for human review on #12, #13, #14, #15, #16, #17; waiting for approval on #4 and #5
- Next task: check issues for human feedback; implement first approved item among #4 (skill filter in ProfilesView + Gap Analysis screen at /gap-analysis route), #5 (Export CSV button in ProfilesView header + Blob download, no library), #12 (work-profiles:lastSession key in App.tsx updateProfiles()), #14 (CSV import with FileReader + preview modal), #16 (empty state in ProfilesView when profiles.length === 0), #17 (archived field in WorkProfile type + Archive button in ProfileCard)

### 2026-05-15 — research: Dashboard key, Team Identity integration, bulk import
- Done: set issues #6 and #7 (approved, already implemented) to In Review in project; updated issue #4 spec (dedicated Gap Analysis screen, both Phase 1 filter + Phase 2 screen confirmed); updated issue #5 spec (header button, CSV only, "Skill: Level – Label" format); set #4 and #5 to Ready in project; created #12 (work-profiles:lastSession Dashboard key), #13 (Team Identity member auto-populate from wp-profiles-export), #14 (bulk CSV import companion to export)
- Waiting for human review on #12, #13, #14
- Next task: check issues for human feedback; implement first approved item among #4 (skill filter in ProfilesView + Gap Analysis screen with new /gap-analysis route), #5 (Export CSV + Print Directory buttons in ProfilesView header), #12 (lastSession key in App.tsx updateProfiles()), #13 (Team Identity integration — lives in team-identity repo), #14 (CSV import with preview modal)

### 2026-05-11 — feat: PWA support (issue #7)
- Done: installed `vite-plugin-pwa` v1.3.0; configured `vite.config.ts` with `registerType: autoUpdate`, workbox cache glob, manifest block (name, short_name, theme_color #ca8a04, 192×192 and 512×512 placeholder PNG icons); created `src/components/UpdateToast.tsx` using `useRegisterSW` hook showing "Update available / Reload" toast; added `src/pwa.d.ts` triple-slash reference; added `UpdateToast` to `App.tsx`; created placeholder round amber PNG icons in `public/`; build generates `dist/sw.js` and workbox assets
- Remaining backlog: #4 (skill gap analysis, changes-requested), #5 (CSV/HTML export, changes-requested)
- Next task: check issues for human feedback

### 2026-05-08 — feat: role-based starter templates (issue #6)
- Done: added `ROLE_TEMPLATES` constant in `ProfileForm.tsx` with 5 agile roles (Frontend Dev, Backend Dev, Scrum Master, Product Owner, QA Engineer); each template pre-fills role name, 5 skills with Dreyfus-appropriate proficiency levels, and relevant work types; template picker renders as pills above the skills section for new profiles only; active pill highlights in brand colour; added `profile_form.template_label` i18n key to all 4 locale files; questions resolved — role names kept in English (industry standard), 5 roles selected as most common agile team roles, templates are static
- Remaining backlog: #5 (CSV/HTML export, changes-requested), #7 (PWA, approved)
- Next task: implement #7 (PWA support using vite-plugin-pwa: npm install -D vite-plugin-pwa, configure in vite.config.ts with registerType autoUpdate and manifest, add placeholder icons in public/; resolve open questions per UX best practices — add reload toast, use placeholder icons initially, pilot on work-profiles first)

### 2026-04-28 — feat: wp-profiles-export localStorage integration (issue #3)
- Done: added `publishExport()` in `App.tsx` that writes `wp-profiles-export` localStorage key with `{teamCapacity, profiles}` payload on every profile mutation and at app startup; Planning Poker and Sprint Metrics can now read this key without any backend; closed issue #3
- Remaining backlog: #4 (skill gap analysis, changes-requested), #5 (CSV/HTML export, changes-requested), #6 (role templates), #7 (PWA)
- Next task: check needs-review issues #4 and #5 for revised human feedback; implement Sprint Metrics side of wp-profiles-export integration (read teamCapacity from wp-profiles-export)

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
