import { useScreeningStore } from '../store/screeningStore'
import { useScreening } from '../hooks/useScreening'
import { useEffect } from 'react'

export function FilterPanel() {
  const { filters, setFilter, resetFilters } = useScreeningStore()
  const { fetchStocks } = useScreening()

  useEffect(() => {
    fetchStocks()
  }, [filters])

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-700">フィルター</h3>
        <button
          onClick={resetFilters}
          className="text-xs text-slate-400 hover:text-slate-600 underline"
        >
          リセット
        </button>
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">
          最低スコア: <span className="font-medium text-slate-700">{filters.minScore}</span>
        </label>
        <input
          type="range" min={0} max={100} step={5}
          value={filters.minScore}
          onChange={(e) => setFilter('minScore', Number(e.target.value))}
          className="w-full accent-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">PER 上限</label>
        <input
          type="number" min={1} max={100} placeholder="制限なし"
          value={filters.maxPer ?? ''}
          onChange={(e) => setFilter('maxPer', e.target.value ? Number(e.target.value) : null)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">PBR 上限</label>
        <input
          type="number" min={0.1} max={10} step={0.1} placeholder="制限なし"
          value={filters.maxPbr ?? ''}
          onChange={(e) => setFilter('maxPbr', e.target.value ? Number(e.target.value) : null)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">配当利回り 下限 (%)</label>
        <input
          type="number" min={0} max={20} step={0.5} placeholder="制限なし"
          value={filters.minDividend ?? ''}
          onChange={(e) => setFilter('minDividend', e.target.value ? Number(e.target.value) : null)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-2">市場区分</label>
        <div className="flex flex-col gap-1">
          {['プライム', 'スタンダード', 'グロース'].map((m) => (
            <label key={m} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.markets.includes(m)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...filters.markets, m]
                    : filters.markets.filter((x) => x !== m)
                  setFilter('markets', next)
                }}
                className="accent-blue-500"
              />
              <span className="text-sm text-slate-600">{m}</span>
            </label>
          ))}
          {filters.markets.length > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">
              ※スクリーニング時も選択市場のみ対象
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-2">候補タグ</label>
        <div className="flex flex-col gap-1">
          {[null, '2x候補', '10x候補'].map((tag) => (
            <label key={String(tag)} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="candidateTag"
                checked={filters.candidateTag === tag}
                onChange={() => setFilter('candidateTag', tag)}
                className="accent-blue-500"
              />
              <span className="text-sm text-slate-600">{tag ?? 'すべて'}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">並び順</label>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilter('sortBy', e.target.value)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="composite_score">総合スコア</option>
          <option value="per">PER</option>
          <option value="pbr">PBR</option>
          <option value="revenue_growth">成長率</option>
          <option value="dividend_yield">配当利回り</option>
          <option value="market_cap">時価総額</option>
        </select>
        <div className="flex gap-2 mt-2">
          {(['desc', 'asc'] as const).map((dir) => (
            <label key={dir} className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="sortDir"
                checked={filters.sortDir === dir}
                onChange={() => setFilter('sortDir', dir)}
                className="accent-blue-500"
              />
              <span className="text-xs text-slate-600">{dir === 'desc' ? '降順' : '昇順'}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
