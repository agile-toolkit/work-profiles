import type { ProficiencyLevel, Skill, WorkType } from '../types'

export interface CsvProfile {
  name: string
  role: string
  capacity: number
  workTypes: WorkType[]
  skills: Skill[]
}

export function parseCsvRow(row: string): string[] {
  const result: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < row.length; i++) {
    if (row[i] === '"') {
      inQuotes = !inQuotes
    } else if (row[i] === ',' && !inQuotes) {
      result.push(field.trim())
      field = ''
    } else {
      field += row[i]
    }
  }
  result.push(field.trim())
  return result
}

export const VALID_WORK_TYPES: WorkType[] = [
  'design', 'development', 'testing', 'analysis',
  'facilitation', 'writing', 'mentoring', 'ops',
]

export function parseSkills(raw: string): Skill[] {
  if (!raw.trim()) return []
  return raw.split(';').flatMap(part => {
    const trimmed = part.trim()
    if (!trimmed) return []
    const colonIdx = trimmed.indexOf(':')
    if (colonIdx === -1) return []
    const name = trimmed.slice(0, colonIdx).trim()
    if (!name) return []
    const rest = trimmed.slice(colonIdx + 1).trim()
    const dashIdx = rest.search(/[–-]/)
    const levelStr = dashIdx !== -1 ? rest.slice(0, dashIdx).trim() : rest.trim()
    const level = parseInt(levelStr, 10)
    if (isNaN(level) || level < 1 || level > 5) return []
    return [{ id: crypto.randomUUID(), name, proficiency: level as ProficiencyLevel }]
  })
}

export function parseWorkTypes(raw: string): WorkType[] {
  if (!raw.trim()) return []
  return raw.split(';').flatMap(part => {
    const wt = part.trim().toLowerCase() as WorkType
    return VALID_WORK_TYPES.includes(wt) ? [wt] : []
  })
}

export function parseCsv(text: string): CsvProfile[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return []
  const headers = parseCsvRow(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, ' '))
  const nameIdx = headers.indexOf('name')
  if (nameIdx === -1) return []
  const roleIdx = headers.indexOf('role')
  const capacityIdx = headers.indexOf('capacity')
  const workTypesIdx = headers.indexOf('work types')
  const skillsIdx = headers.indexOf('skills')
  return lines.slice(1).flatMap(line => {
    const fields = parseCsvRow(line)
    const name = (fields[nameIdx] ?? '').trim()
    if (!name) return []
    const rawCapacity = parseInt(fields[capacityIdx] ?? '100', 10)
    const capacity = isNaN(rawCapacity) ? 100 : Math.min(100, Math.max(10, rawCapacity))
    return [{
      name,
      role: roleIdx !== -1 ? (fields[roleIdx] ?? '').trim() : '',
      capacity,
      workTypes: workTypesIdx !== -1 ? parseWorkTypes(fields[workTypesIdx] ?? '') : [],
      skills: skillsIdx !== -1 ? parseSkills(fields[skillsIdx] ?? '') : [],
    }]
  })
}
