import { useState } from 'react'
import { useScreeningStore } from '../store/screeningStore'
import { useScreening } from '../hooks/useScreening'

export function ScreeningControls() {
  const [forceRefresh, setForceRefresh] = useState(false)
  const [maxStocks, setMaxStocks] = useState<number | null>(null)
  const { job } = useScreeningStore()
  const { start } = useScreening()

  const isRunning = job?.status === 'running' || job?.status === 'queued'

  const handleStart = () => {
    if (isRunning) return
    start({ force_refresh: forceRefresh, max_stocks: maxStocks })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={handleStart}
          disabled={isRunning}
          className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
            isRunning
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
          }`}
        >
          {isRunning ? '実行中...' : '割安株を探す'}
        </button>

        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={forceRefresh}
            onChange={(e) => setForceRefresh(e.target.checked)}
            className="accent-blue-500"
          />
          キャッシュを無視して再取得
        </label>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500">最大銘柄数</label>
        <input
          type="number"
          min={10}
          max={500}
          placeholder="全銘柄"
          value={maxStocks ?? ''}
          onChange={(e) => setMaxStocks(e.target.value ? Number(e.target.value) : null)}
          className="w-24 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
    </div>
  )
}
