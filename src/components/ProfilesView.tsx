import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { WorkProfile, Skill, ProficiencyLevel, WorkType } from '../types'

const WORK_TYPES: WorkType[] = [
  'design',
  'development',
  'testing',
  'analysis',
  'facilitation',
  'writing',
  'mentoring',
  'ops',
]

const LEVEL_COLORS: Record<number, string> = {
  1: 'bg-slate-200 text-slate-700',
  2: 'bg-blue-100 text-blue-800',
  3: 'bg-green-100 text-green-800',
  4: 'bg-purple-100 text-purple-800',
  5: 'bg-amber-100 text-amber-900',
}

interface Props {
  profiles: WorkProfile[]
  onProfiles: (p: WorkProfile[]) => void
}

export default function ProfilesView({ profiles, onProfiles }: Props) {
  const { t } = useTranslation()
  const [editId, setEditId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  function makeEmpty(): WorkProfile {
    return {
      id: crypto.randomUUID(),
      name: '',
      role: '',
      skills: [],
      interests: [],
      workTypes: [],
      capacity: 100,
      createdAt: Date.now(),
    }
  }

  const [draft, setDraft] = useState<WorkProfile>(makeEmpty)

  function openAdd() {
    setDraft(makeEmpty())
    setAdding(true)
    setEditId(null)
  }

  function openEdit(p: WorkProfile) {
    setDraft({ ...p })
    setEditId(p.id)
    setAdding(false)
  }

  function saveDraft() {
    if (!draft.name.trim()) return
    const updated: WorkProfile = {
      ...draft,
      id: editId ?? draft.id,
      createdAt: profiles.find(p => p.id === (editId ?? draft.id))?.createdAt ?? Date.now(),
    }
    if (editId) {
      onProfiles(profiles.map(p => (p.id === editId ? updated : p)))
    } else {
      onProfiles([...profiles, updated])
    }
    setAdding(false)
    setEditId(null)
  }

  function deleteProfile(id: string) {
    if (!confirm(t('profiles.delete_confirm'))) return
    onProfiles(profiles.filter(p => p.id !== id))
    if (editId === id) setEditId(null)
  }

  function addSkill() {
    setDraft(d => ({
      ...d,
      skills: [
        ...d.skills,
        { id: crypto.randomUUID(), name: '', proficiency: 3 as ProficiencyLevel },
      ],
    }))
  }

  function updateSkill(id: string, patch: Partial<Skill>) {
    setDraft(d => ({
      ...d,
      skills: d.skills.map(s => (s.id === id ? { ...s, ...patch } : s)),
    }))
  }

  function removeSkill(id: string) {
    setDraft(d => ({ ...d, skills: d.skills.filter(s => s.id !== id) }))
  }

  function toggleWorkType(wt: WorkType) {
    setDraft(d => ({
      ...d,
      workTypes: d.workTypes.includes(wt) ? d.workTypes.filter(w => w !== wt) : [...d.workTypes, wt],
    }))
  }

  const showForm = adding || editId !== null
  const levels: ProficiencyLevel[] = [1, 2, 3, 4, 5]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('profiles.directory_heading')}</h2>
        <button type="button" onClick={openAdd} className="btn-primary">
          + {t('profiles.add')}
        </button>
      </div>

      <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 text-sm text-brand-900">
        <strong>{t('profiles.dreyfus_title')}:</strong> {t('profiles.dreyfus_body')}
      </div>

      {profiles.length === 0 && !showForm && (
        <p className="text-gray-400 text-sm italic">{t('profiles.empty')}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.map(p => (
          <div key={p.id} className="card">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900">{p.name || '—'}</h3>
                <p className="text-sm text-gray-500">{p.role}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="text-xs text-brand-600 hover:text-brand-800 px-2 py-1 rounded hover:bg-brand-50"
                >
                  {t('profiles.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => deleteProfile(p.id)}
                  className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50"
                >
                  {t('profiles.delete')}
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-gray-500">{t('profiles.capacity')}:</span>
              <span className="font-medium text-brand-600">{p.capacity}%</span>
            </div>
            {p.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {p.skills.map(s => (
                  <span
                    key={s.id}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[s.proficiency]}`}
                  >
                    {s.name || '…'} L{s.proficiency}
                  </span>
                ))}
              </div>
            )}
            {p.interests.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {p.interests.map((topic, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    ✦ {topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">
            {editId ? t('profile_form.title_edit') : t('profile_form.title_new')}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="label">{t('profile_form.name_label')}</label>
              <input
                className="input"
                value={draft.name}
                placeholder={t('profile_form.name_placeholder')}
                onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">{t('profile_form.role_label')}</label>
              <input
                className="input"
                value={draft.role}
                placeholder={t('profile_form.role_placeholder')}
                onChange={e => setDraft(d => ({ ...d, role: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="label">
              {t('profile_form.capacity_label')}: {draft.capacity}%
            </label>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              className="w-full accent-brand-600"
              value={draft.capacity}
              onChange={e => setDraft(d => ({ ...d, capacity: Number(e.target.value) }))}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">{t('profile_form.skills_label')}</label>
              <button type="button" onClick={addSkill} className="text-xs text-brand-600 hover:text-brand-800">
                + {t('profile_form.add_skill')}
              </button>
            </div>
            {draft.skills.map(s => (
              <div key={s.id} className="flex gap-2 mb-2 items-center flex-wrap">
                <input
                  className="input flex-1 min-w-[8rem]"
                  value={s.name}
                  placeholder={t('profile_form.skill_name_placeholder')}
                  onChange={e => updateSkill(s.id, { name: e.target.value })}
                />
                <select
                  className="input w-36"
                  value={s.proficiency}
                  onChange={e =>
                    updateSkill(s.id, { proficiency: Number(e.target.value) as ProficiencyLevel })
                  }
                >
                  {levels.map(l => (
                    <option key={l} value={l}>
                      L{l} — {t(`profile_form.proficiency.${l}`)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeSkill(s.id)}
                  className="text-gray-300 hover:text-red-400"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="label">{t('profile_form.interests_label')}</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder={t('profile_form.interests_placeholder')}
              value={draft.interests.join(', ')}
              onChange={e =>
                setDraft(d => ({
                  ...d,
                  interests: e.target.value
                    .split(',')
                    .map(x => x.trim())
                    .filter(Boolean),
                }))
              }
            />
          </div>

          <div>
            <label className="label">{t('profile_form.work_types_label')}</label>
            <div className="flex flex-wrap gap-2">
              {WORK_TYPES.map(wt => (
                <button
                  key={wt}
                  type="button"
                  onClick={() => toggleWorkType(wt)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    draft.workTypes.includes(wt)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t(`profile_form.work_types.${wt}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={saveDraft} className="btn-primary">
              {t('profile_form.save')}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false)
                setEditId(null)
              }}
              className="btn-secondary"
            >
              {t('profile_form.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
