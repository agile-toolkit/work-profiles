export type ProficiencyLevel = 1 | 2 | 3 | 4 | 5
export type WorkType = 'design' | 'development' | 'testing' | 'analysis' | 'facilitation' | 'writing' | 'mentoring' | 'ops'
export type Screen = 'profiles' | 'matrix' | 'credits' | 'learn' | 'compare' | 'overview'

export const SKILL_CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Design', 'Testing', 'Soft Skills', 'Data & AI', 'Other'] as const
export type SkillCategory = typeof SKILL_CATEGORIES[number]

export interface SkillHistoryEntry {
  date: string
  proficiency: ProficiencyLevel
}

export interface Skill {
  id: string
  name: string
  proficiency: ProficiencyLevel
  category?: string
  history?: SkillHistoryEntry[]
  endorsedBy?: string[]
  targetProficiency?: number
}

export interface WorkingHours {
  start: string
  end: string
}

export interface AttachedMotivatorSnapshot {
  date: string
  topMotivators: string[]
}

export interface WorkProfile {
  id: string
  name: string
  role: string
  skills: Skill[]
  interests: string[]
  workTypes: WorkType[]
  capacity: number
  createdAt: number
  archived?: boolean
  timezone?: string
  workingHours?: WorkingHours
  oooUntil?: string
  motivatorSnapshot?: AttachedMotivatorSnapshot
}

export interface ProjectCredit {
  id: string
  profileId: string
  project: string
  contribution: string
  points: number
  date: string
}
