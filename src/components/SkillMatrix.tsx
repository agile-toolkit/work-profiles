import { useTranslation } from 'react-i18next';
import type { WorkProfile } from '../types';

interface Props {
  profiles: WorkProfile[];
}

const LEVEL_BG: Record<number, string> = {
  0: 'bg-slate-100 text-slate-300',
  1: 'bg-slate-200 text-slate-600',
  2: 'bg-blue-100 text-blue-600',
  3: 'bg-green-100 text-green-700',
  4: 'bg-purple-100 text-purple-700',
  5: 'bg-amber-100 text-amber-700',
};

export default function SkillMatrix({ profiles }: Props) {
  const { t } = useTranslation();

  if (profiles.length === 0 || profiles.every(p => p.skills.length === 0)) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">{t('matrix.noData')}</p>
      </div>
    );
  }

  // Collect all unique skills across all profiles
  const skillMap = new Map<string, { name: string; category: string }>();
  profiles.forEach(p => {
    p.skills.forEach(s => {
      if (s.name.trim()) skillMap.set(s.name, { name: s.name, category: s.category });
    });
  });
  const allSkills = Array.from(skillMap.values()).sort((a, b) =>
    a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
  );

  // Group by category
  const categories = Array.from(new Set(allSkills.map(s => s.category || 'Other')));

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-slate-800">{t('matrix.title')}</h2>

      <div className="overflow-x-auto">
        <table className="text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 bg-slate-100 border border-slate-200 font-semibold text-slate-600 sticky left-0 z-10 min-w-[120px]">
                {t('matrix.skill')}
              </th>
              {profiles.map(p => (
                <th key={p.id} className="px-3 py-2 bg-slate-100 border border-slate-200 font-semibold text-slate-700 text-center whitespace-nowrap">
                  <div>{p.name}</div>
                  <div className="text-xs font-normal text-slate-400">{p.role}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => {
              const catSkills = allSkills.filter(s => (s.category || 'Other') === cat);
              return catSkills.map((skill, si) => (
                <tr key={skill.name} className="hover:bg-slate-50">
                  <td className="px-3 py-1.5 border border-slate-200 bg-white sticky left-0 z-10">
                    {si === 0 && (
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">{cat}</div>
                    )}
                    <span className="text-slate-700">{skill.name}</span>
                  </td>
                  {profiles.map(p => {
                    const found = p.skills.find(s => s.name === skill.name);
                    const level = found?.level ?? 0;
                    return (
                      <td key={p.id} className="px-2 py-1.5 border border-slate-200 text-center">
                        <span className={`inline-block w-8 h-6 rounded text-xs font-bold leading-6 ${LEVEL_BG[level]}`}>
                          {level > 0 ? level : '–'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap text-xs">
        <span className="text-slate-500 font-semibold">Level:</span>
        {[1, 2, 3, 4, 5].map(l => (
          <span key={l} className={`px-2 py-0.5 rounded ${LEVEL_BG[l]}`}>
            L{l} – {t(`profiles.levels.${l}`)}
          </span>
        ))}
      </div>
    </div>
  );
}
