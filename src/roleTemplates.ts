import type { ProficiencyLevel, WorkType } from './types'

/**
 * Static starter templates for the "Start from a template" row at the top of
 * the profile form (issue #6). Selecting a role pre-fills the skills list
 * (and preferred work types) with sensible defaults for that role; the user
 * can still add, remove, or adjust any pre-filled skill before saving.
 *
 * Role names are kept in English deliberately — skill names in this app are
 * already English-first (e.g. "TypeScript", "CI/CD"), so translating just
 * the role label would be inconsistent with the skills it introduces.
 *
 * Templates are static for this first slice (not user-editable/stored).
 */
export interface RoleTemplateSkill {
  name: string
  proficiency: ProficiencyLevel
}

export interface RoleTemplate {
  role: string
  workTypes: WorkType[]
  skills: RoleTemplateSkill[]
}

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    role: 'Frontend Dev',
    workTypes: ['development', 'design'],
    skills: [
      { name: 'TypeScript', proficiency: 4 },
      { name: 'React', proficiency: 4 },
      { name: 'CSS / Tailwind', proficiency: 3 },
      { name: 'Testing (Vitest/Jest)', proficiency: 3 },
      { name: 'Accessibility', proficiency: 2 },
      { name: 'CI/CD', proficiency: 2 },
    ],
  },
  {
    role: 'Backend Dev',
    workTypes: ['development', 'analysis'],
    skills: [
      { name: 'Node.js / TypeScript', proficiency: 4 },
      { name: 'API Design', proficiency: 4 },
      { name: 'Databases (SQL)', proficiency: 3 },
      { name: 'Testing', proficiency: 3 },
      { name: 'Authentication & Security', proficiency: 3 },
      { name: 'System Design', proficiency: 2 },
      { name: 'CI/CD', proficiency: 2 },
    ],
  },
  {
    role: 'QA Engineer',
    workTypes: ['testing', 'analysis'],
    skills: [
      { name: 'Test Planning', proficiency: 4 },
      { name: 'Automated Testing (Playwright/Cypress)', proficiency: 4 },
      { name: 'Manual Testing', proficiency: 4 },
      { name: 'Bug Triage', proficiency: 3 },
      { name: 'API Testing', proficiency: 3 },
      { name: 'CI/CD', proficiency: 2 },
    ],
  },
  {
    role: 'Scrum Master',
    workTypes: ['facilitation', 'mentoring'],
    skills: [
      { name: 'Facilitation', proficiency: 4 },
      { name: 'Agile Coaching', proficiency: 4 },
      { name: 'Conflict Resolution', proficiency: 3 },
      { name: 'Backlog Refinement', proficiency: 3 },
      { name: 'Stakeholder Communication', proficiency: 3 },
      { name: 'Metrics & Reporting', proficiency: 2 },
    ],
  },
  {
    role: 'Product Owner',
    workTypes: ['analysis', 'facilitation', 'writing'],
    skills: [
      { name: 'Backlog Management', proficiency: 4 },
      { name: 'Stakeholder Communication', proficiency: 4 },
      { name: 'User Story Writing', proficiency: 4 },
      { name: 'Roadmapping', proficiency: 3 },
      { name: 'Prioritization Frameworks', proficiency: 3 },
      { name: 'Market & User Research', proficiency: 2 },
    ],
  },
  {
    role: 'DevOps',
    workTypes: ['ops', 'development'],
    skills: [
      { name: 'CI/CD Pipelines', proficiency: 4 },
      { name: 'Cloud Infrastructure (AWS/GCP/Azure)', proficiency: 4 },
      { name: 'Containers (Docker/Kubernetes)', proficiency: 4 },
      { name: 'Infrastructure as Code', proficiency: 3 },
      { name: 'Monitoring & Observability', proficiency: 3 },
      { name: 'Security & Compliance', proficiency: 2 },
    ],
  },
  {
    role: 'UX Designer',
    workTypes: ['design', 'analysis'],
    skills: [
      { name: 'User Research', proficiency: 4 },
      { name: 'Wireframing / Prototyping', proficiency: 4 },
      { name: 'Interaction Design', proficiency: 4 },
      { name: 'Visual Design', proficiency: 3 },
      { name: 'Usability Testing', proficiency: 3 },
      { name: 'Design Systems', proficiency: 3 },
      { name: 'Accessibility', proficiency: 2 },
    ],
  },
]
