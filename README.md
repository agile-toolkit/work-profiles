# Work Profiles

A team skill mapping and project credit tool based on Management 3.0's Work Profiles and Project Credits practices — transparent skills, better task matching, recognized contributions.

Part of the [Agile Tools](https://github.com/bthos) suite built on Management 3.0 and ICAgile source materials.

See `.artefacts/GOAL.md` for why this exists and `.artefacts/ROADMAP.md` for what's next. `.artefacts/BRIEF.md` has the full run-by-run build history.

Client-only React app: team members self-serve their own profile (skills, capacity, availability), see team-wide insights in the Skill Matrix and Overview tab, and track project credits — all persisted to `localStorage`, no backend.

## Stack
React 18 · TypeScript · Vite · Tailwind CSS · react-i18next (EN/ES/BE/RU) · vite-plugin-pwa

## Dev commands
```bash
npm install
npm run dev       # start Vite dev server
npm run build     # tsc typecheck + production build
npm run preview   # serve the production build locally
```

## Deploy
GitHub Pages via GitHub Actions on push to `main`.

## localStorage keys

| Key | Shape | Purpose |
|-----|-------|---------|
| `work-profiles-data` | `WorkProfile[]` | Full profile array — the app's primary data store. |
| `work-profiles-credits` | `ProjectCredit[]` | Project credit log backing the CreditsView leaderboard. |
| `wp-profiles-export` | `{ teamCapacity: number, profiles: Array<{ id, name, role, skills, capacity, workTypes, timezone?, workingHours?, oooUntil? }> }` | Published on every profile mutation and at startup. Read by Planning Poker and Sprint Metrics — key name and shape are a public contract, do not rename. |
| `work-profiles:lastSession` | `{ profileCount: number, avgCapacity: number, topSkills: string[], lastUpdated: string }` | Published alongside the export. Read by the suite Dashboard to show "N members · X% avg capacity · Top skills: …". `topSkills` is the top 5 by frequency across active profiles. |
| `theme` | `'light' \| 'dark'` | Written by `ThemeToggle.tsx`. Per-origin, not a cross-app contract. |

Work Profiles also *reads* (but does not write) `improvement-board-items` from localStorage to surface each profile's open Improvement Board items — a one-way integration, see `ProfilesView.tsx`.

## Tech notes
- **State**: no external state library — a single `profiles`/`credits` array lives in `App.tsx`, passed down as props; `save()` writes straight to `localStorage` on every mutation.
- **Persistence pattern**: `publishExport()` and `publishLastSession()` in `App.tsx` re-derive their payload from `profiles` and write it on every `updateProfiles()` call and at app startup — there is no separate "sync" step. Both use `profiles.filter(p => !p.archived)` — archived profiles never leak into exports or the Dashboard summary.
- **Unguarded writes**: `save()`, `publishLastSession()`, and `publishExport()` call `localStorage.setItem` directly with no try/catch (quota/private-mode errors will throw uncaught). Only `ThemeToggle.tsx` guards its write. Tracked as [issue #58](https://github.com/agile-toolkit/work-profiles/issues/58).
- **i18n**: `react-i18next`, one JSON file per locale in `src/i18n/` (`en`, `es`, `be`, `ru`); `LanguagePicker.tsx` is a 4-language `<select>` inside `AppHeader`.
- **Theme**: Tailwind `darkMode: 'class'`; an anti-flash inline script in `index.html` applies the stored theme before React mounts; `ThemeToggle.tsx` toggles a `data-theme` attribute and persists to the `theme` localStorage key, falling back to `prefers-color-scheme`.
- **PWA**: configured via `vite-plugin-pwa` in `vite.config.ts` (`registerType: autoUpdate`); `UpdateToast.tsx` uses the `useRegisterSW` hook to show an "Update available / Reload" prompt.
- **Cross-app integration pattern**: this app is the *source of truth* for team composition/capacity — it publishes `wp-profiles-export` and `work-profiles:lastSession` for other apps to read, and separately *reads* `improvement-board-items` (one-way, no write-back). Several open issues extend this pattern further — see `.artefacts/ROADMAP.md`.
- **Dead code note**: `ProfileForm.tsx` exists but is not imported anywhere — the live skill-editing UI lives in `ProfilesView.tsx` (see BRIEF Agent Log, 2026-07-09).
