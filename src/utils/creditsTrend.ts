import type { ProjectCredit } from '../types'

export interface MonthlyTrend {
  monthKeys: string[]
  values: number[]
}

export function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7)
}

// Chronologically ascending month keys ("YYYY-MM"), ending at the
// reference month. `count` of 6 means the reference month plus the 5
// before it.
export function lastMonthKeys(count: number, reference: Date = new Date()): string[] {
  const keys: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(reference.getFullYear(), reference.getMonth() - i, 1)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return keys
}

export function monthlyTrendForProfile(
  credits: ProjectCredit[],
  profileId: string,
  months = 6,
  reference: Date = new Date()
): MonthlyTrend {
  const monthKeys = lastMonthKeys(months, reference)
  const sums = new Map<string, number>()
  for (const c of credits) {
    if (c.profileId !== profileId) continue
    const key = monthKey(c.date)
    sums.set(key, (sums.get(key) ?? 0) + c.points)
  }
  return { monthKeys, values: monthKeys.map(k => sums.get(k) ?? 0) }
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatMonthLabel(key: string): string {
  const [, month] = key.split('-')
  const idx = parseInt(month, 10) - 1
  return MONTH_LABELS[idx] ?? key
}

// A person needs at least 2 distinct months with any credited points for
// a trend to be meaningful (a single data point has no direction).
export function hasEnoughDataForTrend(credits: ProjectCredit[], profileId: string): boolean {
  const months = new Set(credits.filter(c => c.profileId === profileId).map(c => monthKey(c.date)))
  return months.size >= 2
}
