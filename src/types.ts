export type ProficiencyLevel = 1 | 2 | 3 | 4 | 5
export type WorkType = 'design' | 'development' | 'testing' | 'analysis' | 'facilitation' | 'writing' | 'mentoring' | 'ops'
export type Screen = 'profiles' | 'matrix' | 'credits' | 'learn' | 'compare'

export interface SkillHistoryEntry {
  date: string
  proficiency: ProficiencyLevel
}

export interface Skill {
  id: string
  name: string
  proficiency: ProficiencyLevel
  history?: SkillHistoryEntry[]
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
}

export interface ProjectCredit {
  id: string
  profileId: string
  project: string
  contribution: string
  points: number
  date: string
}
