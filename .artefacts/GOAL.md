# Work Profiles — Goal

## Problem
Agile teams rarely have a shared, up-to-date picture of who can do what, at what proficiency, and how much capacity they have — skills live in people's heads, spreadsheets go stale, and contributions go unrecognized. Work Profiles gives a team a lightweight, self-maintained directory of skills (Dreyfus-level proficiency), capacity, availability, and project credits, based on Management 3.0's Work Profiles and Project Credits practices, so task matching and recognition are based on current, visible data instead of guesswork.

## Audience
Small agile/Scrum teams and their Scrum Masters or team leads, self-service during sprint planning, 1:1s, and retrospectives — no admin or backend, each person maintains their own profile directly in the browser.

## Success criteria
1. A team member can create and maintain a profile — skills with Dreyfus proficiency levels, capacity %, work types, availability window and timezone — without help.
2. Anyone can see team-wide skill and capacity insights at a glance via the Skill Matrix and Team Overview tab (role mix, capacity distribution, skill coverage, mentoring opportunities).
3. Contributions are recognized in-app through project credits and peer skill endorsements, not just tracked privately.
4. Other Agile Toolkit apps (Planning Poker, Sprint Metrics, Dashboard, Scrum Facilitator, Salary Formula, Team Identity, Change Planner) can read team composition and capacity data through documented localStorage contracts without the user re-entering anything.
5. The app works fully offline as an installable PWA, in the team's language (EN/ES/BE/RU), and in light or dark theme.

## Non-goals
- Not an HR or performance-review system — no compensation logic lives here (Salary Formula consumes exported data separately).
- No backend or server component — persistence is client-side localStorage only, no sync across devices/browsers.
- No real-time multi-user collaboration — one browser's data is authoritative for that browser.
- Not an org chart, reporting-line, or access-control tool — no user auth, no permissions model.
- Not a full CRM for cross-team integrations — Work Profiles publishes data; consuming apps own their own read/import logic.
