import { useTranslation } from 'react-i18next'
import type { WorkProfile } from '../types'

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
          <h3 className="font-semibold text-gray-900">{profile.name}</h3>
          <p className="text-sm text-gray-500">{profile.role}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="btn-ghost text-xs">{t('profiles.edit')}</button>
          <button onClick={onDelete} className="btn-ghost text-xs text-red-400">{t('profiles.delete')}</button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 text-xs text-gray-500 mb-3">
        <span>{profile.skills.length} {t('profiles.skills_count')}</span>
        <span>{t('profiles.capacity')}: {profile.capacity}%</span>
        {credits > 0 && <span className="text-brand-600 font-medium">{credits} pts</span>}
      </div>

      {/* Skills */}
      {profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {profile.skills.slice(0, 6).map(skill => (
            <div key={skill.id} className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-0.5">
              <div className={`w-2 h-2 rounded-full ${PROFICIENCY_COLORS[skill.proficiency]}`} />
              <span className="text-xs text-gray-700">{skill.name}</span>
            </div>
          ))}
          {profile.skills.length > 6 && (
            <span className="text-xs text-gray-400">+{profile.skills.length - 6} more</span>
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
