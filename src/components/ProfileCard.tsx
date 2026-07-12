import { useTranslation } from 'react-i18next'
import type { WorkProfile } from '../types'

function getTzAbbr(tz: string): string {
  try {
    const parts = Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'short' })
      .formatToParts(new Date())
    return parts.find(p => p.type === 'timeZoneName')?.value ?? tz.split('/').pop()!.replace(/_/g, ' ')
  } catch {
    return tz
  }
}

function isOoo(oooUntil: string | undefined): boolean {
  if (!oooUntil) return false
  return new Date(oooUntil) >= new Date(new Date().toISOString().slice(0, 10))
}

const PROFICIENCY_COLORS = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-400', 'bg-green-500']

interface Props {
  profile: WorkProfile
  credits: number
  onEdit: () => void
  onDelete: () => void
}

export default function ProfileCard({ profile, credits, onEdit, onDelete }: Props) {
  const { t } = useTranslation()

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">{profile.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{profile.role}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="btn-ghost text-xs">{t('profiles.edit')}</button>
          <button onClick={onDelete} className="btn-ghost text-xs text-red-400">{t('profiles.delete')}</button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
        <span>{profile.skills.length} {t('profiles.skills_count')}</span>
        <span>{t('profiles.capacity')}: {profile.capacity}%</span>
        {credits > 0 && <span className="text-brand-600 font-medium">{credits} pts</span>}
        {profile.timezone && (
          <span title={profile.timezone}>
            🕐 {getTzAbbr(profile.timezone)}
            {profile.workingHours && ` ${profile.workingHours.start}–${profile.workingHours.end}`}
          </span>
        )}
        {isOoo(profile.oooUntil) && (
          <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 rounded px-1.5 py-0.5 font-medium">
            {t('profiles.ooo_badge')} {t('profiles.ooo_until', { date: profile.oooUntil })}
          </span>
        )}
      </div>

      {/* Skills */}
      {profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {profile.skills.slice(0, 6).map(skill => (
            <div key={skill.id} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-0.5">
              <div className={`w-2 h-2 rounded-full ${PROFICIENCY_COLORS[skill.proficiency]}`} />
              <span className="text-xs text-gray-700 dark:text-gray-300">{skill.name}</span>
              {skill.targetProficiency != null && (
                skill.targetProficiency <= skill.proficiency
                  ? <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 leading-none" title={t('profile_card.target_met')}>✓</span>
                  : <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 leading-none">→{skill.targetProficiency}</span>
              )}
            </div>
          ))}
          {profile.skills.length > 6 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">+{profile.skills.length - 6} more</span>
          )}
        </div>
      )}

      {/* Work types */}
      {profile.workTypes.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {profile.workTypes.map(wt => (
            <span key={wt} className="text-xs bg-brand-100 text-brand-700 rounded px-1.5 py-0.5">
              {t(`profile_form.work_types.${wt}`)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
