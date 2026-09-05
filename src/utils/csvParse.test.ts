import { describe, it, expect } from 'vitest'
import { parseCsvRow, parseSkills, parseWorkTypes, parseCsv } from './csvParse'

describe('parseCsvRow', () => {
  it('splits a plain comma-separated row', () => {
    expect(parseCsvRow('Alice,Engineer,80')).toEqual(['Alice', 'Engineer', '80'])
  })

  it('trims whitespace around fields', () => {
    expect(parseCsvRow(' Alice , Engineer , 80 ')).toEqual(['Alice', 'Engineer', '80'])
  })

  it('keeps commas inside quoted fields intact', () => {
    expect(parseCsvRow('Alice,"Engineer, Senior",80')).toEqual(['Alice', 'Engineer, Senior', '80'])
  })

  it('returns a single field for a row with no commas', () => {
    expect(parseCsvRow('Alice')).toEqual(['Alice'])
  })

  it('handles an empty row as one empty field', () => {
    expect(parseCsvRow('')).toEqual([''])
  })
})

describe('parseSkills', () => {
  it('returns an empty array for blank input', () => {
    expect(parseSkills('')).toEqual([])
    expect(parseSkills('   ')).toEqual([])
  })

  it('parses a single skill with a numeric level', () => {
    const result = parseSkills('React:4')
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ name: 'React', proficiency: 4 })
    expect(result[0].id).toBeTruthy()
  })

  it('parses multiple semicolon-separated skills', () => {
    const result = parseSkills('React:4; Node:3')
    expect(result.map(s => ({ name: s.name, proficiency: s.proficiency }))).toEqual([
      { name: 'React', proficiency: 4 },
      { name: 'Node', proficiency: 3 },
    ])
  })

  it('accepts a description after a dash following the level', () => {
    const result = parseSkills('React:4-Comfortable with hooks')
    expect(result[0]).toMatchObject({ name: 'React', proficiency: 4 })
  })

  it('accepts an en dash after the level', () => {
    const result = parseSkills('React:4–Comfortable with hooks')
    expect(result[0]).toMatchObject({ name: 'React', proficiency: 4 })
  })

  it('drops entries with no colon', () => {
    expect(parseSkills('React')).toEqual([])
  })

  it('drops entries with an empty name', () => {
    expect(parseSkills(':4')).toEqual([])
  })

  it('drops entries with a non-numeric level', () => {
    expect(parseSkills('React:expert')).toEqual([])
  })

  it('drops entries with a level out of the 1-5 range', () => {
    expect(parseSkills('React:0')).toEqual([])
    expect(parseSkills('React:6')).toEqual([])
  })

  it('skips blank segments between semicolons', () => {
    const result = parseSkills('React:4;;Node:3')
    expect(result.map(s => s.name)).toEqual(['React', 'Node'])
  })
})

describe('parseWorkTypes', () => {
  it('returns an empty array for blank input', () => {
    expect(parseWorkTypes('')).toEqual([])
  })

  it('parses valid work types case-insensitively', () => {
    expect(parseWorkTypes('Design; DEVELOPMENT; testing')).toEqual(['design', 'development', 'testing'])
  })

  it('drops unrecognized work types', () => {
    expect(parseWorkTypes('design; underwater basket weaving')).toEqual(['design'])
  })
})

describe('parseCsv', () => {
  it('returns an empty array when there is no header or data', () => {
    expect(parseCsv('')).toEqual([])
    expect(parseCsv('Name,Role')).toEqual([])
  })

  it('returns an empty array when there is no name column', () => {
    expect(parseCsv('Role,Capacity\nEngineer,80')).toEqual([])
  })

  it('parses a full row with all columns', () => {
    const csv = 'Name,Role,Capacity,Work Types,Skills\nAlice,Engineer,80,design;development,React:4;Node:3'
    const result = parseCsv(csv)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Alice')
    expect(result[0].role).toBe('Engineer')
    expect(result[0].capacity).toBe(80)
    expect(result[0].workTypes).toEqual(['design', 'development'])
    expect(result[0].skills.map(s => s.name)).toEqual(['React', 'Node'])
  })

  it('skips rows with a blank name', () => {
    const csv = 'Name,Role\n,Engineer\nAlice,Engineer'
    const result = parseCsv(csv)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Alice')
  })

  it('defaults capacity to 100 when missing or invalid', () => {
    const csv = 'Name,Capacity\nAlice,not-a-number\nBob,'
    const result = parseCsv(csv)
    expect(result[0].capacity).toBe(100)
    expect(result[1].capacity).toBe(100)
  })

  it('clamps capacity to the 10-100 range', () => {
    const csv = 'Name,Capacity\nAlice,5\nBob,150'
    const result = parseCsv(csv)
    expect(result[0].capacity).toBe(10)
    expect(result[1].capacity).toBe(100)
  })

  it('defaults role, work types, and skills to empty when columns are missing', () => {
    const csv = 'Name\nAlice'
    const result = parseCsv(csv)
    expect(result[0]).toMatchObject({ role: '', workTypes: [], skills: [] })
  })

  it('handles Windows-style line endings', () => {
    const csv = 'Name,Role\r\nAlice,Engineer\r\n'
    const result = parseCsv(csv)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Alice')
  })
})
