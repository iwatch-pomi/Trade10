import { useState } from 'react'
import { useScreeningStore } from '../store/screeningStore'
import { useScreening } from '../hooks/useScreening'

export function ScreeningControls() {
  const [forceRefresh, setForceRefresh] = useState(false)
  const [maxStocks, setMaxStocks] = useState<number | null>(null)
  const { progress } = useScreeningStore()
  const { start, stop } = useScreening()

  const isRunning = progress.status === 'running'

  const handleStart = () => {
    if (isRunning) {
      stop()
      return
    }
    start({ force_refresh: forceRefresh, max_stocks: maxStocks })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={handleStart}
          className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
            isRunning
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
          }`}
        >
          {isRunning ? '停止' : '割安株を探す'}
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
          max={5000}
          placeholder="全銘柄"
          value={maxStocks ?? ''}
          onChange={(e) => setMaxStocks(e.target.value ? Number(e.target.value) : null)}
          className="w-28 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <span className="text-xs text-slate-400">（空白=市場区分に応じた全銘柄）</span>
      </div>
    </div>
  )
}
