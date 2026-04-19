# BRIEF

Derived per [`agent-state.NO-BRIEF.md`](https://github.com/agile-toolkit/.github/blob/main/agent-state.NO-BRIEF.md). There was **no prior** `BRIEF.md`. Sources: `README.md`, `src/i18n/en.json` / `ru.json`, `src/`. Generated **2026-04-19**.

## Product scope (from `README.md`)

- **Work Profiles** + project credits: skills, task matching, transparent contributions.
- Stack: React 18, TypeScript, Vite, Tailwind, react-i18next (EN/RU).

## Build

- `npm run build` — **passes** (verified **2026-04-19**).

## TODO / FIXME in `src/`

- None.

## i18n — dynamic keys

- **`profile_form.proficiency.*`** and **`profile_form.work_types.*`** are intended for **dynamic** `` t(`profile_form.proficiency.${n}`) `` patterns — verify `ProfilesView.tsx` / form components actually emit those paths before treating as dead.

## i18n — likely orphaned / unverified

- **`profiles.title`**, **`profiles.work_types`** — no literal `t('profiles.title')` / `t('profiles.work_types')` in `src/` (directory uses **`profiles.directory_heading`** etc.). Clean up or wire on hub screen.
- **`matrix.all_skills`**, **`credits.total_points`**, **`credits.delete`** — not found as literals; confirm against `SkillMatrix.tsx` / `CreditsView.tsx` and remove or wire.

## Classification (NO-BRIEF)

- **Status:** `in-progress`
- **First next task:** Grep `profiles.title` and `profiles.work_types` across `src/`; if unused, delete from `en.json` and `ru.json`. Then same for **`matrix.all_skills`**, **`credits.total_points`**, **`credits.delete`** or implement missing matrix footer / credits delete button using those keys.
