import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { WorkProfile, Skill, ProficiencyLevel, WorkType } from '../types'
import { SKILL_CATEGORIES } from '../types'

const ALL_TIMEZONES: string[] = (() => {
  try {
    return (Intl as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.('timeZone') ?? []
  } catch {
    return []
  }
})()

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

const WORK_TYPES: WorkType[] = ['design', 'development', 'testing', 'analysis', 'facilitation', 'writing', 'mentoring', 'ops']
const PROFICIENCY_LEVELS: ProficiencyLevel[] = [1, 2, 3, 4, 5]

const ROLE_TEMPLATES: Array<{
  role: string
  workTypes: WorkType[]
  skills: Array<{ name: string; proficiency: ProficiencyLevel; category?: string }>
}> = [
  {
    role: 'Frontend Dev',
    workTypes: ['development', 'design'],
    skills: [
      { name: 'TypeScript', proficiency: 4, category: 'Frontend' },
      { name: 'React', proficiency: 4, category: 'Frontend' },
      { name: 'CSS / Tailwind', proficiency: 3, category: 'Design' },
      { name: 'Testing', proficiency: 3, category: 'Testing' },
      { name: 'Accessibility', proficiency: 2, category: 'Design' },
    ],
  },
  {
    role: 'Backend Dev',
    workTypes: ['development', 'ops'],
    skills: [
      { name: 'Node.js', proficiency: 4, category: 'Backend' },
      { name: 'REST APIs', proficiency: 4, category: 'Backend' },
      { name: 'SQL', proficiency: 3, category: 'Backend' },
      { name: 'Docker', proficiency: 3, category: 'DevOps' },
      { name: 'Testing', proficiency: 2, category: 'Testing' },
    ],
  },
  {
    role: 'Scrum Master',
    workTypes: ['facilitation', 'mentoring'],
    skills: [
      { name: 'Agile / Scrum', proficiency: 5, category: 'Soft Skills' },
      { name: 'Facilitation', proficiency: 4, category: 'Soft Skills' },
      { name: 'Coaching', proficiency: 3, category: 'Soft Skills' },
      { name: 'Conflict Resolution', proficiency: 3, category: 'Soft Skills' },
      { name: 'Metrics', proficiency: 3, category: 'Data & AI' },
    ],
  },
  {
    role: 'Product Owner',
    workTypes: ['analysis', 'writing'],
    skills: [
      { name: 'Backlog Management', proficiency: 4, category: 'Soft Skills' },
      { name: 'Stakeholder Comms', proficiency: 4, category: 'Soft Skills' },
      { name: 'User Story Writing', proficiency: 4, category: 'Soft Skills' },
      { name: 'Prioritisation', proficiency: 3, category: 'Soft Skills' },
      { name: 'Data Analysis', proficiency: 2, category: 'Data & AI' },
    ],
  },
  {
    role: 'QA Engineer',
    workTypes: ['testing', 'analysis'],
    skills: [
      { name: 'Test Planning', proficiency: 4, category: 'Testing' },
      { name: 'Bug Reporting', proficiency: 4, category: 'Testing' },
      { name: 'Automation', proficiency: 3, category: 'Testing' },
      { name: 'API Testing', proficiency: 3, category: 'Testing' },
      { name: 'Performance Testing', proficiency: 2, category: 'Testing' },
    ],
  },
]

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
  const [newSkillCategory, setNewSkillCategory] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [timezone, setTimezone] = useState(initial?.timezone ?? '')
  const [hoursStart, setHoursStart] = useState(initial?.workingHours?.start ?? '')
  const [hoursEnd, setHoursEnd] = useState(initial?.workingHours?.end ?? '')
  const [oooUntil, setOooUntil] = useState(initial?.oooUntil ?? '')

  const [tzFilter, setTzFilter] = useState('')
  const filteredTimezones = useMemo(
    () => tzFilter
      ? ALL_TIMEZONES.filter(tz => tz.toLowerCase().includes(tzFilter.toLowerCase()))
      : ALL_TIMEZONES,
    [tzFilter]
  )

  const applyTemplate = (tpl: typeof ROLE_TEMPLATES[0]) => {
    setSelectedTemplate(tpl.role)
    setRole(tpl.role)
    setWorkTypes(tpl.workTypes)
    setSkills(tpl.skills.map(s => ({ id: crypto.randomUUID(), name: s.name, proficiency: s.proficiency, category: s.category })))
  }

  const [newSkillTarget, setNewSkillTarget] = useState<number | ''>('')

  const addSkill = () => {
    if (!newSkill.trim()) return
    setSkills(s => [...s, {
      id: crypto.randomUUID(),
      name: newSkill.trim(),
      proficiency: newSkillLevel,
      category: newSkillCategory || undefined,
      history: [],
      targetProficiency: newSkillTarget !== '' ? newSkillTarget : undefined,
    }])
    setNewSkill('')
    setNewSkillCategory('')
    setNewSkillTarget('')
  }

  const changeSkillCategory = (skillId: string, category: string) => {
    setSkills(sk => sk.map(s => s.id === skillId ? { ...s, category: category || undefined } : s))
  }

  const changeSkillTarget = (skillId: string, value: string) => {
    const target = value === '' ? undefined : Number(value)
    setSkills(sk => sk.map(s => s.id === skillId ? { ...s, targetProficiency: target } : s))
  }

  const recordSkillChange = (skillId: string, newLevel: ProficiencyLevel) => {
    setSkills(sk => sk.map(s => {
      if (s.id !== skillId) return s
      const entry = { date: today(), proficiency: s.proficiency }
      return { ...s, proficiency: newLevel, history: [...(s.history ?? []), entry] }
    }))
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
      archived: initial?.archived,
      timezone: timezone || undefined,
      workingHours: hoursStart && hoursEnd ? { start: hoursStart, end: hoursEnd } : undefined,
      oooUntil: oooUntil || undefined,
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

          {/* Role templates — new profiles only */}
          {!initial && (
            <div>
              <label className="label">{t('profile_form.template_label')}</label>
              <div className="flex flex-wrap gap-2">
                {ROLE_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.role}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      selectedTemplate === tpl.role
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tpl.role}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          <div>
            <label className="label">{t('profile_form.skills_label')}</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              <input
                className="input flex-1 min-w-[120px]"
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
              <select
                className="input w-auto text-xs"
                value={newSkillCategory}
                onChange={e => setNewSkillCategory(e.target.value)}
                title={t('profile_form.category_label')}
              >
                <option value="">{t('profile_form.category_none')}</option>
                {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                className="input w-auto text-xs"
                value={newSkillTarget}
                onChange={e => setNewSkillTarget(e.target.value === '' ? '' : Number(e.target.value))}
                title={t('profile_form.target_label')}
              >
                <option value="">–</option>
                {PROFICIENCY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button onClick={addSkill} disabled={!newSkill.trim()} className="btn-primary text-sm px-3">+</button>
            </div>
            <div className="flex flex-col gap-1.5">
              {skills.map(s => (
                <div key={s.id} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1 text-xs">
                  <span className="flex-1 font-medium text-gray-800 dark:text-gray-200">{s.name}</span>
                  {s.category && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-medium shrink-0">
                      {s.category}
                    </span>
                  )}
                  <select
                    className="input !py-0 !px-1 text-[10px] w-auto"
                    value={s.category ?? ''}
                    onChange={e => changeSkillCategory(s.id, e.target.value)}
                    title={t('profile_form.category_label')}
                  >
                    <option value="">{t('profile_form.category_none')}</option>
                    {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {initial ? (
                    <select
                      className="input !py-0.5 !px-1 text-xs w-auto"
                      value={s.proficiency}
                      onChange={e => recordSkillChange(s.id, Number(e.target.value) as ProficiencyLevel)}
                      title={t('profile_form.record_change')}
                    >
                      {PROFICIENCY_LEVELS.map(l => (
                        <option key={l} value={l}>{l} – {t(`profile_form.proficiency.${l}`)}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-500">({s.proficiency})</span>
                  )}
                  <select
                    className="input !py-0 !px-1 text-[10px] w-auto"
                    value={s.targetProficiency ?? ''}
                    onChange={e => changeSkillTarget(s.id, e.target.value)}
                    title={t('profile_form.target_label')}
                  >
                    <option value="">–</option>
                    {PROFICIENCY_LEVELS.map(l => <option key={l} value={l}>→{l}</option>)}
                  </select>
                  {(s.history?.length ?? 0) > 0 && (
                    <span
                      className="text-brand-600 dark:text-brand-400 cursor-default"
                      title={`${s.history!.length} ${t('profile_form.history_entries')}: ${s.history!.map(h => `${h.date}: ${h.proficiency}`).join(', ')}`}
                    >
                      📈{s.history!.length}
                    </span>
                  )}
                  <button onClick={() => setSkills(sk => sk.filter(x => x.id !== s.id))} className="text-gray-400 hover:text-red-400">✕</button>
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

          {/* Availability */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
            <p className="label text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[10px]">{t('profile_form.availability_section')}</p>

            {/* Timezone */}
            <div>
              <label className="label">{t('profile_form.timezone_label')}</label>
              {ALL_TIMEZONES.length > 0 ? (
                <div className="space-y-1">
                  <input
                    className="input text-xs"
                    placeholder={t('profile_form.timezone_search')}
                    value={tzFilter}
                    onChange={e => setTzFilter(e.target.value)}
                  />
                  <select
                    className="input"
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                  >
                    <option value="">{t('profile_form.timezone_none')}</option>
                    {filteredTimezones.map(tz => (
                      <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <input
                  className="input"
                  placeholder="e.g. Europe/Warsaw"
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                />
              )}
            </div>

            {/* Working hours */}
            <div>
              <label className="label">{t('profile_form.working_hours_label')}</label>
              <div className="flex gap-2 items-center">
                <input
                  type="time"
                  className="input w-auto"
                  value={hoursStart}
                  onChange={e => setHoursStart(e.target.value)}
                />
                <span className="text-gray-400 text-sm">–</span>
                <input
                  type="time"
                  className="input w-auto"
                  value={hoursEnd}
                  onChange={e => setHoursEnd(e.target.value)}
                />
              </div>
            </div>

            {/* OOO date */}
            <div>
              <label className="label">{t('profile_form.ooo_until_label')}</label>
              <input
                type="date"
                className="input w-auto"
                value={oooUntil}
                onChange={e => setOooUntil(e.target.value)}
              />
              {oooUntil && (
                <button
                  type="button"
                  onClick={() => setOooUntil('')}
                  className="ml-2 text-xs text-gray-400 hover:text-red-400"
                >
                  ✕
                </button>
              )}
            </div>
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
