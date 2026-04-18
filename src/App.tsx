import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Screen, WorkProfile, ProjectCredit } from './types'
import ProfilesView from './components/ProfilesView'
import SkillMatrix from './components/SkillMatrix'
import CreditsView from './components/CreditsView'
import LearnView from './components/LearnView'

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
  localStorage.setItem(key, JSON.stringify(data))
}

export default function App() {
  const { t, i18n } = useTranslation()
  const [screen, setScreen] = useState<Screen>('profiles')
  const [profiles, setProfiles] = useState<WorkProfile[]>(() => load(PROFILES_KEY))
  const [credits, setCredits] = useState<ProjectCredit[]>(() => load(CREDITS_KEY))

  const updateProfiles = (next: WorkProfile[]) => {
    setProfiles(next)
    save(PROFILES_KEY, next)
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
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setScreen('profiles')}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {t('app.title')}
          </button>
          <div className="flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => setScreen(item.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  screen === item.key ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => i18n.changeLanguage(i18n.language.startsWith('ru') ? 'en' : 'ru')}
              className="ml-2 text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
            >
              {i18n.language.startsWith('ru') ? 'EN' : 'RU'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {screen === 'profiles' && (
          <ProfilesView profiles={profiles} onProfiles={updateProfiles} />
        )}
        {screen === 'matrix' && <SkillMatrix profiles={profiles} />}
        {screen === 'credits' && (
          <CreditsView
            credits={credits}
            profiles={profiles}
            onAdd={c => updateCredits([...credits, c])}
            onDelete={id => updateCredits(credits.filter(c => c.id !== id))}
          />
        )}
        {screen === 'learn' && <LearnView />}
      </main>
    </div>
  )
}
