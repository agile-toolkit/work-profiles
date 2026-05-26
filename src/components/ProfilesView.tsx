import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { WorkProfile, Skill, ProficiencyLevel, WorkType } from '../types'

interface CsvProfile {
  name: string
  role: string
  capacity: number
  workTypes: WorkType[]
  skills: Skill[]
}

function parseCsvRow(row: string): string[] {
  const result: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < row.length; i++) {
    if (row[i] === '"') {
      inQuotes = !inQuotes
    } else if (row[i] === ',' && !inQuotes) {
      result.push(field.trim())
      field = ''
    } else {
      field += row[i]
    }
  }
  result.push(field.trim())
  return result
}

const VALID_WORK_TYPES: WorkType[] = [
  'design', 'development', 'testing', 'analysis',
  'facilitation', 'writing', 'mentoring', 'ops',
]

function parseSkills(raw: string): Skill[] {
  if (!raw.trim()) return []
  return raw.split(';').flatMap(part => {
    const trimmed = part.trim()
    if (!trimmed) return []
    const colonIdx = trimmed.indexOf(':')
    if (colonIdx === -1) return []
    const name = trimmed.slice(0, colonIdx).trim()
    if (!name) return []
    const rest = trimmed.slice(colonIdx + 1).trim()
    const dashIdx = rest.search(/[–-]/)
    const levelStr = dashIdx !== -1 ? rest.slice(0, dashIdx).trim() : rest.trim()
    const level = parseInt(levelStr, 10)
    if (isNaN(level) || level < 1 || level > 5) return []
    return [{ id: crypto.randomUUID(), name, proficiency: level as ProficiencyLevel }]
  })
}

function parseWorkTypes(raw: string): WorkType[] {
  if (!raw.trim()) return []
  return raw.split(';').flatMap(part => {
    const wt = part.trim().toLowerCase() as WorkType
    return VALID_WORK_TYPES.includes(wt) ? [wt] : []
  })
}

function parseCsv(text: string): CsvProfile[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return []
  const headers = parseCsvRow(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, ' '))
  const nameIdx = headers.indexOf('name')
  if (nameIdx === -1) return []
  const roleIdx = headers.indexOf('role')
  const capacityIdx = headers.indexOf('capacity')
  const workTypesIdx = headers.indexOf('work types')
  const skillsIdx = headers.indexOf('skills')
  return lines.slice(1).flatMap(line => {
    const fields = parseCsvRow(line)
    const name = (fields[nameIdx] ?? '').trim()
    if (!name) return []
    const rawCapacity = parseInt(fields[capacityIdx] ?? '100', 10)
    const capacity = isNaN(rawCapacity) ? 100 : Math.min(100, Math.max(10, rawCapacity))
    return [{
      name,
      role: roleIdx !== -1 ? (fields[roleIdx] ?? '').trim() : '',
      capacity,
      workTypes: workTypesIdx !== -1 ? parseWorkTypes(fields[workTypesIdx] ?? '') : [],
      skills: skillsIdx !== -1 ? parseSkills(fields[skillsIdx] ?? '') : [],
    }]
  })
}

const FE_TEMPLATE = {
  role: 'Frontend Dev',
  workTypes: ['development', 'design'] as WorkType[],
  skills: [
    { name: 'TypeScript', proficiency: 4 as ProficiencyLevel },
    { name: 'React', proficiency: 4 as ProficiencyLevel },
    { name: 'CSS / Tailwind', proficiency: 3 as ProficiencyLevel },
    { name: 'Testing', proficiency: 3 as ProficiencyLevel },
    { name: 'Accessibility', proficiency: 2 as ProficiencyLevel },
  ],
}

