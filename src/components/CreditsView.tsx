import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ProjectCredit, WorkProfile } from '../types'

interface Props {
  credits: ProjectCredit[]
  profiles: WorkProfile[]
  onAdd: (credit: ProjectCredit) => void
  onDelete: (id: string) => void
}

export default function CreditsView({ credits, profiles, onAdd, onDelete }: Props) {
  const { t } = useTranslation()
  const [showForm, setShowForm] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [profileId, setProfileId] = useState(profiles[0]?.id ?? '')
  const [project, setProject] = useState('')
  const [contribution, setContribution] = useState('')
  const [points, setPoints] = useState(1)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const handleAdd = () => {
    if (!project.trim() || !profileId) return
    onAdd({
      id: crypto.randomUUID(),
      profileId,
      project: project.trim(),
      contribution: contribution.trim(),
      points,
      date,
    })
    setProject('')
    setContribution('')
    setPoints(1)
    setShowForm(false)
  }

  // Leaderboard: total points per person
  const totals = profiles.map(p => ({
    profile: p,
    total: credits.filter(c => c.profileId === p.id).reduce((s, c) => s + c.points, 0),
  })).sort((a, b) => b.total - a.total)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('credits.title')}</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowLeaderboard(v => !v)} className="btn-secondary text-sm">
            {showLeaderboard ? t('credits.leaderboard_off') : t('credits.leaderboard')}
          </button>
          <button onClick={() => setShowForm(v => !v)} className="btn-primary text-sm">
            + {t('credits.add')}
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      {showLeaderboard && totals.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">{t('credits.leaderboard')}</h2>
          <div className="space-y-2">
            {totals.filter(t => t.total > 0).map((entry, i) => (
              <div key={entry.profile.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-0.5">
                    <span className="font-medium">{entry.profile.name}</span>
                    <span className="text-brand-600 font-bold">{entry.total} {t('credits.total_points')}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div
                      className="h-1.5 bg-brand-500 rounded-full"
                      style={{ width: `${totals[0].total > 0 ? (entry.total / totals[0].total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="card mb-4 bg-gray-50">
          <div className="space-y-3">
            <div>
              <label className="label">{t('credits.person_label')}</label>
              <select className="input" value={profileId} onChange={e => setProfileId(e.target.value)}>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t('credits.project_label')}</label>
                <input className="input" placeholder={t('credits.project_placeholder')} value={project} onChange={e => setProject(e.target.value)} />
              </div>
              <div>
                <label className="label">{t('credits.points_label')}</label>
                <input type="number" min={1} max={10} className="input" value={points} onChange={e => setPoints(Number(e.target.value))} />
              </div>
            </div>
            <div>
              <label className="label">{t('credits.contribution_label')}</label>
              <input className="input" placeholder={t('credits.contribution_placeholder')} value={contribution} onChange={e => setContribution(e.target.value)} />
            </div>
            <div>
              <label className="label">{t('credits.date_label')}</label>
              <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={!project.trim()} className="btn-primary text-sm">{t('credits.save')}</button>
              <button onClick={() => setShowForm(false)} className="btn-ghost">{t('credits.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {credits.length === 0 ? (
        <div className="card text-center py-10 text-gray-400">{t('credits.empty')}</div>
      ) : (
        <div className="space-y-3">
          {[...credits].reverse().map(credit => {
            const person = profiles.find(p => p.id === credit.profileId)
            return (
              <div key={credit.id} className="card flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">{person?.name ?? 'Unknown'}</span>
                    <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">
                      +{credit.points} pts
                    </span>
                    <span className="text-xs text-gray-400">{credit.date}</span>
                  </div>
                  <div className="text-sm text-gray-700 font-medium">{credit.project}</div>
                  {credit.contribution && <div className="text-xs text-gray-500">{credit.contribution}</div>}
                </div>
                <button onClick={() => onDelete(credit.id)} aria-label={t('credits.delete')} className="text-gray-200 hover:text-red-400 text-xs">✕</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
