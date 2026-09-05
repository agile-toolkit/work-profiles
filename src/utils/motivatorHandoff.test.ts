import { describe, it, expect, beforeEach } from 'vitest'
import {
  parseMotivatorsParam,
  readMotivatorSnapshot,
  clearMotivatorSnapshot,
  topMotivatorLabels,
  isSnapshotStale,
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

describe('isSnapshotStale', () => {
  it('returns false for a snapshot from today', () => {
    const reference = new Date('2026-09-01T12:00:00Z')
    expect(isSnapshotStale({ ...SAMPLE, date: '2026-09-01' }, reference)).toBe(false)
  })

  it('returns false for a snapshot exactly at the 30-day threshold', () => {
    const reference = new Date('2026-10-01T00:00:00Z')
    expect(isSnapshotStale({ ...SAMPLE, date: '2026-09-01' }, reference)).toBe(false)
  })

  it('returns true for a snapshot older than 30 days', () => {
    const reference = new Date('2026-10-15T00:00:00Z')
    expect(isSnapshotStale({ ...SAMPLE, date: '2026-09-01' }, reference)).toBe(true)
  })

  it('returns false for an unparsable date instead of throwing', () => {
    const reference = new Date('2026-10-15T00:00:00Z')
    expect(isSnapshotStale({ ...SAMPLE, date: 'not-a-date' }, reference)).toBe(false)
  })
})
