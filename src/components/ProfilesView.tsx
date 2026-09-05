import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import type { WorkProfile, Skill, ProficiencyLevel, WorkType, ProjectCredit } from '../types'
import {
  parseMotivatorsParam,
  readMotivatorSnapshot,
  clearMotivatorSnapshot,
  topMotivatorLabels,
  type MotivatorSnapshot,
} from '../utils/motivatorHandoff'
import { ROLE_TEMPLATES, type RoleTemplate } from '../roleTemplates'
import { CloseIcon, PersonIcon, BoltIcon, InboxIcon, CheckIcon, SparkIcon, ArrowRightIcon } from './icons'
import { parseCsv, VALID_WORK_TYPES, type CsvProfile } from '../utils/csvParse'
import { eligibleEndorsers } from '../utils/skillLogic'
import { readKanbanDesignerCards, type KanbanDesignerCard } from '../utils/kanbanDesignerImport'
import { downloadBackup, parseBackup } from '../utils/backup'

interface IbItem {
  id: string
  title: string
  status: string
  owner: string
  copilot: string
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
  credits: ProjectCredit[]
  onRestoreBackup: (profiles: WorkProfile[], credits: ProjectCredit[]) => void
  onCompare: (ids: string[]) => void
  onAnnounce?: (msg: string) => void
}

