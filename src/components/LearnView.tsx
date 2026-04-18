import { useTranslation } from 'react-i18next'

export default function LearnView() {
  const { t } = useTranslation()
  const levels = t('learn.levels', { returnObjects: true }) as string[]
  const principles = ['p1', 'p2', 'p3', 'p4'] as const

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('learn.title')}</h1>
      <div className="card">
        <p className="text-sm text-gray-600 leading-relaxed">{t('learn.intro')}</p>
      </div>
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-2">{t('learn.profiles_title')}</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{t('learn.profiles_body')}</p>
      </div>
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-2">{t('learn.credits_title')}</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{t('learn.credits_body')}</p>
      </div>
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">{t('learn.dreyfus_title')}</h2>
        <div className="space-y-2">
          {levels.map((level, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-gray-700 ${
                ['bg-red-200','bg-orange-200','bg-yellow-200','bg-lime-300','bg-green-400'][i]
              }`}>{i+1}</span>
              <span className="text-gray-600">{level}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card bg-brand-50 border-brand-100">
        <h2 className="font-semibold text-brand-900 mb-3">{t('learn.principles_title')}</h2>
        <ul className="space-y-2">
          {principles.map(p => (
            <li key={p} className="flex gap-2 text-sm text-brand-800">
              <span className="text-brand-500">✓</span>
              {t(`learn.${p}`)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
