import type { ProficiencyLevel, SkillHistoryEntry, WorkProfile } from '../types'

export function getSkillDelta(proficiency: ProficiencyLevel, history?: SkillHistoryEntry[]): number | null {
  if (!history || history.length === 0) return null
  return proficiency - history[history.length - 1].proficiency
}

export function eligibleEndorsers(
  activeProfiles: WorkProfile[],
  skillOwnerId: string,
  endorsedBy: string[]
): WorkProfile[] {
  return activeProfiles.filter(q => q.id !== skillOwnerId && !endorsedBy.includes(q.name))
}