export default function ProfilesView({ profiles, onProfiles, credits, onRestoreBackup, onCompare, onAnnounce }: Props) {
  const { t } = useTranslation()
  const [editId, setEditId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [csvPreview, setCsvPreview] = useState<CsvProfile[] | null>(null)
  const [csvError, setCsvError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [endorsingSkill, setEndorsingSkill] = useState<{ profileId: string; skillId: string } | null>(null)
  const [printingProfile, setPrintingProfile] = useState<WorkProfile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importModalRef = useRef<HTMLDivElement>(null)
  const backupInputRef = useRef<HTMLInputElement>(null)
  const [backupError, setBackupError] = useState<string | null>(null)
  const [ibItems, setIbItems] = useState<IbItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('improvement-board-items')
      if (raw) {
        const parsed = JSON.parse(raw) as IbItem[]
        setIbItems(parsed.filter(item => item.status !== 'done'))
      }
    } catch {}
  }, [])

  // Moving Motivators' "Export to Work Profiles" sends both a one-shot URL
  // param (consumed and stripped here) and a localStorage snapshot (offered
  // as a dismissible banner so it isn't silently re-applied on every visit).
  const [motivatorSnapshot, setMotivatorSnapshot] = useState<MotivatorSnapshot | null>(() => {
    const fromParam = parseMotivatorsParam(window.location.search)
    if (fromParam) {
      window.history.replaceState(null, '', window.location.pathname + window.location.hash)
      return fromParam
    }
    return readMotivatorSnapshot()
  })

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
  const [selectedTemplateRole, setSelectedTemplateRole] = useState<string | null>(null)

  const skillVocabulary = useMemo(() => {
    const seen = new Map<string, string>()
    for (const p of profiles) {
      if (p.archived) continue
      for (const s of p.skills) {
        const key = s.name.trim().toLowerCase()
        if (key && !seen.has(key)) seen.set(key, s.name.trim())
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b))
  }, [profiles])

  // Kanban Designer's board snapshot (kanban-designer:currentBoard) is
  // read fresh per profile since it's cheap and can change between
  // renders while this screen is open (issue #55).
  const kanbanDesignerCards = useMemo(() => {
    const map = new Map<string, KanbanDesignerCard[]>()
    for (const p of profiles) {
      if (p.archived) continue
      map.set(p.name, readKanbanDesignerCards(p.name))
    }
    return map
  }, [profiles])

  function openAdd() {
    setDraft(makeEmpty())
    setSelectedTemplateRole(null)
    setAdding(true)
    setEditId(null)
  }

  function openEdit(p: WorkProfile) {
    setDraft({ ...p })
    setSelectedTemplateRole(null)
    setEditId(p.id)
    setAdding(false)
  }

  function openAddWithMotivators() {
    if (!motivatorSnapshot) return
    setDraft({
      ...makeEmpty(),
      interests: topMotivatorLabels(motivatorSnapshot),
    })
    setSelectedTemplateRole(null)
    setAdding(true)
    setEditId(null)
    clearMotivatorSnapshot()
    setMotivatorSnapshot(null)
  }

  // "Start from a template" row at the top of the profile form (issue #6).
  // Pre-fills role, preferred work types, and skills; the user can still
  // add, remove, or adjust any pre-filled skill before saving. Selecting no
  // template keeps today's blank-start behaviour.
  function applyTemplate(template: RoleTemplate) {
    setSelectedTemplateRole(template.role)
    setDraft(d => ({
      ...d,
      role: template.role,
      workTypes: template.workTypes,
      skills: template.skills.map(s => ({ id: crypto.randomUUID(), name: s.name, proficiency: s.proficiency })),
    }))
  }

  function dismissMotivatorSnapshot() {
    clearMotivatorSnapshot()
    setMotivatorSnapshot(null)
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
      onAnnounce?.(t('profiles.announce_updated', { name: updated.name }))
    } else {
      onProfiles([...profiles, updated])
      onAnnounce?.(t('profiles.announce_saved', { name: updated.name }))
    }
    setAdding(false)
    setEditId(null)
    setSelectedTemplateRole(null)
  }

  function deleteProfile(id: string) {
    if (!confirm(t('profiles.delete_confirm'))) return
    const name = profiles.find(p => p.id === id)?.name ?? ''
    onProfiles(profiles.filter(p => p.id !== id))
    if (editId === id) setEditId(null)
    onAnnounce?.(t('profiles.announce_deleted', { name }))
  }

  function archiveProfile(id: string) {
    if (!confirm(t('profiles.archive_confirm'))) return
    const name = profiles.find(p => p.id === id)?.name ?? ''
    onProfiles(profiles.map(p => p.id === id ? { ...p, archived: true } : p))
    if (editId === id) setEditId(null)
    onAnnounce?.(t('profiles.announce_archived', { name }))
  }

  function restoreProfile(id: string) {
    const name = profiles.find(p => p.id === id)?.name ?? ''
    onProfiles(profiles.map(p => p.id === id ? { ...p, archived: false } : p))
    onAnnounce?.(t('profiles.announce_restored', { name }))
  }

  function deletePermanently(id: string) {
    if (!confirm(t('profiles.delete_permanently_confirm'))) return
    const name = profiles.find(p => p.id === id)?.name ?? ''
    onProfiles(profiles.filter(p => p.id !== id))
    if (editId === id) setEditId(null)
    onAnnounce?.(t('profiles.announce_deleted', { name }))
  }

  function handlePrint(profile: WorkProfile) {
    setPrintingProfile(profile)
    const after = () => {
      setPrintingProfile(null)
      window.removeEventListener('afterprint', after)
    }
    window.addEventListener('afterprint', after)
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()))
  }

  function endorseSkill(profileId: string, skillId: string, endorserName: string) {
    onProfiles(profiles.map(p =>
      p.id !== profileId ? p : {
        ...p,
        skills: p.skills.map(s =>
          s.id !== skillId ? s : { ...s, endorsedBy: [...(s.endorsedBy ?? []), endorserName] }
        ),
      }
    ))
    setEndorsingSkill(null)
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

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 4) return prev
      return [...prev, id]
    })
  }

  function openImport() {
    setCsvError(null)
    fileInputRef.current?.click()
  }

  function handleExportBackup() {
    downloadBackup(profiles, credits)
  }

  function openBackupImport() {
    setBackupError(null)
    backupInputRef.current?.click()
  }

  function handleBackupFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!backupInputRef.current) return
    backupInputRef.current.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      const backup = parseBackup(text)
      if (!backup) {
        setBackupError(t('profiles.backup_import_error'))
        return
      }
      if (!confirm(t('profiles.backup_confirm_replace', { count: backup.profiles.length }))) return
      setBackupError(null)
      onRestoreBackup(backup.profiles, backup.credits)
    }
    reader.onerror = () => setBackupError(t('profiles.backup_import_error'))
    reader.readAsText(file)
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

  useEffect(() => {
    if (!csvPreview || !importModalRef.current) return
    const modal = importModalRef.current
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { setCsvPreview(null); return }
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [csvPreview])

  const showForm = adding || editId !== null
  const levels: ProficiencyLevel[] = [1, 2, 3, 4, 5]
  const archivedCount = profiles.filter(p => p.archived).length
  const activeProfiles = profiles.filter(p => !p.archived)
  const visibleProfiles = showArchived ? profiles : activeProfiles

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{t('profiles.title')}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {archivedCount > 0 && (
            <button type="button" onClick={() => setShowArchived(v => !v)} className="btn-secondary text-sm">
              {showArchived ? t('profiles.hide_archived') : t('profiles.show_archived', { count: archivedCount })}
            </button>
          )}
          {selectedIds.length >= 2 && (
            <button
              type="button"
              onClick={() => onCompare(selectedIds)}
              className="btn-primary text-sm"
            >
              {t('profiles.compare_button', { count: selectedIds.length })}
            </button>
          )}
          <button type="button" onClick={openImport} className="btn-secondary text-sm">
            {t('profiles.import')}
          </button>
          <button type="button" onClick={handleExportBackup} className="btn-secondary text-sm">
            {t('profiles.backup_export')}
          </button>
          <button type="button" onClick={openBackupImport} className="btn-secondary text-sm">
            {t('profiles.backup_import')}
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
      <input
        ref={backupInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleBackupFileChange}
      />
      {csvError && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {csvError}
        </div>
      )}
      {backupError && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {backupError}
        </div>
      )}

      {motivatorSnapshot && (
        <div className="flex items-center justify-between gap-3 flex-wrap bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-lg px-4 py-3 text-sm text-brand-900 dark:text-brand-200">
          <span>{t('profiles.motivators_pending', { motivators: topMotivatorLabels(motivatorSnapshot).join(', ') })}</span>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={openAddWithMotivators} className="btn-primary text-sm py-1.5">
              {t('profiles.motivators_use')}
            </button>
            <button
              type="button"
              onClick={dismissMotivatorSnapshot}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2"
            >
              {t('profiles.motivators_dismiss')}
            </button>
          </div>
        </div>
      )}

      <div className="bg-brand-50 dark:bg-gray-800 border border-brand-200 dark:border-gray-700 rounded-xl p-3 text-sm text-brand-900 dark:text-brand-400">
        <strong>{t('profiles.dreyfus_title')}:</strong> {t('profiles.dreyfus_body')}
      </div>

      {activeProfiles.length === 0 && !showForm && !showArchived && (
        <div className="py-10 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">{t('profiles.onboarding_headline')}</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm">{t('profiles.onboarding_subtext')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={openAdd}
              className="card text-left hover:border-brand-300 hover:shadow transition-all cursor-pointer"
            >
              <PersonIcon className="w-6 h-6 mb-2 text-gray-700 dark:text-gray-300" />
              <h4 className="font-medium text-gray-900 dark:text-gray-50 mb-1">{t('profiles.onboarding_add')}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('profiles.onboarding_add_sub')}</p>
            </button>

            <button
              type="button"
              onClick={openAdd}
              className="card text-left hover:border-brand-300 hover:shadow transition-all cursor-pointer border-brand-200 bg-brand-50 dark:bg-gray-800 dark:border-gray-600"
            >
              <BoltIcon className="w-6 h-6 mb-2 text-brand-600 dark:text-brand-400" />
              <h4 className="font-medium text-brand-700 dark:text-brand-400 mb-1">{t('profiles.onboarding_template')}</h4>
              <p className="text-sm text-brand-600 dark:text-brand-400">{t('profiles.onboarding_template_sub')}</p>
            </button>

            <button
              type="button"
              onClick={openImport}
              className="card text-left hover:border-brand-300 hover:shadow transition-all cursor-pointer"
            >
              <InboxIcon className="w-6 h-6 mb-2 text-gray-700 dark:text-gray-300" />
              <h4 className="font-medium text-gray-900 dark:text-gray-50 mb-1">{t('profiles.onboarding_import')}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('profiles.onboarding_import_sub')}</p>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">1</span>
              {t('profiles.onboarding_step1')}
            </span>
            <ArrowRightIcon className="w-3 h-3 text-gray-300 dark:text-gray-600" />
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center text-xs font-bold">2</span>
              {t('profiles.onboarding_step2')}
            </span>
            <ArrowRightIcon className="w-3 h-3 text-gray-300 dark:text-gray-600" />
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center text-xs font-bold">3</span>
              {t('profiles.onboarding_step3')}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleProfiles.map(p => {
          const isSelected = selectedIds.includes(p.id)
          const maxReached = selectedIds.length >= 4 && !isSelected
          return (
          <div
            key={p.id}
            className={`card ${p.archived ? 'opacity-60' : ''} ${isSelected ? 'ring-2 ring-brand-500 border-brand-400' : ''}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                {!p.archived && (
                  <input
                    type="checkbox"
                    aria-label={t('profiles.compare_button', { count: 0 }).replace(/\s*\(.*\)/, '') + ' ' + p.name}
                    checked={isSelected}
                    disabled={maxReached}
                    onChange={() => toggleSelect(p.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-brand-600 cursor-pointer disabled:cursor-not-allowed"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${p.archived ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-gray-50'}`}>{p.name || '—'}</h3>
                    {p.archived && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                        {t('profiles.archived_badge')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{p.role}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {p.archived ? (
                  <>
                    <button
                      type="button"
                      aria-label={`${t('profiles.restore')} ${p.name}`}
                      onClick={() => restoreProfile(p.id)}
                      className="text-xs text-brand-600 hover:text-brand-800 px-2 py-1 rounded hover:bg-brand-50 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                    >
                      {t('profiles.restore')}
                    </button>
                    <button
                      type="button"
                      aria-label={`${t('profiles.delete_permanently')} ${p.name}`}
                      onClick={() => deletePermanently(p.id)}
                      className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1"
                    >
                      {t('profiles.delete_permanently')}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      aria-label={`${t('profiles.edit')} ${p.name}`}
                      onClick={() => openEdit(p)}
                      className="text-xs text-brand-600 hover:text-brand-800 px-2 py-1 rounded hover:bg-brand-50 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                    >
                      {t('profiles.edit')}
                    </button>
                    <button
                      type="button"
                      aria-label={`${t('profile_card.print_button')} ${p.name}`}
                      title={t('profile_card.print_button')}
                      onClick={() => handlePrint(p)}
                      className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M4 5V2h8v3" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="1" y="5" width="14" height="7" rx="1.5"/>
                        <path d="M4 10h8" strokeLinecap="round"/>
                        <path d="M4 10v4h8v-4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-label={`${t('profiles.archive')} ${p.name}`}
                      onClick={() => archiveProfile(p.id)}
                      className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1"
                    >
                      {t('profiles.archive')}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">{t('profiles.capacity')}:</span>
              <span className={`font-medium ${p.archived ? 'text-gray-400 dark:text-gray-600' : 'text-brand-600'}`}>{p.capacity}%</span>
            </div>
            {p.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.skills.map(s => {
                  const endorsements = s.endorsedBy ?? []
                  const isOpen = endorsingSkill?.profileId === p.id && endorsingSkill?.skillId === s.id
                  const skillEndorsers = eligibleEndorsers(activeProfiles, p.id, endorsements)
                  return (
                    <div key={s.id} className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.archived ? 'bg-gray-100 text-gray-400' : LEVEL_COLORS[s.proficiency]}`}>
                          {s.name || '…'} L{s.proficiency}
                        </span>
                        {!p.archived && skillEndorsers.length > 0 && (
                          <button
                            type="button"
                            aria-label={`${t('profiles.endorse_button')}: ${s.name}`}
                            aria-expanded={isOpen}
                            title={t('profiles.endorse_button')}
                            onClick={() => setEndorsingSkill(isOpen ? null : { profileId: p.id, skillId: s.id })}
                            className="text-[10px] leading-none text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 rounded"
                          >
                            +1
                          </button>
                        )}
                        {endorsements.length > 0 && (
                          <span
                            title={endorsements.join(', ')}
                            className="inline-flex items-center gap-0.5 text-[10px] leading-none text-green-600 dark:text-green-400 font-medium"
                          >
                            <CheckIcon className="w-3 h-3" />{endorsements.length}
                          </span>
                        )}
                      </div>
                      {isOpen && (
                        <select
                          className="text-xs input py-0.5 mt-0.5 max-w-[140px]"
                          defaultValue=""
                          onChange={e => {
                            if (e.target.value) endorseSkill(p.id, s.id, e.target.value)
                          }}
                        >
                          <option value="">{t('profiles.endorse_as')}</option>
                          {skillEndorsers.map(q => (
                            <option key={q.id} value={q.name}>{q.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {p.interests.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {p.interests.map((topic, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                    <SparkIcon className="w-3 h-3" />{topic}
                  </span>
                ))}
              </div>
            )}
            {p.workTypes.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <span className="text-xs text-gray-400 dark:text-gray-500">{t('profiles.work_types')}:</span>
                {p.workTypes.map(wt => (
                  <span key={wt} className={`text-xs px-2 py-0.5 rounded-full ${p.archived ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600' : 'bg-brand-100 text-brand-700'}`}>
                    {t(`profile_form.work_types.${wt}`)}
                  </span>
                ))}
              </div>
            )}
            {(() => {
              const openItems = ibItems.filter(item => item.owner === p.name || item.copilot === p.name)
              if (openItems.length === 0) return null
              return (
                <details className="mt-2 group">
                  <summary className="cursor-pointer text-xs text-amber-700 dark:text-amber-400 select-none list-none flex items-center gap-1">
                    <svg className="w-3 h-3 transition-transform group-open:rotate-90" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M6 4l4 4-4 4"/></svg>
                    {t('profiles.ib_items', { count: openItems.length })}
                  </summary>
                  <ul className="mt-1 ml-4 space-y-0.5">
                    {openItems.map(item => (
                      <li key={item.id} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />
                        <span className="truncate">{item.title}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )
            })()}
            {(() => {
              const kdCards = kanbanDesignerCards.get(p.name) ?? []
              if (kdCards.length === 0) return null
              return (
                <details className="mt-2 group">
                  <summary className="cursor-pointer text-xs text-indigo-700 dark:text-indigo-400 select-none list-none flex items-center gap-1">
                    <svg className="w-3 h-3 transition-transform group-open:rotate-90" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M6 4l4 4-4 4"/></svg>
                    {t('profiles.kanban_cards', { count: kdCards.length })}
                  </summary>
                  <ul className="mt-1 ml-4 space-y-0.5">
                    {kdCards.map((card, i) => (
                      <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" aria-hidden="true" />
                        <span className="truncate">{card.title}</span>
                        <span className="text-gray-400 dark:text-gray-600 shrink-0">· {card.column}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )
            })()}
          </div>
        )
        })}
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">
            {editId ? t('profile_form.title_edit') : t('profile_form.title_new')}
          </h3>

          {!editId && (
            <div>
              <label className="label">{t('profile_form.template_label')}</label>
              <div className="flex flex-wrap gap-2">
                {ROLE_TEMPLATES.map(template => (
                  <button
                    key={template.role}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    aria-pressed={selectedTemplateRole === template.role}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      selectedTemplateRole === template.role
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {template.role}
                  </button>
                ))}
              </div>
            </div>
          )}

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
              <button type="button" onClick={addSkill} className="text-xs text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300">
                + {t('profile_form.add_skill')}
              </button>
            </div>
            <datalist id="skill-name-vocabulary">
              {skillVocabulary.map(name => <option key={name} value={name} />)}
            </datalist>
            {draft.skills.map(s => (
              <div key={s.id} className="flex gap-2 mb-2 items-center flex-wrap">
                <input
                  className="input flex-1 min-w-[8rem]"
                  value={s.name}
                  placeholder={t('profile_form.skill_name_placeholder')}
                  onChange={e => updateSkill(s.id, { name: e.target.value })}
                  list="skill-name-vocabulary"
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
                  aria-label={t('profile_form.remove_skill')}
                  className="text-gray-400 dark:text-gray-500 hover:text-red-400"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
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
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" aria-hidden="true" onClick={() => setCsvPreview(null)}>
          <div
            ref={importModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-modal-title"
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 id="import-modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-50">{t('profiles.import_modal_title')}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
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
            <div className="max-h-48 overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-lg divide-y divide-gray-50 dark:divide-gray-700">
              {csvPreview.map((csv, i) => {
                const isUpdate = profiles.some(p => p.name.toLowerCase() === csv.name.toLowerCase())
                return (
                  <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="text-gray-800 dark:text-gray-100 font-medium">{csv.name}</span>
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

      {printingProfile && createPortal(
        <div id="print-target">
          <div style={{ padding: '2cm', fontFamily: 'Helvetica, Arial, sans-serif', maxWidth: '800px', margin: '0 auto', color: '#111827' }}>
            <div style={{ borderBottom: '2px solid #f59e0b', paddingBottom: '12px', marginBottom: '20px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 4px', color: '#111827' }}>{printingProfile.name}</h1>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px' }}>{printingProfile.role}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0 }}>Capacity: {printingProfile.capacity}%</span>
                <div style={{ flex: 1, height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${printingProfile.capacity}%`, backgroundColor: '#f59e0b', borderRadius: '3px' }} />
                </div>
              </div>
            </div>

            {printingProfile.skills.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: '10px' }}>
                  Skills
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {printingProfile.skills.map(s => (
                    <span key={s.id} style={{ fontSize: '12px', padding: '3px 10px', border: '1px solid #d1d5db', borderRadius: '999px', backgroundColor: '#f9fafb', color: '#374151' }}>
                      {s.name}
                      <span style={{ color: '#9ca3af', marginLeft: '4px' }}>
                        · {t(`profile_form.proficiency.${s.proficiency}`)}
                      </span>
                      {(s.endorsedBy ?? []).length > 0 && (
                        <span style={{ color: '#16a34a', marginLeft: '4px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          <CheckIcon className="w-3 h-3" />{s.endorsedBy!.length}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {printingProfile.workTypes.length > 0 && (
              <div>
                <h2 style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: '10px' }}>
                  Work Types
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {printingProfile.workTypes.map(wt => (
                    <span key={wt} style={{ fontSize: '12px', padding: '3px 10px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '999px' }}>
                      {t(`profile_form.work_types.${wt}`)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
