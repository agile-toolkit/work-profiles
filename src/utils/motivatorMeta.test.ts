import { describe, it, expect } from 'vitest'
import { motivatorEmoji } from './motivatorMeta'

describe('motivatorEmoji', () => {
  it('returns the correct emoji for each known motivator id', () => {
    expect(motivatorEmoji('curiosity')).toBe('🔍')
    expect(motivatorEmoji('honor')).toBe('🏅')
    expect(motivatorEmoji('acceptance')).toBe('❤️')
    expect(motivatorEmoji('mastery')).toBe('🎯')
    expect(motivatorEmoji('power')).toBe('⚡')
    expect(motivatorEmoji('freedom')).toBe('🦋')
    expect(motivatorEmoji('relatedness')).toBe('🤝')
    expect(motivatorEmoji('order')).toBe('📋')
    expect(motivatorEmoji('goal')).toBe('🌟')
    expect(motivatorEmoji('status')).toBe('🏆')
  })

  it('returns a fallback for an unknown id', () => {
    expect(motivatorEmoji('unknown')).toBe('❓')
  })
})
