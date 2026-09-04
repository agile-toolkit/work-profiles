import { describe, it, expect } from 'vitest'
import { ROLE_TEMPLATES } from './roleTemplates'

describe('ROLE_TEMPLATES', () => {
  it('defines exactly the 7 roles approved in issue #6', () => {
    expect(ROLE_TEMPLATES.map(t => t.role)).toEqual([
      'Frontend Dev',
      'Backend Dev',
      'QA Engineer',
      'Scrum Master',
      'Product Owner',
      'DevOps',
      'UX Designer',
    ])
  })

  it('has unique, non-empty role names', () => {
    const roles = ROLE_TEMPLATES.map(t => t.role.trim())
    expect(roles.every(r => r.length > 0)).toBe(true)
    expect(new Set(roles).size).toBe(roles.length)
  })

  it.each(ROLE_TEMPLATES)('$role has 5-8 skills at a valid proficiency', template => {
    expect(template.skills.length).toBeGreaterThanOrEqual(5)
    expect(template.skills.length).toBeLessThanOrEqual(8)
    for (const skill of template.skills) {
      expect(skill.name.trim().length).toBeGreaterThan(0)
      expect(Number.isInteger(skill.proficiency)).toBe(true)
      expect(skill.proficiency).toBeGreaterThanOrEqual(1)
      expect(skill.proficiency).toBeLessThanOrEqual(5)
    }
  })

  it.each(ROLE_TEMPLATES)('$role has unique skill names', template => {
    const names = template.skills.map(s => s.name.trim().toLowerCase())
    expect(new Set(names).size).toBe(names.length)
  })

  it.each(ROLE_TEMPLATES)('$role declares at least one preferred work type', template => {
    expect(template.workTypes.length).toBeGreaterThan(0)
  })

  it('gives every role at least one "proficient" (4) core skill and one lighter (2) supporting skill, per the UX guidance in issue #6', () => {
    for (const template of ROLE_TEMPLATES) {
      const levels = template.skills.map(s => s.proficiency)
      expect(levels).toContain(4)
      expect(levels.some(l => l <= 2)).toBe(true)
    }
  })
})
