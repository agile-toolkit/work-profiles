# Changelog

All notable changes to this project are documented here. See `.artefacts/BRIEF.md` for the detailed run-by-run build history that preceded this file.

## Unreleased

## 0.3.6 — Monthly credits trend chart (2026-09-05)

- **feat** (issue #59): adds a "Trend" toggle in `CreditsView.tsx`'s
  header, alongside the existing Leaderboard toggle, showing a per-person
  SVG bar chart of `points` summed by calendar month for the last 6
  months (pure inline SVG + Tailwind, no charting library — consistent
  with the suite's existing convention). People with credits in fewer
  than 2 distinct months show an explanatory empty state instead of a
  1-bar chart with no trend to show. The leaderboard's existing total-
  points rows also gained a small inline sparkline next to the total, so
  the trend is visible without switching views.
  - New `src/utils/creditsTrend.ts` (`monthKey`, `lastMonthKeys`,
    `monthlyTrendForProfile`, `formatMonthLabel`,
    `hasEnoughDataForTrend`) with 13 unit tests — pure grouping/formatting
    logic, no component rendering required.
  - New i18n keys `credits.trend_toggle`/`trend_off`/`trend_title`/
    `trend_empty` in all four locales.
  - Answers to the issue's open questions: (1) fixed 6-month window, not
    configurable, per the issue's own default suggestion; (2) simple
    monthly point sums, no outlier flagging; (3) bar chart per month,
    matching the precedent set by Improvement Board's sprint history
    chart rather than a continuous line, since discrete calendar months
    read more clearly as bars.

## 0.3.5 — Full JSON backup and restore (2026-09-05)

- **feat** (issue #56): "Export backup" downloads a single JSON file with
  `{ version, exportedAt, profiles, credits }` — a full, round-trippable
  snapshot of both localStorage keys (`work-profiles-data`,
  `work-profiles-credits`), unlike the CSV export (#5) which only covers
  profile fields and can't represent nested `history`/`endorsedBy`
  arrays. "Import backup" reads a file, validates its shape, warns via a
  confirmation dialog that it **replaces** all current profiles and
  credits (not merge — unlike CSV import's merge-by-name), then writes
  both. New `src/utils/backup.ts` (`buildBackup`, `parseBackup`,
  `downloadBackup`) with 9 unit tests. New i18n keys
  `profiles.backup_export`/`backup_import`/`backup_confirm_replace`/
  `backup_import_error` in all four locales. Browser-verified: exported a
  backup, cleared localStorage, re-imported it, and the profile
  reappeared.
  - Per the issue's resolved questions: replace-only import (no merge
    ambiguity to reason about), and credits are always included in the
    backup by default (no opt-out checkbox — a team that only wants
    skills data can already get that from the CSV export).

## 0.3.4 — Show active Kanban Designer cards on profile cards (2026-09-05)

- **feat** (issue #55): mirrors the existing "Open improvements" collapsible
  pattern (issue #31) to surface a person's active Kanban Designer cards.
  Reads `kanban-designer:currentBoard` from localStorage, matches cards by
  `assignee` against the profile's name (case-insensitive), and excludes
  cards in a column whose name looks terminal (`done`, `complete(d)`,
  `finished`, `closed`, `shipped` — best-effort word match, since the
  schema doesn't mark column type). Read-only; no Kanban Designer changes
  needed on this side. New `src/utils/kanbanDesignerImport.ts` module with
  9 unit tests, plus new `profiles.kanban_cards` i18n key in all four
  locales.

  **Correction to the issue's premise:** the issue assumed
  `kanban-designer:currentBoard` already included each card's `assignee`
  (added in kanban-designer#38) — it didn't. `writeCurrentBoard()` there
  only serialized `title`/`description`. Filed and fixed as
  `kanban-designer` PR #58 before building this feature.

## 0.3.3 — Extract testable pure logic from ProfilesView and SkillMatrix (2026-09-05)

- **test** (issue #54): extracted the CSV import parsing (`parseCsvRow`,
  `parseSkills`, `parseWorkTypes`, `parseCsv`) out of `ProfilesView.tsx`
  into a standalone `src/utils/csvParse.ts` module, and the skill-history
  delta calculation (`getSkillDelta`, moved out of `SkillMatrix.tsx`) plus
  the endorsement-eligibility rule (self-exclusion, no double-endorse,
  extracted from `ProfilesView.tsx`'s render logic) into a new
  `src/utils/skillLogic.ts` module. Both components now import from these
  modules instead of defining the logic locally — no behavior change.
  Added `csvParse.test.ts` (26 cases: quoted-field parsing, skill
  string/level parsing incl. invalid levels and missing colons, work-type
  whitelist filtering, and full CSV-to-profile parsing incl. malformed
  rows, capacity clamping, and CRLF line endings) and `skillLogic.test.ts`
  (7 cases covering delta sign/magnitude and endorser eligibility). This
  completes the pure-logic test coverage issue #54 asked for — Vitest,
  `publishExport`/`publishLastSession` tests, and the CI `npm test` gate
  were already in place from a prior pass.

## 0.3.2 — Add glass effect to the header (2026-09-04)

- **fix**: `AppHeader.tsx`'s background changed from opaque
  `bg-white`/`dark:bg-gray-900` to `bg-[var(--glass)] backdrop-blur-sm` —
  the Dashboard's own nav has always had this translucent blur effect,
  but the shared header every app copies did not. User-reported
  inconsistency. Verified in both themes.

- **feat**: synced the shared `icons.tsx` (now 64 icons) and replaced the
  remaining decorative emoji with SVG icons: the timezone clock and
  target-met checkmark on `ProfileCard`, the principles-list checkmark on
  `LearnView`, the endorsement-count and target-met checkmarks on
  `SkillMatrix`, the top-endorsed-skill checkmark on `OverviewView`, and on
  `ProfilesView` the three onboarding tile icons (add/template/import),
  the endorsement-count checkmark, the interest-topic spark marker, and the
  endorsement checkmark inside the printable profile portal — all six
  `✓{count}` spots became `inline-flex items-center gap-0.5` pairs so the
  icon and number can't wrap apart. Icons inherit `currentColor` so the
  green target-met and endorsement badges keep their color; every existing
  `title` survived by wrapping the icon rather than passing `title` to the
  icon component (which doesn't accept one). Also converted the four
  decorative arrow glyphs that were left over from that pass: the
  `SkillMatrix` and `CompareView` "back" links (`←`) became `ArrowLeftIcon`,
  and the standalone `→` step/flow separators in `SkillMatrix`'s
  mentor-pairing rows and `ProfilesView`'s onboarding steps became
  `ArrowRightIcon`, keeping the same muted gray. Left as text, deliberately:
  `ProfileCard`/`SkillMatrix`'s `→{targetProficiency}` (the arrow is bound
  to the value, "heading toward level N"), `SkillMatrix`'s `↑N`/`↓N`/`=`
  delta triple (swapping two of three for icons would leave the set
  mismatched), and the `skill→category` code comment.
- **ci**: CI Node bumped 20 → 22 and `engines` declared. `jsdom@30` requires
  Node `^22.22.2 || ^24.15.0 || >=26`, so the test step could never have passed
  on the pinned Node 20 — invisible until this release started running the
  tests in CI at all. Builds were unaffected (vite and tsc do not load jsdom).


## 0.3.0 — Error boundary and test-gated deploys (2026-09-03)

- **feat**: `ErrorBoundary` at the root of the app. Every app in the suite reads
  payloads written by *other* apps, historically through `JSON.parse(raw) as T`
  with no runtime check; an unexpected shape threw during render, unmounted the
  tree and left a blank page that a reload could not fix, because the offending
  data was still in localStorage. The fallback offers "clear this app's saved
  data", scoped to this app's own key prefixes so recovery cannot destroy a
  neighbouring app's data on the shared origin.
- **ci**: `npm test` now runs before `npm run build` in `deploy.yml`. The suite
  had 301 passing tests and CI ran them in exactly one repo of eleven.

## 0.2.7 — Facilitator Mode persists across suite apps (2026-09-03)

- **fix**: `useFacilitatorMode`'s storage key changed from
  `'work-profiles:facilitatorMode'` to the shared
  `'agile-toolkit:facilitatorMode'` — user-requested so Facilitator Mode
  survives navigating to another suite app in the same tab instead of
  resetting. sessionStorage is already shared per-origin-per-tab; this
  was previously app-prefixed specifically to keep it isolated, which
  turned out to be the wrong default for a cross-app presentation
  session.

## 0.2.6 — Replace decorative ✕/× emoji with SVG icons (2026-09-03)

- **feat**: replaced 3 decorative close-button text glyphs (project
  credit delete, skill-remove in the profile form, skill-matrix category
  filter clear) with `CloseIcon` from the new shared `icons.tsx`,
  `currentColor` throughout — one of the three used `×` (multiplication
  sign) rather than `✕`, a variant the original suite-wide sweep's grep
  needed extending to catch. Part of a suite-wide emoji→SVG sweep the
  user asked for.

## 0.2.5 — Facilitator Mode (2026-09-03)

- **feat**: added Facilitator (projector) Mode — a presentation toggle for
  in-room profile reviews, bigger UI via one CSS rule (everything sized
  in `rem` scales automatically) plus hiding the nav pills and language
  picker while active. Toggled from a new header button next to the theme
  toggle, session-scoped via `sessionStorage`. Adopted from the shared
  design-system pattern (`useFacilitatorMode.ts` + `FacilitatorToggle.tsx`),
  originally built for Team Identity.

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