const WORK_TYPES: WorkType[] = VALID_WORK_TYPES

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
  const [showArchived, setShowArchived] = useState(false)
  const [csvPreview, setCsvPreview] = useState<CsvProfile[] | null>(null)
  const [csvError, setCsvError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  function openAddWithTemplate() {
    setDraft({
      ...makeEmpty(),
      role: FE_TEMPLATE.role,
      workTypes: FE_TEMPLATE.workTypes,
      skills: FE_TEMPLATE.skills.map(s => ({ id: crypto.randomUUID(), name: s.name, proficiency: s.proficiency })),
    })
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

  function archiveProfile(id: string) {
    if (!confirm(t('profiles.archive_confirm'))) return
    onProfiles(profiles.map(p => p.id === id ? { ...p, archived: true } : p))
    if (editId === id) setEditId(null)
  }

  function restoreProfile(id: string) {
    onProfiles(profiles.map(p => p.id === id ? { ...p, archived: false } : p))
  }

  function deletePermanently(id: string) {
    if (!confirm(t('profiles.delete_permanently_confirm'))) return
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

  function openImport() {
    setCsvError(null)
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!fileInputRef.current) return
    fileInputRef.current.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      const parsed = parseCsv(text)
      if (parsed.length === 0) {
        setCsvError(t('profiles.import_empty'))
      } else {
        setCsvError(null)
        setCsvPreview(parsed)
      }
    }
    reader.onerror = () => setCsvError(t('profiles.import_error'))
    reader.readAsText(file)
  }

  function confirmImport() {
    if (!csvPreview) return
    const updated = [...profiles]
    for (const csv of csvPreview) {
      const existingIdx = updated.findIndex(p => p.name.toLowerCase() === csv.name.toLowerCase())
      if (existingIdx !== -1) {
        updated[existingIdx] = {
          ...updated[existingIdx],
          role: csv.role || updated[existingIdx].role,
          capacity: csv.capacity,
          workTypes: csv.workTypes.length > 0 ? csv.workTypes : updated[existingIdx].workTypes,
          skills: csv.skills.length > 0 ? csv.skills : updated[existingIdx].skills,
        }
      } else {
        updated.push({
          id: crypto.randomUUID(),
          name: csv.name,
          role: csv.role,
          capacity: csv.capacity,
          workTypes: csv.workTypes,
          skills: csv.skills,
          interests: [],
          createdAt: Date.now(),
        })
      }
    }
    onProfiles(updated)
    setCsvPreview(null)
  }

  function countNewProfiles(): number {
    if (!csvPreview) return 0
    return csvPreview.filter(
      csv => !profiles.some(p => p.name.toLowerCase() === csv.name.toLowerCase())
    ).length
  }

  function countUpdatedProfiles(): number {
    if (!csvPreview) return 0
    return csvPreview.filter(
      csv => profiles.some(p => p.name.toLowerCase() === csv.name.toLowerCase())
    ).length
  }

  const showForm = adding || editId !== null
  const levels: ProficiencyLevel[] = [1, 2, 3, 4, 5]
  const archivedCount = profiles.filter(p => p.archived).length
  const activeProfiles = profiles.filter(p => !p.archived)
  const visibleProfiles = showArchived ? profiles : activeProfiles

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-gray-900">{t('profiles.title')}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {archivedCount > 0 && (
            <button type="button" onClick={() => setShowArchived(v => !v)} className="btn-secondary text-sm">
              {showArchived ? t('profiles.hide_archived') : t('profiles.show_archived', { count: archivedCount })}
            </button>
          )}
          <button type="button" onClick={openImport} className="btn-secondary text-sm">
            {t('profiles.import')}
          </button>
          <button type="button" onClick={openAdd} className="btn-primary">
            + {t('profiles.add')}
          </button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileChange}
      />
      {csvError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {csvError}
        </div>
      )}

      <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 text-sm text-brand-900">
        <strong>{t('profiles.dreyfus_title')}:</strong> {t('profiles.dreyfus_body')}
      </div>

      {activeProfiles.length === 0 && !showForm && !showArchived && (
        <div className="py-10 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">{t('profiles.onboarding_headline')}</h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm">{t('profiles.onboarding_subtext')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={openAdd}
              className="card text-left hover:border-brand-300 hover:shadow transition-all cursor-pointer"
            >
              <div className="text-2xl mb-2">👤</div>
              <h4 className="font-medium text-gray-900 mb-1">{t('profiles.onboarding_add')}</h4>
              <p className="text-sm text-gray-500">{t('profiles.onboarding_add_sub')}</p>
            </button>

            <button
              type="button"
              onClick={openAddWithTemplate}
              className="card text-left hover:border-brand-300 hover:shadow transition-all cursor-pointer border-brand-200 bg-brand-50"
            >
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-medium text-brand-700 mb-1">{t('profiles.onboarding_template')}</h4>
              <p className="text-sm text-brand-600">{t('profiles.onboarding_template_sub')}</p>
            </button>

            <button
              type="button"
              onClick={openImport}
              className="card text-left hover:border-brand-300 hover:shadow transition-all cursor-pointer"
            >
              <div className="text-2xl mb-2">📥</div>
              <h4 className="font-medium text-gray-900 mb-1">{t('profiles.onboarding_import')}</h4>
              <p className="text-sm text-gray-500">{t('profiles.onboarding_import_sub')}</p>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">1</span>
              {t('profiles.onboarding_step1')}
            </span>
            <span className="text-gray-300">→</span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">2</span>
              {t('profiles.onboarding_step2')}
            </span>
            <span className="text-gray-300">→</span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">3</span>
              {t('profiles.onboarding_step3')}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleProfiles.map(p => (
          <div key={p.id} className={`card ${p.archived ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold ${p.archived ? 'text-gray-400' : 'text-gray-900'}`}>{p.name || '—'}</h3>
                  {p.archived && (
                    <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                      {t('profiles.archived_badge')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{p.role}</p>
              </div>
              <div className="flex gap-2">
                {p.archived ? (
                  <>
                    <button
                      type="button"
                      onClick={() => restoreProfile(p.id)}
                      className="text-xs text-brand-600 hover:text-brand-800 px-2 py-1 rounded hover:bg-brand-50"
                    >
                      {t('profiles.restore')}
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePermanently(p.id)}
                      className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50"
                    >
                      {t('profiles.delete_permanently')}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="text-xs text-brand-600 hover:text-brand-800 px-2 py-1 rounded hover:bg-brand-50"
                    >
                      {t('profiles.edit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => archiveProfile(p.id)}
                      className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50"
                    >
                      {t('profiles.archive')}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-gray-500">{t('profiles.capacity')}:</span>
              <span className={`font-medium ${p.archived ? 'text-gray-400' : 'text-brand-600'}`}>{p.capacity}%</span>
            </div>
            {p.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {p.skills.map(s => (
                  <span
                    key={s.id}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.archived ? 'bg-gray-100 text-gray-400' : LEVEL_COLORS[s.proficiency]}`}
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
            {p.workTypes.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <span className="text-xs text-gray-400">{t('profiles.work_types')}:</span>
                {p.workTypes.map(wt => (
                  <span key={wt} className={`text-xs px-2 py-0.5 rounded-full ${p.archived ? 'bg-gray-100 text-gray-400' : 'bg-brand-100 text-brand-700'}`}>
                    {t(`profile_form.work_types.${wt}`)}
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

      {csvPreview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('profiles.import_modal_title')}</h3>
            <p className="text-gray-600 text-sm">
              {t('profiles.import_found', { count: csvPreview.length })}
            </p>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-green-700">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                {t('profiles.import_new', { count: countNewProfiles() })}
              </span>
              {countUpdatedProfiles() > 0 && (
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  {t('profiles.import_update', { count: countUpdatedProfiles() })}
                </span>
              )}
            </div>
            <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
              {csvPreview.map((csv, i) => {
                const isUpdate = profiles.some(p => p.name.toLowerCase() === csv.name.toLowerCase())
                return (
                  <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="text-gray-800 font-medium">{csv.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isUpdate ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {isUpdate ? t('profiles.import_tag_update') : t('profiles.import_tag_new')}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={confirmImport} className="btn-primary flex-1">
                {t('profiles.import_confirm')}
              </button>
              <button type="button" onClick={() => setCsvPreview(null)} className="btn-secondary flex-1">
                {t('profiles.import_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
