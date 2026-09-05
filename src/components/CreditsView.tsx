import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ProjectCredit, WorkProfile } from '../types'
import { CloseIcon } from './icons'
import { monthlyTrendForProfile, formatMonthLabel, hasEnoughDataForTrend } from '../utils/creditsTrend'

const SPARK_WIDTH = 60
const SPARK_HEIGHT = 20
const TREND_MONTHS = 6
const TREND_CHART_HEIGHT = 100
const TREND_BAR_WIDTH = 28
const TREND_BAR_GAP = 12
const TREND_TOP_PADDING = 16

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1)
  const barWidth = SPARK_WIDTH / values.length
  return (
    <svg width={SPARK_WIDTH} height={SPARK_HEIGHT} viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`} className="shrink-0" aria-hidden="true">
      {values.map((v, i) => {
        const h = (v / max) * SPARK_HEIGHT
        return (
          <rect
            key={i}
            x={i * barWidth + 1}
            y={SPARK_HEIGHT - h}
            width={Math.max(barWidth - 2, 1)}
            height={h}
            className="fill-brand-400 dark:fill-brand-500"
          />
        )
      })}
    </svg>
  )
}

function TrendChart({ monthKeys, values }: { monthKeys: string[]; values: number[] }) {
  const max = Math.max(...values, 1)
  const chartWidth = monthKeys.length * (TREND_BAR_WIDTH + TREND_BAR_GAP) + TREND_BAR_GAP
  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${TREND_TOP_PADDING + TREND_CHART_HEIGHT + 24}`}
      width={chartWidth}
      height={TREND_TOP_PADDING + TREND_CHART_HEIGHT + 24}
    >
      {monthKeys.map((key, i) => {
        const value = values[i]
        const barHeight = (value / max) * TREND_CHART_HEIGHT
        const x = TREND_BAR_GAP + i * (TREND_BAR_WIDTH + TREND_BAR_GAP)
        const y = TREND_TOP_PADDING + TREND_CHART_HEIGHT - barHeight
        return (
          <g key={key}>
            <title>{`${formatMonthLabel(key)}: ${value}`}</title>
            <rect x={x} y={y} width={TREND_BAR_WIDTH} height={Math.max(barHeight, value > 0 ? 2 : 0)} rx={3} className="fill-brand-600" />
            {value > 0 && (
              <text x={x + TREND_BAR_WIDTH / 2} y={y - 4} textAnchor="middle" className="fill-gray-600 dark:fill-gray-300 text-[10px] font-medium">
                {value}
              </text>
            )}
            <text x={x + TREND_BAR_WIDTH / 2} y={TREND_TOP_PADDING + TREND_CHART_HEIGHT + 16} textAnchor="middle" className="fill-gray-400 dark:fill-gray-500 text-[10px]">
              {formatMonthLabel(key)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

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
  const [showTrend, setShowTrend] = useState(false)
  const activeProfiles = profiles.filter(p => !p.archived)
  const [profileId, setProfileId] = useState(activeProfiles[0]?.id ?? '')
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{t('credits.title')}</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowLeaderboard(v => !v)} className="btn-secondary text-sm">
            {showLeaderboard ? t('credits.leaderboard_off') : t('credits.leaderboard')}
          </button>
          <button onClick={() => setShowTrend(v => !v)} className="btn-secondary text-sm">
            {showTrend ? t('credits.trend_off') : t('credits.trend_toggle')}
          </button>
          <button onClick={() => setShowForm(v => !v)} className="btn-primary text-sm">
            + {t('credits.add')}
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      {showLeaderboard && totals.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">{t('credits.leaderboard')}</h2>
          <div className="space-y-2">
            {totals.filter(t => t.total > 0).map(entry => (
              <div key={entry.profile.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-0.5">
                    <span className="font-medium">{entry.profile.name}</span>
                    <span className="flex items-center gap-2">
                      <Sparkline values={monthlyTrendForProfile(credits, entry.profile.id, TREND_MONTHS).values} />
                      <span className="text-brand-600 font-bold">{entry.total} {t('credits.total_points')}</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
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

      {/* Trend */}
      {showTrend && (
        <div className="card mb-6 space-y-6">
          <h2 className="font-semibold text-gray-900 dark:text-gray-50">{t('credits.trend_title')}</h2>
          {totals.filter(t => t.total > 0).length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">{t('credits.empty')}</p>
          ) : (
            totals.filter(t => t.total > 0).map(entry => {
              const trend = monthlyTrendForProfile(credits, entry.profile.id, TREND_MONTHS)
              return (
                <div key={entry.profile.id}>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">{entry.profile.name}</div>
                  {hasEnoughDataForTrend(credits, entry.profile.id) ? (
                    <div className="overflow-x-auto">
                      <TrendChart monthKeys={trend.monthKeys} values={trend.values} />
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t('credits.trend_empty')}</p>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="card mb-4 bg-gray-50 dark:bg-gray-800">
          <div className="space-y-3">
            <div>
              <label className="label">{t('credits.person_label')}</label>
              <select className="input" value={profileId} onChange={e => setProfileId(e.target.value)}>
                {activeProfiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
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
        <div className="card text-center py-10 text-gray-400 dark:text-gray-500">{t('credits.empty')}</div>
      ) : (
        <div className="space-y-3">
          {[...credits].reverse().map(credit => {
            const person = profiles.find(p => p.id === credit.profileId)
            return (
              <div key={credit.id} className="card flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium text-sm ${person?.archived ? 'text-gray-400 dark:text-gray-600 line-through' : 'text-gray-900 dark:text-gray-50'}`}>{person?.name ?? 'Unknown'}</span>
                    <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">
                      +{credit.points} pts
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{credit.date}</span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">{credit.project}</div>
                  {credit.contribution && <div className="text-xs text-gray-500 dark:text-gray-400">{credit.contribution}</div>}
                </div>
                <button onClick={() => onDelete(credit.id)} aria-label={t('credits.delete')} className="text-gray-400 dark:text-gray-500 hover:text-red-400 text-xs"><CloseIcon className="w-3 h-3" /></button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
