import { describe, it, expect } from 'vitest'
import { monthKey, lastMonthKeys, monthlyTrendForProfile, formatMonthLabel, hasEnoughDataForTrend } from './creditsTrend'
import type { ProjectCredit } from '../types'

function credit(profileId: string, date: string, points: number): ProjectCredit {
  return { id: crypto.randomUUID(), profileId, project: 'P', contribution: '', points, date }
}

describe('monthKey', () => {
  it('extracts the YYYY-MM prefix from an ISO date', () => {
    expect(monthKey('2026-03-15')).toBe('2026-03')
  })
})

describe('lastMonthKeys', () => {
  it('returns the given count of months ending at the reference month, ascending', () => {
    const reference = new Date(2026, 2, 15) // March 2026
    expect(lastMonthKeys(6, reference)).toEqual([
      '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03',
    ])
  })

  it('handles a year boundary correctly', () => {
    const reference = new Date(2026, 0, 1) // January 2026
    expect(lastMonthKeys(3, reference)).toEqual(['2025-11', '2025-12', '2026-01'])
  })

  it('returns just the reference month when count is 1', () => {
    const reference = new Date(2026, 5, 1)
    expect(lastMonthKeys(1, reference)).toEqual(['2026-06'])
  })
})

describe('monthlyTrendForProfile', () => {
  const reference = new Date(2026, 2, 15) // March 2026

  it('sums points per month for the given profile only', () => {
    const credits = [
      credit('alice', '2026-01-05', 3),
      credit('alice', '2026-01-20', 2),
      credit('alice', '2026-03-01', 5),
      credit('bob', '2026-03-01', 100),
    ]
    const trend = monthlyTrendForProfile(credits, 'alice', 6, reference)
    expect(trend.monthKeys).toEqual(['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'])
    expect(trend.values).toEqual([0, 0, 0, 5, 0, 5])
  })

  it('returns all zeros for a profile with no credits', () => {
    const trend = monthlyTrendForProfile([], 'alice', 6, reference)
    expect(trend.values).toEqual([0, 0, 0, 0, 0, 0])
  })

  it('respects a custom month count', () => {
    const credits = [credit('alice', '2026-02-01', 4)]
    const trend = monthlyTrendForProfile(credits, 'alice', 3, reference)
    expect(trend.monthKeys).toEqual(['2026-01', '2026-02', '2026-03'])
    expect(trend.values).toEqual([0, 4, 0])
  })
})

describe('formatMonthLabel', () => {
  it('formats a month key as a short month name', () => {
    expect(formatMonthLabel('2026-01')).toBe('Jan')
    expect(formatMonthLabel('2026-12')).toBe('Dec')
  })

  it('falls back to the raw key for an unrecognized month', () => {
    expect(formatMonthLabel('2026-13')).toBe('2026-13')
  })
})

describe('hasEnoughDataForTrend', () => {
  it('returns false when there are no credits for the profile', () => {
    expect(hasEnoughDataForTrend([], 'alice')).toBe(false)
  })

  it('returns false when all credits fall in a single month', () => {
    const credits = [credit('alice', '2026-01-05', 1), credit('alice', '2026-01-20', 2)]
    expect(hasEnoughDataForTrend(credits, 'alice')).toBe(false)
  })

  it('returns true when credits span 2 or more distinct months', () => {
    const credits = [credit('alice', '2026-01-05', 1), credit('alice', '2026-02-01', 2)]
    expect(hasEnoughDataForTrend(credits, 'alice')).toBe(true)
  })

  it('only counts the given profile\'s credits', () => {
    const credits = [credit('alice', '2026-01-05', 1), credit('bob', '2026-02-01', 2)]
    expect(hasEnoughDataForTrend(credits, 'alice')).toBe(false)
  })
})
