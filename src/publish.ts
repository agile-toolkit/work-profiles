import type { WorkProfile } from './types'

const WP_EXPORT_KEY = 'wp-profiles-export'
const LAST_SESSION_KEY = 'work-profiles:lastSession'
const SPRINT_CAPACITY_KEY = 'wp-sprint-capacity'

export function publishLastSession(profiles: WorkProfile[]) {
  const active = profiles.filter(p => !p.archived)
  const profileCount = active.length
  const avgCapacity = profileCount > 0
    ? Math.round(active.reduce((sum, p) => sum + (p.capacity ?? 0), 0) / profileCount)
    : 0
  const skillFreq = new Map<string, number>()
  for (const profile of active) {
    for (const skill of profile.skills) {
      skillFreq.set(skill.name, (skillFreq.get(skill.name) ?? 0) + 1)
    }
  }
  const topSkills = [...skillFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name)
  localStorage.setItem(LAST_SESSION_KEY, JSON.stringify({ profileCount, avgCapacity, topSkills, lastUpdated: new Date().toISOString() }))
}

// A profile counts as OOO when oooUntil is set and is today or later — the
// same "active, non-OOO" split publishExport's teamCapacity already implies,
// just distilled into the sprint-focused shape Scrum Facilitator needs.
export function publishSprintCapacity(profiles: WorkProfile[]) {
  const active = profiles.filter(p => !p.archived)
  const today = new Date().toISOString().slice(0, 10)
  const isOoo = (p: WorkProfile) => !!p.oooUntil && p.oooUntil >= today
  const oooMembers = active.filter(isOoo)
  const available = active.filter(p => !isOoo(p))
  const timezones = [...new Set(active.map(p => p.timezone).filter((tz): tz is string => !!tz))]
  const payload = {
    totalCapacity: available.reduce((sum, p) => sum + (p.capacity ?? 0), 0),
    memberCount: active.length,
    availableCount: available.length,
    oooCount: oooMembers.length,
    oooMembers: oooMembers.map(p => p.name),
    timezones,
    lastUpdated: new Date().toISOString(),
  }
  localStorage.setItem(SPRINT_CAPACITY_KEY, JSON.stringify(payload))
}

export function publishExport(profiles: WorkProfile[]) {
  const active = profiles.filter(p => !p.archived)
  const payload = {
    teamCapacity: active.reduce((sum, p) => sum + (p.capacity ?? 0), 0),
    profiles: active.map(({ id, name, role, skills, capacity, workTypes, timezone, workingHours, oooUntil }) => ({
      id, name, role, skills, capacity, workTypes, timezone, workingHours, oooUntil,
    })),
  }
  localStorage.setItem(WP_EXPORT_KEY, JSON.stringify(payload))
}
