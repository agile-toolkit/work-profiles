import { describe, it, expect, beforeEach } from 'vitest'
import {
  parseMotivatorsParam,
  readMotivatorSnapshot,
  clearMotivatorSnapshot,
  topMotivatorLabels,
} from './motivatorHandoff'

function encodeSnapshot(snapshot: unknown): string {
  return btoa(encodeURIComponent(JSON.stringify(snapshot)))
}

const SAMPLE = {
  date: '2026-09-01',
  ranked: ['curiosity', 'mastery', 'freedom', 'honor'],
  topMotivators: ['curiosity', 'mastery', 'freedom'] as [string, string, string],
}

describe('parseMotivatorsParam', () => {
  it('returns null when motivators is absent', () => {
    expect(parseMotivatorsParam('')).toBeNull()
    expect(parseMotivatorsParam('?other=1')).toBeNull()
  })

  it('returns null on malformed payload instead of throwing', () => {
    expect(parseMotivatorsParam('?motivators=not-valid-base64!!!')).toBeNull()
  })

  it('decodes a Moving Motivators snapshot matching buildWorkProfilesSnapshot', () => {
    const result = parseMotivatorsParam(`?motivators=${encodeSnapshot(SAMPLE)}`)
    expect(result).toEqual(SAMPLE)
  })
})

describe('motivator snapshot (localStorage)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when nothing was saved', () => {
    expect(readMotivatorSnapshot()).toBeNull()
  })

  it('reads and clears the saved snapshot', () => {
    localStorage.setItem('work-profiles:motivatorSnapshot', JSON.stringify(SAMPLE))
    expect(readMotivatorSnapshot()).toEqual(SAMPLE)
    clearMotivatorSnapshot()
    expect(readMotivatorSnapshot()).toBeNull()
  })
})

describe('topMotivatorLabels', () => {
  it('capitalizes each motivator id', () => {
    expect(topMotivatorLabels(SAMPLE)).toEqual(['Curiosity', 'Mastery', 'Freedom'])
  })
})
