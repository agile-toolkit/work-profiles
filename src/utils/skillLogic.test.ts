import { describe, it, expect } from 'vitest'
import { getSkillDelta, eligibleEndorsers } from './skillLogic'
import type { ProficiencyLevel, SkillHistoryEntry, WorkProfile } from '../types'

function level(n: number): ProficiencyLevel {
  return n as ProficiencyLevel
}

function historyEntry(date: string, proficiency: number): SkillHistoryEntry {
  return { date, proficiency: level(proficiency) }
}

describe('getSkillDelta', () => {
  it('returns null when there is no history', () => {
    expect(getSkillDelta(level(3))).toBeNull()
    expect(getSkillDelta(level(3), [])).toBeNull()
  })

  it('returns the difference from the most recent history entry', () => {
    expect(getSkillDelta(level(4), [historyEntry('2026-01-01', 2)])).toBe(2)
  })

  it('uses the last entry when there are multiple', () => {
    const history = [historyEntry('2026-01-01', 1), historyEntry('2026-02-01', 3)]
    expect(getSkillDelta(level(3), history)).toBe(0)
  })

  it('returns a negative delta when proficiency dropped', () => {
    expect(getSkillDelta(level(2), [historyEntry('2026-01-01', 4)])).toBe(-2)
  })
})

function makeProfile(id: string, name: string): WorkProfile {
  return {
    id,
    name,
    role: '',
    skills: [],
    interests: [],
    workTypes: [],
    capacity: 100,
    createdAt: 0,
  }
}

describe('eligibleEndorsers', () => {
  const alice = makeProfile('1', 'Alice')
  const bob = makeProfile('2', 'Bob')
  const carol = makeProfile('3', 'Carol')

  it('excludes the skill owner', () => {
    const result = eligibleEndorsers([alice, bob, carol], '1', [])
    expect(result.map(p => p.name)).toEqual(['Bob', 'Carol'])
  })

  it('excludes profiles that already endorsed the skill', () => {
    const result = eligibleEndorsers([alice, bob, carol], '1', ['Bob'])
    expect(result.map(p => p.name)).toEqual(['Carol'])
  })

  it('returns an empty array when everyone has endorsed or is the owner', () => {
    const result = eligibleEndorsers([alice, bob, carol], '1', ['Bob', 'Carol'])
    expect(result).toEqual([])
  })
})
