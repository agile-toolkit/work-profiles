import { useTranslation } from 'react-i18next'
import type { WorkProfile, ProficiencyLevel } from '../types'

interface Props {
  profiles: WorkProfile[]
  onBack: () => void
}

const DREYFUS_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600',
  1: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  2: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  3: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  4: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  5: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
}

export default function CompareView({ profiles, onBack }: Props) {
  const { t } = useTranslation()

  const skillNames = Array.from(
    new Set(profiles.flatMap(p => p.skills.map(s => s.name)))
  ).sort((a, b) => a.localeCompare(b))

  function getSkill(profile: WorkProfile, skillName: string) {
    return profile.skills.find(s => s.name === skillName) ?? null
  }

  function proficiencyLabel(level: ProficiencyLevel): string {
    return t(`profile_form.proficiency.${level}`)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary text-sm"
        >
          ← {t('nav.profiles')}
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{t('compare.title')}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 pr-4 font-medium text-gray-500 dark:text-gray-400 w-40 min-w-[8rem]">
                {t('profiles.title')}
              </th>
              {profiles.map(p => (
                <th
                  key={p.id}
                  className="py-2 px-3 text-center font-semibold text-gray-900 dark:text-gray-50 border-b border-gray-200 dark:border-gray-700 min-w-[9rem]"
                >
                  <div>{p.name}</div>
                  <div className="text-xs font-normal text-gray-400 dark:text-gray-500">{p.role}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {skillNames.map((skillName, i) => (
              <tr
                key={skillName}
                className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-950'}
              >
                <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {skillName}
                </td>
                {profiles.map(p => {
                  const skill = getSkill(p, skillName)
                  const level = skill?.proficiency ?? 0
                  return (
                    <td key={p.id} className="py-2 px-3 text-center">
                      {skill ? (
                        <span className={`inline-flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium ${DREYFUS_COLORS[level]}`}>
                          <span className="font-bold">{level}</span>
                          <span className="leading-tight">{proficiencyLabel(skill.proficiency)}</span>
                        </span>
                      ) : (
                        <span className={`inline-block px-2 py-1 rounded-lg text-xs ${DREYFUS_COLORS[0]}`}>
                          {t('compare.not_present')}
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
            {skillNames.length === 0 && (
              <tr>
                <td
                  colSpan={profiles.length + 1}
                  className="py-8 text-center text-gray-400 dark:text-gray-600"
                >
                  {t('matrix.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
