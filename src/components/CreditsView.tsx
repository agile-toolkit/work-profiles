import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Credit, WorkProfile } from '../types';

interface Props {
  credits: Credit[];
  profiles: WorkProfile[];
  onCredits: (c: Credit[]) => void;
}

export default function CreditsView({ credits, profiles, onCredits }: Props) {
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ memberId: '', project: '', description: '', points: 3, date: new Date().toISOString().slice(0, 10) });

  function addCredit() {
    if (!form.memberId || !form.project.trim()) return;
    const credit: Credit = { id: crypto.randomUUID(), ...form };
    onCredits([...credits, credit]);
    setForm({ memberId: '', project: '', description: '', points: 3, date: new Date().toISOString().slice(0, 10) });
    setAdding(false);
  }

  function deleteCredit(id: string) {
    onCredits(credits.filter(c => c.id !== id));
  }

  // Leaderboard
  const totals = profiles.map(p => ({
    profile: p,
    total: credits.filter(c => c.memberId === p.id).reduce((s, c) => s + c.points, 0),
  })).sort((a, b) => b.total - a.total);
  const maxTotal = totals[0]?.total || 1;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">{t('credits.title')}</h2>
        {profiles.length > 0 && (
          <button onClick={() => setAdding(true)} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + {t('credits.addCredit')}
          </button>
        )}
      </div>

      <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-sm text-brand-800">
        {t('credits.explainer')}
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('credits.person')}</label>
              <select value={form.memberId} onChange={e => setForm(f => ({ ...f, memberId: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                <option value="">Select person...</option>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('credits.project')}</label>
              <input type="text" value={form.project} placeholder={t('credits.projectPlaceholder')} onChange={e => setForm(f => ({ ...f, project: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('credits.description')}</label>
              <input type="text" value={form.description} placeholder={t('credits.descriptionPlaceholder')} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('credits.points')} ({form.points})</label>
                <input type="range" min={1} max={5} step={1} value={form.points} onChange={e => setForm(f => ({ ...f, points: Number(e.target.value) }))} className="w-full accent-brand-600" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('credits.date')}</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="border border-slate-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addCredit} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">{t('credits.add')}</button>
            <button onClick={() => setAdding(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">{t('credits.cancel')}</button>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {totals.some(t => t.total > 0) && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-3 text-sm">{t('credits.leaderboard')}</h3>
          <div className="space-y-2">
            {totals.filter(t => t.total > 0).map((item, idx) => (
              <div key={item.profile.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-400 w-5">{idx + 1}</span>
                <span className="text-sm font-medium text-slate-700 w-24 truncate">{item.profile.name}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div className="h-2 bg-brand-500 rounded-full transition-all" style={{ width: `${(item.total / maxTotal) * 100}%` }} />
                </div>
                <span className="text-sm font-bold text-brand-600 w-16 text-right">{item.total} {t('credits.total')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credits log */}
      {credits.length === 0 ? (
        <p className="text-slate-400 text-sm italic">{t('credits.noCredits')}</p>
      ) : (
        <div className="space-y-2">
          {credits.slice().reverse().map(credit => {
            const person = profiles.find(p => p.id === credit.memberId);
            return (
              <div key={credit.id} className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-3 shadow-sm">
                <span className="text-lg font-bold text-brand-600 min-w-[2rem] text-center">{credit.points}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800 text-sm">{person?.name ?? '?'}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-sm text-slate-600">{credit.project}</span>
                  </div>
                  {credit.description && <p className="text-xs text-slate-400 mt-0.5">{credit.description}</p>}
                </div>
                <span className="text-xs text-slate-400 shrink-0">{credit.date}</span>
                <button onClick={() => deleteCredit(credit.id)} className="text-slate-200 hover:text-red-400 text-base transition-colors">×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
