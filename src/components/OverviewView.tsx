import { useTranslation } from 'react-i18next'
import type { WorkProfile } from '../types'
import { SKILL_CATEGORIES } from '../types'

interface Props {
  profiles: WorkProfile[]
}

const CATEGORY_ORDER = [...SKILL_CATEGORIES]
const CAPACITY_BUCKETS = [
  { label: '0–25%', min: 0, max: 25 },
  { label: '26–50%', min: 26, max: 50 },
  { label: '51–75%', min: 51, max: 75 },
  { label: '76–100%', min: 76, max: 100 },
]

const RADAR_SIZE = 260
const RADAR_CENTER = RADAR_SIZE / 2
const RADAR_MAX_RADIUS = 90
const MAX_PROFICIENCY = 5

function radarPoint(index: number, total: number, value: number): [number, number] {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2
  const r = (value / MAX_PROFICIENCY) * RADAR_MAX_RADIUS
  return [RADAR_CENTER + r * Math.cos(angle), RADAR_CENTER + r * Math.sin(angle)]
}

function radarLabelPoint(index: number, total: number): [number, number] {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2
  const r = RADAR_MAX_RADIUS + 24
  return [RADAR_CENTER + r * Math.cos(angle), RADAR_CENTER + r * Math.sin(angle)]
}

function radarLabelAnchor(x: number): 'start' | 'middle' | 'end' {
  if (x < RADAR_CENTER - 20) return 'start'
  if (x > RADAR_CENTER + 20) return 'end'
  return 'middle'
}

function ringPoints(total: number, value: number): string {
  return Array.from({ length: total }, (_, i) => radarPoint(i, total, value).join(',')).join(' ')
}

