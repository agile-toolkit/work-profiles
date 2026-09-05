import { describe, it, expect } from 'vitest'
import { buildBackup, parseBackup, BACKUP_VERSION } from './backup'
import type { ProjectCredit, WorkProfile } from '../types'

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

function makeCredit(id: string, profileId: string): ProjectCredit {
  return { id, profileId, project: 'Project X', contribution: 'Built the thing', points: 5, date: '2026-01-01' }
}

describe('buildBackup', () => {
  it('includes the current version, an ISO timestamp, and the given data', () => {
    const profiles = [makeProfile('1', 'Alice')]
    const credits = [makeCredit('c1', '1')]
    const backup = buildBackup(profiles, credits)
    expect(backup.version).toBe(BACKUP_VERSION)
    expect(backup.profiles).toBe(profiles)
    expect(backup.credits).toBe(credits)
    expect(() => new Date(backup.exportedAt).toISOString()).not.toThrow()
  })
})

describe('parseBackup', () => {
  it('round-trips a backup built by buildBackup', () => {
    const profiles = [makeProfile('1', 'Alice')]
    const credits = [makeCredit('c1', '1')]
    const json = JSON.stringify(buildBackup(profiles, credits))
    const parsed = parseBackup(json)
    expect(parsed).not.toBeNull()
    expect(parsed!.profiles).toEqual(profiles)
    expect(parsed!.credits).toEqual(credits)
    expect(parsed!.version).toBe(BACKUP_VERSION)
  })

  it('returns null for invalid JSON', () => {
    expect(parseBackup('{not json')).toBeNull()
  })

  it('returns null when profiles is missing', () => {
    expect(parseBackup(JSON.stringify({ credits: [] }))).toBeNull()
  })

  it('returns null when credits is missing', () => {
    expect(parseBackup(JSON.stringify({ profiles: [] }))).toBeNull()
  })

  it('returns null when profiles is not an array', () => {
    expect(parseBackup(JSON.stringify({ profiles: 'nope', credits: [] }))).toBeNull()
  })

  it('returns null for a non-object JSON value', () => {
    expect(parseBackup('42')).toBeNull()
    expect(parseBackup('null')).toBeNull()
    expect(parseBackup('"a string"')).toBeNull()
  })

  it('defaults version to 0 and exportedAt to empty string when absent', () => {
    const parsed = parseBackup(JSON.stringify({ profiles: [], credits: [] }))
    expect(parsed).toEqual({ version: 0, exportedAt: '', profiles: [], credits: [] })
  })

  it('accepts empty profiles and credits arrays', () => {
    const parsed = parseBackup(JSON.stringify({ version: 1, exportedAt: 'x', profiles: [], credits: [] }))
    expect(parsed).toEqual({ version: 1, exportedAt: 'x', profiles: [], credits: [] })
  })
})
