import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { WorkProfile, Credit, View } from './types';
import ProfilesView from './components/ProfilesView';
import SkillMatrix from './components/SkillMatrix';
import CreditsView from './components/CreditsView';

const PROFILES_KEY = 'wp-profiles';
const CREDITS_KEY = 'wp-credits';

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

export default function App() {
  const { i18n } = useTranslation();
  const [view, setView] = useState<View>('profiles');
  const [profiles, setProfiles] = useState<WorkProfile[]>(() => load(PROFILES_KEY, []));
  const [credits, setCredits] = useState<Credit[]>(() => load(CREDITS_KEY, []));

  useEffect(() => { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => { localStorage.setItem(CREDITS_KEY, JSON.stringify(credits)); }, [credits]);

  const navItems: { key: View; labelKey: string }[] = [
    { key: 'profiles', labelKey: 'nav.profiles' },
    { key: 'matrix', labelKey: 'nav.matrix' },
    { key: 'credits', labelKey: 'nav.credits' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-brand-600 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">Work Profiles</span>
          <button
            onClick={() => i18n.changeLanguage(i18n.language.startsWith('ru') ? 'en' : 'ru')}
            className="text-sm bg-brand-700 hover:bg-brand-500 px-3 py-1 rounded transition-colors"
          >
            {i18n.language.startsWith('ru') ? 'EN' : 'RU'}
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-4 pb-1 flex gap-1">
          {navItems.map(n => (
            <NavBtn key={n.key} active={view === n.key} labelKey={n.labelKey} onClick={() => setView(n.key)} />
          ))}
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {view === 'profiles' && <ProfilesView profiles={profiles} onProfiles={setProfiles} />}
        {view === 'matrix' && <SkillMatrix profiles={profiles} />}
        {view === 'credits' && <CreditsView credits={credits} profiles={profiles} onCredits={setCredits} />}
      </main>
    </div>
  );
}

function NavBtn({ active, labelKey, onClick }: { active: boolean; labelKey: string; onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <button onClick={onClick} className={`px-3 py-1 text-sm rounded-t transition-colors ${active ? 'bg-white text-brand-700 font-semibold' : 'text-sky-100 hover:text-white hover:bg-brand-500'}`}>
      {t(labelKey)}
    </button>
  );
}
