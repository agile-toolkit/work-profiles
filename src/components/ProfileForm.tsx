import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { WorkProfile, Skill, ProficiencyLevel, WorkType } from '../types'

const WORK_TYPES: WorkType[] = ['design', 'development', 'testing', 'analysis', 'facilitation', 'writing', 'mentoring', 'ops']
const PROFICIENCY_LEVELS: ProficiencyLevel[] = [1, 2, 3, 4, 5]

interface Props {
  initial?: WorkProfile | null
  onSave: (profile: WorkProfile) => void
  onCancel: () => void
}

export default function ProfileForm({ initial, onSave, onCancel }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState(initial?.name ?? '')
  const [role, setRole] = useState(initial?.role ?? '')
  const [capacity, setCapacity] = useState(initial?.capacity ?? 100)
  const [skills, setSkills] = useState<Skill[]>(initial?.skills ?? [])
  const [interests, setInterests] = useState(initial?.interests.join(', ') ?? '')
  const [workTypes, setWorkTypes] = useState<WorkType[]>(initial?.workTypes ?? [])
  const [newSkill, setNewSkill] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState<ProficiencyLevel>(3)

  const addSkill = () => {
    if (!newSkill.trim()) return
    setSkills(s => [...s, { id: crypto.randomUUID(), name: newSkill.trim(), proficiency: newSkillLevel }])
    setNewSkill('')
  }

  const toggleWorkType = (wt: WorkType) => {
    setWorkTypes(wts => wts.includes(wt) ? wts.filter(w => w !== wt) : [...wts, wt])
  }

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      name: name.trim(),
      role: role.trim(),
      capacity,
      skills,
      interests: interests.split(',').map(s => s.trim()).filter(Boolean),
      workTypes,
      createdAt: initial?.createdAt ?? Date.now(),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl my-4">
        <div className="p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">
            {initial ? t('profile_form.title_edit') : t('profile_form.title_new')}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">{t('profile_form.name_label')}</label>
              <input autoFocus className="input" placeholder={t('profile_form.name_placeholder')} value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">{t('profile_form.role_label')}</label>
              <input className="input" placeholder={t('profile_form.role_placeholder')} value={role} onChange={e => setRole(e.target.value)} />
            </div>
            <div>
              <label className="label">{t('profile_form.capacity_label')}</label>
              <input type="number" min={10} max={100} step={10} className="input" value={capacity} onChange={e => setCapacity(Number(e.target.value))} />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="label">{t('profile_form.skills_label')}</label>
            <div className="flex gap-2 mb-2">
              <input
                className="input flex-1"
                placeholder={t('profile_form.skill_name_placeholder')}
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkill()}
              />
              <select
                className="input w-auto"
                value={newSkillLevel}
                onChange={e => setNewSkillLevel(Number(e.target.value) as ProficiencyLevel)}
              >
                {PROFICIENCY_LEVELS.map(l => (
                  <option key={l} value={l}>{l} – {t(`profile_form.proficiency.${l}`)}</option>
                ))}
              </select>
              <button onClick={addSkill} disabled={!newSkill.trim()} className="btn-primary text-sm px-3">+</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map(s => (
                <div key={s.id} className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 text-xs">
                  <span>{s.name} ({s.proficiency})</span>
                  <button onClick={() => setSkills(sk => sk.filter(x => x.id !== s.id))} className="text-gray-400 hover:text-red-400 ml-1">✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Work types */}
          <div>
            <label className="label">{t('profile_form.work_types_label')}</label>
            <div className="flex flex-wrap gap-2">
              {WORK_TYPES.map(wt => (
                <button
                  key={wt}
                  onClick={() => toggleWorkType(wt)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    workTypes.includes(wt)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t(`profile_form.work_types.${wt}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="label">{t('profile_form.interests_label')}</label>
            <input className="input" placeholder={t('profile_form.interests_placeholder')} value={interests} onChange={e => setInterests(e.target.value)} />
          </div>
        </div>

        <div className="border-t border-gray-100 p-4 flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary">{t('profile_form.cancel')}</button>
          <button onClick={handleSave} disabled={!name.trim()} className="btn-primary">{t('profile_form.save')}</button>
        </div>
      </div>
    </div>
  )
}
