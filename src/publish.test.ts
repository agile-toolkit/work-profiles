import { describe, it, expect, beforeEach } from 'vitest'
import { publishLastSession, publishSprintCapacity, publishExport } from './publish'
import type { WorkProfile, Skill } from './types'

beforeEach(() => localStorage.clear())

function skill(name: string): Skill {
  return { id: name, name, proficiency: 3 }
}

function profile(overrides: Partial<WorkProfile>): WorkProfile {
  return {
    id: 'p1', name: 'Alice', role: 'Dev', skills: [], interests: [], workTypes: [],
    capacity: 8, createdAt: Date.now(),
    ...overrides,
  }
}

describe('publishLastSession', () => {
  it('summarizes active profile count, avg capacity, and top skills', () => {
    publishLastSession([
      profile({ id: '1', capacity: 8, skills: [skill('React'), skill('TS')] }),
      profile({ id: '2', capacity: 4, skills: [skill('React')] }),
      profile({ id: '3', archived: true, capacity: 100, skills: [skill('Ignored')] }),
    ])
    const summary = JSON.parse(localStorage.getItem('work-profiles:lastSession')!)
    expect(summary.profileCount).toBe(2)
    expect(summary.avgCapacity).toBe(6)
    expect(summary.topSkills[0]).toBe('React')
  })

  it('handles zero active profiles without dividing by zero', () => {
    publishLastSession([])
    const summary = JSON.parse(localStorage.getItem('work-profiles:lastSession')!)
    expect(summary.profileCount).toBe(0)
    expect(summary.avgCapacity).toBe(0)
  })
})

describe('publishSprintCapacity', () => {
  const today = new Date().toISOString().slice(0, 10)
  const future = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  const past = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)

  it('excludes OOO members from totalCapacity but counts them in oooCount', () => {
    publishSprintCapacity([
      profile({ id: '1', capacity: 5 }),
      profile({ id: '2', capacity: 5, oooUntil: future, name: 'Bob' }),
      profile({ id: '3', archived: true, capacity: 100 }),
    ])
    const payload = JSON.parse(localStorage.getItem('wp-sprint-capacity')!)
    expect(payload.totalCapacity).toBe(5)
    expect(payload.memberCount).toBe(2)
    expect(payload.oooCount).toBe(1)
    expect(payload.oooMembers).toEqual(['Bob'])
  })

  it('treats a past oooUntil date as no longer OOO', () => {
    publishSprintCapacity([profile({ oooUntil: past, capacity: 5 })])
    const payload = JSON.parse(localStorage.getItem('wp-sprint-capacity')!)
    expect(payload.oooCount).toBe(0)
    expect(payload.totalCapacity).toBe(5)
  })

  it("treats today's oooUntil date as still OOO", () => {
    publishSprintCapacity([profile({ oooUntil: today, capacity: 5 })])
    const payload = JSON.parse(localStorage.getItem('wp-sprint-capacity')!)
    expect(payload.oooCount).toBe(1)
  })

  it('deduplicates timezones across active profiles', () => {
    publishSprintCapacity([
      profile({ id: '1', timezone: 'UTC+1' }),
      profile({ id: '2', timezone: 'UTC+1' }),
      profile({ id: '3', timezone: 'UTC-5' }),
      profile({ id: '4', timezone: undefined }),
    ])
    const payload = JSON.parse(localStorage.getItem('wp-sprint-capacity')!)
    expect(payload.timezones.sort()).toEqual(['UTC+1', 'UTC-5'])
  })
})

describe('publishExport', () => {
  it('excludes archived profiles from teamCapacity and the profile list', () => {
    publishExport([
      profile({ id: '1', capacity: 5 }),
      profile({ id: '2', archived: true, capacity: 100 }),
    ])
    const payload = JSON.parse(localStorage.getItem('wp-profiles-export')!)
    expect(payload.teamCapacity).toBe(5)
    expect(payload.profiles).toHaveLength(1)
  })
})
