import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { WorkProfile, ProficiencyLevel } from '../types'
import { SKILL_CATEGORIES } from '../types'
import { CloseIcon, CheckIcon } from './icons'

const LEVEL_COLORS = ['', 'bg-red-200', 'bg-orange-200', 'bg-yellow-200', 'bg-lime-300', 'bg-green-400']
const LEVEL_TEXT = ['', '1', '2', '3', '4', '5']

function getTzAbbr(tz: string): string {
  try {
    const parts = Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'short' })
      .formatToParts(new Date())
    return parts.find(p => p.type === 'timeZoneName')?.value ?? tz.split('/').pop()!.replace(/_/g, ' ')
  } catch {
    return tz
  }
}

function getSkillDelta(proficiency: ProficiencyLevel, history?: { date: string; proficiency: ProficiencyLevel }[]): number | null {
  if (!history || history.length === 0) return null
  return proficiency - history[history.length - 1].proficiency
}

interface Props {
  profiles: WorkProfile[]
}

export default function SkillMatrix({ profiles }: Props) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('')
  const [groupByCategory, setGroupByCategory] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [showTargets, setShowTargets] = useState(false)
  const [showMentoring, setShowMentoring] = useState(false)

  if (profiles.length < 1) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">{t('matrix.title')}</h1>
        <div className="card text-center py-12 text-gray-400 dark:text-gray-500">{t('matrix.empty')}</div>
      </div>
    )
  }

  // Build skill→category map (first profile that has a category for that skill wins)
  const skillCategoryMap = new Map<string, string>()
  for (const p of profiles) {
    for (const s of p.skills) {
      if (!skillCategoryMap.has(s.name) && s.category) {
        skillCategoryMap.set(s.name, s.category)
      }
    }
  }

  // Collect all unique skills, apply text filter + category pill filter
  const allSkillNames = Array.from(
    new Set(profiles.flatMap(p => p.skills.map(s => s.name)))
  )
    .filter(s => !filter || s.toLowerCase().includes(filter.toLowerCase()))
    .filter(s => !categoryFilter || (skillCategoryMap.get(s) ?? 'Other') === categoryFilter)
    .sort()

  // Categories that actually appear in the (unfiltered by category) skill set
  const allSkillNamesUnfiltered = Array.from(
    new Set(profiles.flatMap(p => p.skills.map(s => s.name)))
  ).filter(s => !filter || s.toLowerCase().includes(filter.toLowerCase()))
  const presentCategories = Array.from(
    new Set(allSkillNamesUnfiltered.map(s => skillCategoryMap.get(s) ?? 'Other'))
  )

  // When grouped, sort skills by canonical category order then name
  const getCategory = (name: string) => skillCategoryMap.get(name) ?? 'Other'
  const categoryOrder = [...SKILL_CATEGORIES, 'Other']

  const sortedSkills = groupByCategory
    ? [...allSkillNames].sort((a, b) => {
        const catA = categoryOrder.indexOf(getCategory(a))
        const catB = categoryOrder.indexOf(getCategory(b))
        return catA !== catB ? catA - catB : a.localeCompare(b)
      })
    : allSkillNames

  // Group structure for header rendering
  type SkillGroup = { category: string; skills: string[] }
  const skillGroups: SkillGroup[] = groupByCategory
    ? categoryOrder
        .map(cat => ({ category: cat, skills: sortedSkills.filter(s => getCategory(s) === cat) }))
        .filter(g => g.skills.length > 0)
    : [{ category: '', skills: sortedSkills }]

  // Compute mentor pairings across all skills (not filtered)
  const allUniqueSkills = Array.from(new Set(profiles.flatMap(p => p.skills.map(s => s.name)))).sort()
  const pairsBySkill = new Map<string, { mentor: string; learner: string }[]>()
  for (const skill of allUniqueSkills) {
    const mentors = profiles.filter(p => {
      const s = p.skills.find(sk => sk.name === skill)
      return s && s.proficiency >= 4
    })
    const learners = profiles.filter(p => {
      const s = p.skills.find(sk => sk.name === skill)
      return s && s.proficiency <= 2
    })
    if (mentors.length > 0 && learners.length > 0) {
      const pairs: { mentor: string; learner: string }[] = []
      for (const m of mentors) {
        for (const l of learners) {
          if (m.id !== l.id) pairs.push({ mentor: m.name, learner: l.name })
        }
      }
      if (pairs.length > 0) pairsBySkill.set(skill, pairs)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">{t('matrix.title')}</h1>

      {/* Controls row */}
      <div className="mb-3 flex items-center gap-2 flex-wrap">
        <input
          className="input max-w-xs"
          placeholder={t('matrix.filter_skill')}
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        {filter && (
          <button
            type="button"
            onClick={() => setFilter('')}
            className="text-xs text-brand-600 hover:text-brand-800 dark:text-brand-400 px-2 py-1 rounded hover:bg-brand-50 dark:hover:bg-gray-800"
          >
            ← {t('matrix.all_skills')}
          </button>
        )}
        <button
          type="button"
          onClick={() => { setGroupByCategory(g => !g); setCategoryFilter(null) }}
          className={`ml-auto text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
            groupByCategory
              ? 'bg-brand-600 text-white border-brand-600'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          {t('matrix.group_by_category')}
        </button>
        <button
          type="button"
          onClick={() => setShowTargets(s => !s)}
          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
            showTargets
              ? 'bg-amber-500 text-white border-amber-500'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          {t('matrix.show_targets')}
        </button>
      </div>

      {/* Category pill filter row — only shown when NOT grouped */}
      {!groupByCategory && presentCategories.length > 0 && (
        <div className="mb-3 flex gap-1.5 flex-wrap">
          {presentCategories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
          {categoryFilter && (
            <button
              type="button"
              onClick={() => setCategoryFilter(null)}
              className="text-xs text-brand-600 hover:text-brand-800 dark:text-brand-400 px-2 py-1 rounded hover:bg-brand-50 dark:hover:bg-gray-800"
            >
              <CloseIcon className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            {groupByCategory && (
              <tr>
                <th rowSpan={2} scope="col" className="text-left px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-gray-600 dark:text-gray-400 min-w-[140px]">
                  Name
                </th>
                <th rowSpan={2} scope="col" className="px-2 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                  {t('matrix.timezone_col')}
                </th>
                {skillGroups.map(g => (
                  <th
                    key={g.category}
                    scope="colgroup"
                    colSpan={g.skills.length}
                    className="px-2 py-1 bg-brand-50 dark:bg-brand-950 border border-gray-200 dark:border-gray-700 font-semibold text-brand-700 dark:text-brand-300 text-xs text-center"
                  >
                    {g.category}
                  </th>
                ))}
              </tr>
            )}
            <tr>
              {!groupByCategory && (
                <>
                  <th scope="col" className="text-left px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-gray-600 dark:text-gray-400 min-w-[140px]">
                    Name
                  </th>
                  <th scope="col" className="px-2 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                    {t('matrix.timezone_col')}
                  </th>
                </>
              )}
              {sortedSkills.map(skill => (
                <th key={skill} scope="col" className="px-2 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap max-w-[80px]">
                  <div className="max-w-[72px] truncate" title={skill}>{skill}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profiles.map(profile => (
              <React.Fragment key={profile.id}>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <th scope="row" className="px-3 py-2 border border-gray-200 dark:border-gray-700 text-left font-normal">
                    <div className="font-medium text-gray-900 dark:text-gray-50">{profile.name}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{profile.role}</div>
                  </th>
                  <td className="px-2 py-2 border border-gray-200 dark:border-gray-700 text-center">
                    {profile.timezone ? (
                      <span
                        className="text-xs text-gray-600 dark:text-gray-400 font-mono"
                        title={profile.timezone}
                      >
                        {getTzAbbr(profile.timezone)}
                      </span>
                    ) : (
                      <span className="text-gray-200 dark:text-gray-700">—</span>
                    )}
                  </td>
                  {sortedSkills.map(skill => {
                    const s = profile.skills.find(sk => sk.name === skill)
                    const delta = s ? getSkillDelta(s.proficiency, s.history) : null
                    return (
                      <td key={skill} className="px-2 py-2 border border-gray-200 dark:border-gray-700 text-center">
                        {s ? (
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <div
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold text-gray-800 dark:text-gray-900 ${LEVEL_COLORS[s.proficiency]}`}
                              title={s.endorsedBy && s.endorsedBy.length > 0 ? t('matrix.endorsed_tooltip', { count: s.endorsedBy.length, names: s.endorsedBy.join(', ') }) : undefined}
                            >
                              {LEVEL_TEXT[s.proficiency]}
                            </div>
                            {delta !== null && (
                              <span
                                className={`text-[10px] font-medium leading-none ${delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-500' : 'text-gray-400'}`}
                                title={t('matrix.delta_tooltip', { delta: delta > 0 ? `+${delta}` : String(delta) })}
                              >
                                {delta > 0 ? `↑${delta}` : delta < 0 ? `↓${Math.abs(delta)}` : '='}
                              </span>
                            )}
                            {s.endorsedBy && s.endorsedBy.length > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] leading-none text-green-600 dark:text-green-400 font-medium">
                                <CheckIcon className="w-3 h-3" />{s.endorsedBy.length}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-200 dark:text-gray-700">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
                {showTargets && (
                  <tr className="bg-amber-50/60 dark:bg-amber-950/20">
                    <td className="px-3 py-1 border border-gray-200 dark:border-gray-700 text-[10px] text-amber-600 dark:text-amber-400 font-medium whitespace-nowrap">
                      {t('matrix.show_targets')}
                    </td>
                    <td className="px-2 py-1 border border-gray-200 dark:border-gray-700" />
                    {sortedSkills.map(skill => {
                      const s = profile.skills.find(sk => sk.name === skill)
                      if (!s || s.targetProficiency == null) {
                        return <td key={skill} className="px-2 py-1 border border-gray-200 dark:border-gray-700" />
                      }
                      const met = s.targetProficiency <= s.proficiency
                      return (
                        <td key={skill} className="px-2 py-1 border border-gray-200 dark:border-gray-700 text-center">
                          {met
                            ? <span title={t('profile_card.target_met')}><CheckIcon className="w-3 h-3 text-green-600 dark:text-green-400" /></span>
                            : <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">→{s.targetProficiency}</span>
                          }
                        </td>
                      )
                    })}
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 mt-4 flex-wrap">
        {[1,2,3,4,5].map(l => (
          <div key={l} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <div className={`w-5 h-5 rounded ${LEVEL_COLORS[l]} flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-900`}>{l}</div>
            <span>{t(`profile_form.proficiency.${l}`)}</span>
          </div>
        ))}
      </div>

      {/* Mentoring pairs panel */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowMentoring(s => !s)}
          className={`text-sm px-4 py-2 rounded-lg border font-medium transition-colors ${
            showMentoring
              ? 'bg-brand-600 text-white border-brand-600'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          {t('matrix.mentoring_title')} {showMentoring ? '▲' : '▼'}
        </button>

        {showMentoring && (
          <div className="mt-3 card p-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50 mb-3">{t('matrix.mentoring_title')}</h2>
            {pairsBySkill.size === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">{t('matrix.mentoring_empty')}</p>
            ) : (
              <div className="space-y-3">
                {Array.from(pairsBySkill.entries()).map(([skill, pairs]) => (
                  <div key={skill}>
                    <div className="text-xs font-semibold text-brand-700 dark:text-brand-300 mb-1.5">{skill}</div>
                    <div className="flex flex-wrap gap-2">
                      {pairs.map((pair, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5"
                        >
                          <span className="text-green-700 dark:text-green-400 font-medium">{t('matrix.mentor_label')}: {pair.mentor}</span>
                          <span className="text-gray-300 dark:text-gray-600">→</span>
                          <span className="text-amber-700 dark:text-amber-400 font-medium">{t('matrix.learner_label')}: {pair.learner}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
