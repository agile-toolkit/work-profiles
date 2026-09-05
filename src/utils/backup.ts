import type { ProjectCredit, WorkProfile } from '../types'

export const BACKUP_VERSION = 1

export interface BackupData {
  version: number
  exportedAt: string
  profiles: WorkProfile[]
  credits: ProjectCredit[]
}

export function buildBackup(profiles: WorkProfile[], credits: ProjectCredit[]): BackupData {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    profiles,
    credits,
  }
}

// Replace-only import (per the issue's resolved question 1): a valid
// backup fully overwrites current profiles/credits rather than merging,
// unlike the CSV import's merge-by-name semantics.
export function parseBackup(raw: string): BackupData | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const candidate = parsed as Record<string, unknown>
  if (!Array.isArray(candidate.profiles) || !Array.isArray(candidate.credits)) return null
  return {
    version: typeof candidate.version === 'number' ? candidate.version : 0,
    exportedAt: typeof candidate.exportedAt === 'string' ? candidate.exportedAt : '',
    profiles: candidate.profiles as WorkProfile[],
    credits: candidate.credits as ProjectCredit[],
  }
}

export function downloadBackup(profiles: WorkProfile[], credits: ProjectCredit[]): void {
  const backup = buildBackup(profiles, credits)
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `work-profiles-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
