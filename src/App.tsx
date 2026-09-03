import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Screen, WorkProfile, ProjectCredit } from './types'
import ProfilesView from './components/ProfilesView'
import SkillMatrix from './components/SkillMatrix'
import CreditsView from './components/CreditsView'
import LearnView from './components/LearnView'
import CompareView from './components/CompareView'
import OverviewView from './components/OverviewView'
import UpdateToast from './components/UpdateToast'
import AppHeader from './components/AppHeader'
import ThemeToggle from './components/ThemeToggle'
import FacilitatorToggle from './components/FacilitatorToggle'
import { useFacilitatorMode } from './components/useFacilitatorMode'
import { publishLastSession, publishSprintCapacity, publishExport } from './publish'

const PROFILES_KEY = 'work-profiles-data'
const CREDITS_KEY = 'work-profiles-credits'

function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]')
  } catch {
    return []
  }
}

function save<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // Storage full or unavailable (e.g. private browsing) — in-memory state still reflects the change.
  }
}

export default function App() {
  const { t } = useTranslation()
  const [facilitatorMode, toggleFacilitatorMode] = useFacilitatorMode('work-profiles:facilitatorMode')
  const [screen, setScreen] = useState<Screen>('profiles')
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [announcement, setAnnouncement] = useState('')
  const [profiles, setProfiles] = useState<WorkProfile[]>(() => {
    const data = load<WorkProfile>(PROFILES_KEY)
    publishExport(data)
    publishLastSession(data)
    publishSprintCapacity(data)
    return data
  })
  const [credits, setCredits] = useState<ProjectCredit[]>(() => load(CREDITS_KEY))

  const updateProfiles = (next: WorkProfile[]) => {
    setProfiles(next)
    save(PROFILES_KEY, next)
    publishExport(next)
    publishLastSession(next)
    publishSprintCapacity(next)
  }

  const updateCredits = (next: ProjectCredit[]) => {
    setCredits(next)
    save(CREDITS_KEY, next)
  }

  const navItems: { key: Screen; label: string }[] = [
    { key: 'profiles', label: t('nav.profiles') },
    { key: 'matrix', label: t('nav.matrix') },
    { key: 'credits', label: t('nav.credits') },
    { key: 'learn', label: t('nav.learn') },
    { key: 'overview', label: t('nav.overview') },
  ]

  return (
    <div data-accent="amber" className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50">
      <AppHeader
        title={t('app.title')}
        onTitleClick={() => setScreen('profiles')}
        hideLanguagePicker={facilitatorMode}
        navItems={facilitatorMode ? [] : navItems.map(item => ({
          key: item.key,
          label: item.label,
          active: screen === item.key,
          onClick: () => setScreen(item.key),
        }))}
      >
        <ThemeToggle />
        <FacilitatorToggle
          active={facilitatorMode}
          onToggle={toggleFacilitatorMode}
          labelOn={t('facilitator.toggle_on')}
          labelOff={t('facilitator.toggle_off')}
        />
      </AppHeader>

      <div aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</div>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {screen === 'profiles' && (
          <ProfilesView
            profiles={profiles}
            onProfiles={updateProfiles}
            onCompare={ids => { setCompareIds(ids); setScreen('compare') }}
            onAnnounce={msg => { setAnnouncement(''); requestAnimationFrame(() => setAnnouncement(msg)) }}
          />
        )}
        {screen === 'compare' && (
          <CompareView
            profiles={compareIds.map(id => profiles.find(p => p.id === id)).filter((p): p is WorkProfile => p !== undefined)}
            onBack={() => setScreen('profiles')}
          />
        )}
        {screen === 'matrix' && <SkillMatrix profiles={profiles.filter(p => !p.archived)} />}
        {screen === 'credits' && (
          <CreditsView
            credits={credits}
            profiles={profiles}
            onAdd={c => updateCredits([...credits, c])}
            onDelete={id => updateCredits(credits.filter(c => c.id !== id))}
          />
        )}
        {screen === 'learn' && <LearnView />}
        {screen === 'overview' && <OverviewView profiles={profiles} />}
      </main>
      <UpdateToast />
    </div>
  )
}
