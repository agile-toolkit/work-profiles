/**
 * Moving Motivators' "Export to Work Profiles" button (`ResultsView.tsx`,
 * `buildWorkProfilesSnapshot`) sends the same payload two ways: a one-shot
 * `?motivators=<base64 JSON>` query param on the `window.open()` URL, and a
 * same-origin `work-profiles:motivatorSnapshot` localStorage write (so it's
 * still available if this tab wasn't the one opened, or on a later visit).
 */

export interface MotivatorSnapshot {
  date: string
  ranked: string[]
  topMotivators: [string, string, string] | string[]
}

const SNAPSHOT_KEY = 'work-profiles:motivatorSnapshot'

function capitalize(id: string): string {
  return id.length > 0 ? id.charAt(0).toUpperCase() + id.slice(1) : id
}

export function parseMotivatorsParam(search: string): MotivatorSnapshot | null {
  const raw = new URLSearchParams(search).get('motivators')
  if (!raw) return null
  try {
    return JSON.parse(decodeURIComponent(atob(raw))) as MotivatorSnapshot
  } catch {
    return null
  }
}

export function readMotivatorSnapshot(): MotivatorSnapshot | null {
  const raw = localStorage.getItem(SNAPSHOT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as MotivatorSnapshot
  } catch {
    return null
  }
}

export function clearMotivatorSnapshot(): void {
  localStorage.removeItem(SNAPSHOT_KEY)
}

export function topMotivatorLabels(snapshot: MotivatorSnapshot): string[] {
  return snapshot.topMotivators.map(capitalize)
}