export default function OverviewView({ profiles }: Props) {
  const { t } = useTranslation()
  const active = profiles.filter(p => !p.archived)

  if (active.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">{t('overview.title')}</h1>
        <div className="card text-center py-12 text-gray-400 dark:text-gray-500">{t('overview.empty')}</div>
      </div>
    )
  }

  const memberCount = active.length
  const avgCapacity = Math.round(active.reduce((sum, p) => sum + (p.capacity ?? 0), 0) / memberCount)
  const uniqueSkillCount = new Set(active.flatMap(p => p.skills.map(s => s.name))).size
  const totalEndorsements = active.reduce(
    (sum, p) => sum + p.skills.reduce((s, sk) => s + (sk.endorsedBy?.length ?? 0), 0),
    0
  )
  const today = new Date().toISOString().slice(0, 10)
  const oooCount = active.filter(p => p.oooUntil && p.oooUntil >= today).length
  const timezoneCount = new Set(active.filter(p => p.timezone).map(p => p.timezone)).size

  const stats = [
    { label: t('overview.stat_members'), value: memberCount },
    { label: t('overview.stat_avg_capacity'), value: `${avgCapacity}%` },
    { label: t('overview.stat_skills'), value: uniqueSkillCount },
    { label: t('overview.stat_endorsements'), value: totalEndorsements },
    { label: t('overview.stat_ooo'), value: oooCount },
    { label: t('overview.stat_timezones'), value: timezoneCount },
  ]

  // Role distribution
  const roleCounts = new Map<string, number>()
  for (const p of active) {
    const role = p.role.trim() || t('overview.no_role')
    roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1)
  }
  const sortedRoles = [...roleCounts.entries()].sort((a, b) => b[1] - a[1])
  const topRoles = sortedRoles.slice(0, 8)
  const otherRolesCount = sortedRoles.slice(8).reduce((sum, [, count]) => sum + count, 0)
  const maxRoleCount = Math.max(...topRoles.map(([, count]) => count), otherRolesCount, 1)

  // Capacity histogram
  const bucketCounts = CAPACITY_BUCKETS.map(b => ({
    ...b,
    count: active.filter(p => (p.capacity ?? 0) >= b.min && (p.capacity ?? 0) <= b.max).length,
  }))
  const maxBucketCount = Math.max(...bucketCounts.map(b => b.count), 1)

  // Skill category radar
  const categoryTotals = new Map<string, { sum: number; count: number }>()
  for (const cat of CATEGORY_ORDER) categoryTotals.set(cat, { sum: 0, count: 0 })
  let totalSkillInstances = 0
  for (const p of active) {
    for (const s of p.skills) {
      totalSkillInstances++
      const cat = s.category && categoryTotals.has(s.category) ? s.category : 'Other'
      const entry = categoryTotals.get(cat)!
      entry.sum += s.proficiency
      entry.count += 1
    }
  }
  const radarAxes = CATEGORY_ORDER.map(cat => {
    const { sum, count } = categoryTotals.get(cat)!
    return { category: cat, avg: count > 0 ? sum / count : 0 }
  })

  // Most endorsed skills
  const skillHolders = new Map<string, Set<string>>()
  const skillEndorseCount = new Map<string, number>()
  for (const p of active) {
    for (const s of p.skills) {
      if (!skillHolders.has(s.name)) skillHolders.set(s.name, new Set())
      skillHolders.get(s.name)!.add(p.name)
      skillEndorseCount.set(s.name, (skillEndorseCount.get(s.name) ?? 0) + (s.endorsedBy?.length ?? 0))
    }
  }
  const topEndorsed = [...skillEndorseCount.entries()]
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count, holders: Array.from(skillHolders.get(name) ?? []) }))

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">{t('overview.title')}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className="card text-center py-4">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">{t('overview.section_roles')}</h2>
          <div className="space-y-2">
            {topRoles.map(([role, count]) => (
              <div key={role} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm text-gray-600 dark:text-gray-400 truncate" title={role}>{role}</span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <div className="h-2 bg-brand-500 rounded-full" style={{ width: `${(count / maxRoleCount) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-xs text-gray-500 dark:text-gray-400">{count}</span>
              </div>
            ))}
            {otherRolesCount > 0 && (
              <div className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm text-gray-400 dark:text-gray-500">
                  {t('overview.other_roles', { count: otherRolesCount })}
                </span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <div className="h-2 bg-gray-400 dark:bg-gray-600 rounded-full" style={{ width: `${(otherRolesCount / maxRoleCount) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-xs text-gray-500 dark:text-gray-400">{otherRolesCount}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">{t('overview.section_capacity')}</h2>
          <div className="flex items-end justify-around gap-4 h-24">
            {bucketCounts.map(b => (
              <div key={b.label} className="flex flex-col items-center justify-end h-full flex-1">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{b.count}</span>
                <div
                  className="w-full max-w-[48px] bg-brand-500 rounded-t-lg"
                  style={{ height: `${b.count > 0 ? Math.max((b.count / maxBucketCount) * 100, 6) : 0}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-around gap-4 mt-2">
            {bucketCounts.map(b => (
              <span key={b.label} className="flex-1 text-center text-[11px] text-gray-400 dark:text-gray-500">{b.label}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">{t('overview.section_radar')}</h2>
          {totalSkillInstances === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">{t('overview.radar_empty')}</div>
          ) : (
            <svg viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`} className="w-full max-w-xs mx-auto">
              {[1, 2, 3].map(f => (
                <polygon
                  key={f}
                  points={ringPoints(radarAxes.length, (MAX_PROFICIENCY * f) / 3)}
                  fill="none"
                  className="stroke-gray-200 dark:stroke-gray-700"
                  strokeWidth={1}
                />
              ))}
              {radarAxes.map((axis, i) => {
                const [x, y] = radarPoint(i, radarAxes.length, MAX_PROFICIENCY)
                return (
                  <line
                    key={axis.category}
                    x1={RADAR_CENTER}
                    y1={RADAR_CENTER}
                    x2={x}
                    y2={y}
                    className="stroke-gray-200 dark:stroke-gray-700"
                    strokeWidth={1}
                  />
                )
              })}
              <polygon
                points={radarAxes.map((axis, i) => radarPoint(i, radarAxes.length, axis.avg).join(',')).join(' ')}
                className="fill-brand-500/30 stroke-brand-600 dark:stroke-brand-400"
                strokeWidth={2}
              />
              {radarAxes.map((axis, i) => {
                const [x, y] = radarPoint(i, radarAxes.length, axis.avg)
                return <circle key={axis.category} cx={x} cy={y} r={3} className="fill-brand-600 dark:fill-brand-400" />
              })}
              {radarAxes.map((axis, i) => {
                const [x, y] = radarLabelPoint(i, radarAxes.length)
                return (
                  <text
                    key={axis.category}
                    x={x}
                    y={y}
                    textAnchor={radarLabelAnchor(x)}
                    dominantBaseline="middle"
                    className="fill-gray-500 dark:fill-gray-400"
                    style={{ fontSize: '9px' }}
                  >
                    {axis.category}
                  </text>
                )
              })}
            </svg>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">{t('overview.section_endorsed')}</h2>
          {topEndorsed.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">{t('overview.endorsed_empty')}</div>
          ) : (
            <ol className="space-y-2">
              {topEndorsed.map((skill, i) => (
                <li key={skill.name} className="flex items-center gap-3 text-sm">
                  <span className="w-5 text-gray-400 dark:text-gray-500 font-bold">{i + 1}</span>
                  <span
                    className="flex-1 font-medium text-gray-900 dark:text-gray-50 truncate"
                    title={skill.holders.join(', ')}
                  >
                    {skill.name}
                  </span>
                  <span className="text-brand-600 dark:text-brand-400 font-semibold">✓{skill.count}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
