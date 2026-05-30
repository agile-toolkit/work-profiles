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
- [x] Dashboard lastSession key — writes `work-profiles:lastSession` on every profile change and at startup; payload: `{profileCount, avgCapacity, topSkills[5], lastUpdated}`; Dashboard reads this to surface "N members · X% avg capacity · Top skills: …" (issue #12)
- [x] CSV bulk import — "Import CSV" button in ProfilesView header + hidden file input + FileReader parser; supports columns Name, Role, Capacity, Work Types (semicolon-separated), Skills (semicolon-separated "Skill: Level – Label" pairs); preview modal shows total count, new vs update breakdown per row; merge-by-name: same name = update existing, new name = append; onboarding Import card now clickable; i18n in all 4 locales (issue #14)
- [x] Profile archive (soft delete) — `archived?: boolean` field on `WorkProfile`; Archive button replaces Delete for active profiles; archived profiles hidden by default with "Show archived (N)" toggle in header; archived cards greyed with "Archived" badge + Restore / Delete permanently actions; CreditsView shows archived names greyed/strikethrough in list + leaderboard, excludes archived from "Person" dropdown; Skill Matrix and published exports (wp-profiles-export, lastSession) use active-only profiles; i18n in all 4 locales (issue #17)
- [x] AppHeader unification — copied `AppHeader.tsx` + `LanguagePicker.tsx` from design system into `src/components/`; replaced inline `<header>` block in `App.tsx` with `<AppHeader title navItems onTitleClick><LanguagePicker /></AppHeader>`; white sticky header, nav pills, accessible dropdown language picker (issue #18)

## Backlog
<!-- Issues awaiting human review; agent appends here during research runs -->
- [x] [#3] Integration: link Work Profiles capacity data to Planning Poker and Sprint Metrics — implemented via `wp-profiles-export` localStorage key
- [ ] [#4] Feature: profile search and skill gap analysis (ready — spec revised: dedicated Gap Analysis screen + both phases)
- [ ] [#5] Feature: export team directory as CSV and printable HTML (ready — spec revised: header button, CSV only, "Skill: Level – Label" format)
- [x] [#6] UX: role-based starter templates to reduce blank-page friction — implemented, In Review
- [x] [#7] Technical: PWA support for offline use and device installation — implemented, In Review
- [x] [#12] Integration: work-profiles:lastSession localStorage key for Dashboard card — implemented
- [ ] [#13] Integration: Team Identity can auto-populate members from Work Profiles (needs-review)
- [x] [#14] Feature: bulk import team profiles from CSV — implemented
- [ ] [#15] Integration: Change Planner — auto-populate stakeholders from Work Profiles (needs-review)
- [x] [#16] UX: improve empty state and first-run onboarding for new teams — implemented
- [x] [#17] Feature: profile archive (soft delete) to preserve history — implemented, In Review
- [x] [#18] Unify header: AppHeader component + LanguagePicker — implemented, In Review

## localStorage keys

| Key | Written by | Schema |
|-----|-----------|--------|
| `work-profiles-data` | `App.tsx` `save()` | `WorkProfile[]` — full profile array |
| `work-profiles-credits` | `App.tsx` `save()` | `ProjectCredit[]` — credit log |
| `wp-profiles-export` | `App.tsx` `publishExport()` | `{teamCapacity: number, profiles: [{id, name, role, skills, capacity, workTypes}]}` — read by Planning Poker and Sprint Metrics |
| `work-profiles:lastSession` | `App.tsx` `publishLastSession()` | `{profileCount: number, avgCapacity: number, topSkills: string[], lastUpdated: string}` — read by Dashboard |

## Tech notes

- `` t(`profile_form.proficiency.${n}`) `` / work_types patterns — confirm before deleting nested keys.
- `wp-profiles-export` localStorage contract: `{ teamCapacity: number, profiles: Array<{ id, name, role, skills: Skill[], capacity: number, workTypes: WorkType[] }> }`. Written by `publishExport()` in `App.tsx` on every `updateProfiles` call and at app startup. Planning Poker and Sprint Metrics read this key directly — do not rename it.
- `work-profiles:lastSession` contract: `{ profileCount: number, avgCapacity: number, topSkills: string[], lastUpdated: string }`. Written by `publishLastSession()` on every `updateProfiles` call and at app startup. Dashboard reads this key to show "N members · X% avg capacity · Top skills: …". `topSkills` is sorted by frequency (how many profiles have that skill) — top 5.

## Agent Log

### 2026-05-30 — feat: AppHeader unification (issue #18)
- Done: copied `AppHeader.tsx` + `LanguagePicker.tsx` from design system into `src/components/`; replaced inline `<header>` block in `App.tsx` with `<AppHeader title={t('app.title')} onTitleClick={() => setScreen('profiles')} navItems={[...]}><LanguagePicker /></AppHeader>`; removed native `<select>` language switcher; build passes
- Set issue #18 to In Review in project
- Remaining approved backlog: #19 (light/dark theme)
- Next task: implement #19 (light/dark theme: tailwind darkMode: 'class', anti-flash script in index.html, copy ThemeToggle.tsx from design-system into src/components/, add ThemeToggle inside AppHeader children, add dark: variants to all Tailwind color classes per tokens.css map)

### 2026-05-26 — feat: profile archive / soft delete (issue #17)
- Done: `archived?: boolean` added to `WorkProfile` type; `archiveProfile()`, `restoreProfile()`, `deletePermanently()` functions in ProfilesView; Archive button replaces Delete for active profiles; archived profiles hidden by default; "Show archived (N)" toggle in header; archived cards greyed with "Archived" badge + Restore / Delete permanently buttons; CreditsView shows archived names greyed+strikethrough, excludes archived from Person dropdown; Skill Matrix filtered to active profiles; `publishExport` and `publishLastSession` use active-only profiles; 8 new i18n keys per locale (EN/ES/BE/RU)
- Set issue #17 to In Review in project
- Remaining approved backlog: #18 (AppHeader unification), #19 (light/dark theme)
- Next task: implement #18 (AppHeader unification: copy AppHeader.tsx + LanguagePicker.tsx from agile-toolkit.github.io/design-system/components/ into src/components/, replace inline header block in App.tsx with standard AppHeader component + LanguagePicker child)

### 2026-05-23 — feat: CSV bulk import (issue #14)
- Done: added `parseCsv()` + `parseSkills()` + `parseWorkTypes()` helpers in `ProfilesView.tsx`; hidden `<input type="file">` triggered by "Import CSV" header button; `FileReader` reads file, calls `parseCsv()`, sets `csvPreview` state; preview modal shows total count, green "N new" + amber "N will update" summary, scrollable per-row list with new/update tags, Import all + Cancel buttons; `confirmImport()` merges by name (case-insensitive); onboarding Import card now triggers import instead of being disabled; 10 new i18n keys in all 4 locale files
- Set issue #14 to In Review in project
- Remaining approved backlog: #17 (profile archive), and any newly approved items
- Next task: check issues for human feedback; if #17 (profile archive) is approved, implement archived?: boolean in WorkProfile type, Archive button in ProfileCard, Show archived toggle in ProfilesView header

### 2026-05-23 — feat: empty state onboarding for new teams (issue #16)
- Done: replaced bare `<p>` empty state in `ProfilesView.tsx` with structured onboarding block shown when `profiles.length === 0 && !showForm`; includes headline, subtext, three action cards ("Add first profile" → blank form, "Start from a template" → form pre-filled with Frontend Dev skills, "Import from CSV" → disabled/coming soon), and a 3-step visual checklist (Add profiles → Review Skill Matrix → Track Credits); added `FE_TEMPLATE` constant and `openAddWithTemplate()` function; added 11 new i18n keys (`profiles.onboarding_*`) in all 4 locale files (EN/ES/BE/RU); set issue #16 to In Review in project
- Remaining approved backlog: #14 (CSV bulk import), #17 (profile archive), #18 (AppHeader unification), #19 (dark mode)
- Next task: implement #14 (CSV bulk import in ProfilesView: hidden file input + FileReader + preview modal showing count + merge-by-name into profiles array, no library needed)

### 2026-05-23 — feat: work-profiles:lastSession Dashboard key (issue #12)
- Done: added `publishLastSession()` in `App.tsx`; writes `work-profiles:lastSession` key with `{profileCount, avgCapacity, topSkills[5], lastUpdated}` on every `updateProfiles()` call and at startup; topSkills sorted by frequency (count of profiles having the skill); added `## localStorage keys` section to BRIEF.md documenting all 4 keys
- Set issue #12 to In Review in project
- Next task: implement next approved issue — #13 (Team Identity: auto-populate members from wp-profiles-export, lives in team-identity repo), #14 (CSV bulk import: FileReader + preview modal + merge-by-name), #16 (empty state in ProfilesView when profiles.length===0), #17 (archived?: boolean in WorkProfile + Archive button + Show archived toggle), #18 (AppHeader + LanguagePicker unification), #19 (light/dark theme + ThemeToggle); handle changes-requested issues #4 and #5 (update specs in issue bodies)

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
