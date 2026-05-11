import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdateToast() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg bg-amber-700 px-4 py-3 text-white shadow-lg">
      <span className="text-sm">Update available</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="rounded bg-white px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
      >
        Reload
      </button>
    </div>
  )
}
