import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { WorkProfile, Skill, ProficiencyLevel } from '../types';

interface Props {
  profiles: WorkProfile[];
  onProfiles: (p: WorkProfile[]) => void;
}

const LEVEL_COLORS: Record<number, string> = {
  1: 'bg-slate-200 text-slate-600',
  2: 'bg-blue-100 text-blue-700',
  3: 'bg-green-100 text-green-700',
  4: 'bg-purple-100 text-purple-700',
  5: 'bg-amber-100 text-amber-700',
};

export default function ProfilesView({ profiles, onProfiles }: Props) {
  const { t } = useTranslation();
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function makeEmpty(): WorkProfile {
    return {
      id: crypto.randomUUID(),
      name: '',
      role: '',
      skills: [],
      interests: [],
      preferredWorkTypes: [],
      capacityPct: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const [draft, setDraft] = useState<WorkProfile>(makeEmpty());

  function openAdd() { setDraft(makeEmpty()); setAdding(true); setEditId(null); }
  function openEdit(p: WorkProfile) { setDraft({ ...p }); setEditId(p.id); setAdding(false); }

  function saveDraft() {
    if (!draft.name.trim()) return;
    const updated = { ...draft, updatedAt: new Date().toISOString() };
    if (editId) {
      onProfiles(profiles.map(p => p.id === editId ? updated : p));
    } else {
      onProfiles([...profiles, updated]);
    }
    setAdding(false);
    setEditId(null);
  }

  function deleteProfile(id: string) {
    onProfiles(profiles.filter(p => p.id !== id));
    if (editId === id) setEditId(null);
  }

  function addSkill() {
    setDraft(d => ({
      ...d,
      skills: [...d.skills, { id: crypto.randomUUID(), name: '', category: '', level: 3 }],
    }));
  }

  function updateSkill(id: string, patch: Partial<Skill>) {
    setDraft(d => ({ ...d, skills: d.skills.map(s => s.id === id ? { ...s, ...patch } : s) }));
  }

  function removeSkill(id: string) {
    setDraft(d => ({ ...d, skills: d.skills.filter(s => s.id !== id) }));
  }

  function addInterest() {
    setDraft(d => ({ ...d, interests: [...d.interests, { id: crypto.randomUUID(), topic: '' }] }));
  }

  const [workTypeInput, setWorkTypeInput] = useState('');
  function addWorkType() {
    if (!workTypeInput.trim()) return;
    setDraft(d => ({ ...d, preferredWorkTypes: [...d.preferredWorkTypes, workTypeInput.trim()] }));
    setWorkTypeInput('');
  }

  const showForm = adding || editId !== null;
  const levels = [1, 2, 3, 4, 5] as ProficiencyLevel[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">{t('profiles.title')}</h2>
        <button onClick={openAdd} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + {t('profiles.addProfile')}
        </button>
      </div>

      {/* Dreyfus explainer */}
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 text-xs text-brand-800">
        <strong>{t('profiles.dreyfus')}:</strong> {t('profiles.dreyfusText')}
      </div>

      {/* Profile cards */}
      {profiles.length === 0 && !showForm && (
        <p className="text-slate-400 text-sm italic">{t('profiles.noProfiles')}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.map(p => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{p.name}</h3>
                <p className="text-sm text-slate-500">{p.role}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="text-xs text-brand-600 hover:text-brand-800 px-2 py-1 rounded hover:bg-brand-50 transition-colors">Edit</button>
                <button onClick={() => deleteProfile(p.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors">{t('profiles.delete')}</button>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-500">Capacity:</span>
              <span className="text-xs font-medium text-brand-600">{p.capacityPct}%</span>
            </div>
            {p.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {p.skills.map(s => (
                  <span key={s.id} className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[s.level]}`}>
                    {s.name} L{s.level}
                  </span>
                ))}
              </div>
            )}
            {p.interests.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {p.interests.map(i => (
                  <span key={i.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">✦ {i.topic}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-800">{editId ? 'Edit Profile' : t('profiles.addProfile')}</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('profiles.name')}</label>
              <input type="text" value={draft.name} placeholder={t('profiles.namePlaceholder')} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('profiles.role')}</label>
              <input type="text" value={draft.role} placeholder={t('profiles.rolePlaceholder')} onChange={e => setDraft(d => ({ ...d, role: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('profiles.capacity')} ({draft.capacityPct}%)</label>
            <input type="range" min={0} max={100} step={5} value={draft.capacityPct} onChange={e => setDraft(d => ({ ...d, capacityPct: Number(e.target.value) }))} className="w-full accent-brand-600" />
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600">{t('profiles.addSkill')}</label>
              <button onClick={addSkill} className="text-xs text-brand-600 hover:text-brand-800">+ Add</button>
            </div>
            {draft.skills.map(s => (
              <div key={s.id} className="flex gap-2 mb-2 items-center">
                <input type="text" value={s.name} placeholder={t('profiles.skillNamePlaceholder')} onChange={e => updateSkill(s.id, { name: e.target.value })}
                  className="flex-1 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400" />
                <input type="text" value={s.category} placeholder={t('profiles.skillCategoryPlaceholder')} onChange={e => updateSkill(s.id, { category: e.target.value })}
                  className="w-28 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400" />
                <select value={s.level} onChange={e => updateSkill(s.id, { level: Number(e.target.value) as ProficiencyLevel })}
                  className="w-24 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400">
                  {levels.map(l => <option key={l} value={l}>L{l} {t(`profiles.levels.${l}`)}</option>)}
                </select>
                <button onClick={() => removeSkill(s.id)} className="text-slate-300 hover:text-red-400 text-base">×</button>
              </div>
            ))}
          </div>

          {/* Interests */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600">{t('profiles.addInterest')}</label>
              <button onClick={addInterest} className="text-xs text-brand-600 hover:text-brand-800">+ Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {draft.interests.map(i => (
                <div key={i.id} className="flex items-center gap-1">
                  <input type="text" value={i.topic} placeholder={t('profiles.interestPlaceholder')} onChange={e => setDraft(d => ({ ...d, interests: d.interests.map(x => x.id === i.id ? { ...x, topic: e.target.value } : x) }))}
                    className="border border-slate-200 rounded px-2 py-1 text-sm w-36 focus:outline-none focus:ring-1 focus:ring-brand-400" />
                  <button onClick={() => setDraft(d => ({ ...d, interests: d.interests.filter(x => x.id !== i.id) }))} className="text-slate-300 hover:text-red-400 text-base">×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Work types */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">{t('profiles.workTypes')}</label>
            <div className="flex gap-2">
              <input type="text" value={workTypeInput} placeholder={t('profiles.workTypePlaceholder')} onChange={e => setWorkTypeInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addWorkType()}
                className="flex-1 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400" />
              <button onClick={addWorkType} className="text-xs bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1 rounded transition-colors">Add</button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {draft.preferredWorkTypes.map((wt, i) => (
                <span key={i} className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  {wt}
                  <button onClick={() => setDraft(d => ({ ...d, preferredWorkTypes: d.preferredWorkTypes.filter((_, j) => j !== i) }))} className="text-brand-400 hover:text-red-400">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={saveDraft} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">{t('profiles.save')}</button>
            <button onClick={() => { setAdding(false); setEditId(null); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">{t('profiles.cancel')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
