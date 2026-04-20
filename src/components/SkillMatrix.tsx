import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { WorkProfile } from '../types'

const LEVEL_COLORS = ['', 'bg-red-200', 'bg-orange-200', 'bg-yellow-200', 'bg-lime-300', 'bg-green-400']
const LEVEL_TEXT = ['', '1', '2', '3', '4', '5']

interface Props {
  profiles: WorkProfile[]
}

export default function SkillMatrix({ profiles }: Props) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('')

  if (profiles.length < 1) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('matrix.title')}</h1>
        <div className="card text-center py-12 text-gray-400">{t('matrix.empty')}</div>
      </div>
    )
  }

  // Collect all unique skills
  const allSkills = Array.from(
    new Set(profiles.flatMap(p => p.skills.map(s => s.name)))
  ).filter(s => !filter || s.toLowerCase().includes(filter.toLowerCase()))
  .sort()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('matrix.title')}</h1>

      <div className="mb-4 flex items-center gap-2">
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
            className="text-xs text-brand-600 hover:text-brand-800 px-2 py-1 rounded hover:bg-brand-50"
          >
            ← {t('matrix.all_skills')}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 bg-gray-50 border border-gray-200 font-medium text-gray-600 min-w-[140px]">
                Name
              </th>
              {allSkills.map(skill => (
                <th key={skill} className="px-2 py-2 bg-gray-50 border border-gray-200 font-medium text-gray-600 text-xs whitespace-nowrap max-w-[80px]">
                  <div className="max-w-[72px] truncate" title={skill}>{skill}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profiles.map(profile => (
              <tr key={profile.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 border border-gray-200">
                  <div className="font-medium text-gray-900">{profile.name}</div>
                  <div className="text-xs text-gray-400">{profile.role}</div>
                </td>
                {allSkills.map(skill => {
                  const s = profile.skills.find(sk => sk.name === skill)
                  return (
                    <td key={skill} className="px-2 py-2 border border-gray-200 text-center">
                      {s ? (
                        <div className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold text-gray-800 ${LEVEL_COLORS[s.proficiency]}`}>
                          {LEVEL_TEXT[s.proficiency]}
                        </div>
                      ) : (
                        <span className="text-gray-200">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 mt-4 flex-wrap">
        {[1,2,3,4,5].map(l => (
          <div key={l} className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className={`w-5 h-5 rounded ${LEVEL_COLORS[l]} flex items-center justify-center text-xs font-semibold text-gray-700`}>{l}</div>
            <span>{t(`profile_form.proficiency.${l}`)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
