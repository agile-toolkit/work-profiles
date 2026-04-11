# BRIEF — Work Profiles

## What this app does
A team skill mapping and project credit tool based on Management 3.0's "Work Profiles" and "Project Credits" practices. Team members create work profiles (skills, interests, capacity), and the system tracks project credits — recognizing contributions and enabling better task matching.

## Target users
Team leads, HR, and Agile coaches in organizations adopting skill-based team design and transparent contribution tracking.

## Core features (MVP)
- Work profile builder: skills (with proficiency levels), interests, preferred work types, capacity
- Skill matrix view: team-level overview of who knows what
- Project credits tracker: log contributions to projects/tasks with credit points
- Credit leaderboard (opt-in, toggleable)
- Profile export: shareable profile card (PNG/PDF)
- Team composition advisor: suggest task assignments based on profiles

## Educational layer
- "What are Work Profiles?" intro panel with M3.0 rationale
- Project Credits explainer: why track contributions, how to avoid gaming
- Skill proficiency scale guide (Dreyfus model reference)
- Reference to source materials

## Tech stack
React 18 + TypeScript + Vite + Tailwind CSS. Firebase for team profiles (optional). GitHub Pages deployment.

## Source materials in `.artefacts/`
- `work profiles & project credits.pdf` — M3.0 work profiles and project credits methodology

## i18n
English + Russian (react-i18next).

## Agentic pipeline roles
- `/vadavik` — spec & requirements validation
- `/lojma` — UX/UI design (profile builder, skill matrix, credit tracker)
- `/laznik` — architecture (profile data model, skill matrix computation)
- `@cmok` — implementation
- `@bahnik` — QA (skill matrix rendering, credit calculation edge cases)
- `@piarun` — documentation
- `@zlydni` — git commits & GitHub Pages deploy
