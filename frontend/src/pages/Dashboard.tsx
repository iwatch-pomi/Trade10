import { useEffect } from 'react'
import { useScreeningStore } from '../store/screeningStore'
import { useScreening } from '../hooks/useScreening'
import { ScreeningControls } from '../components/ScreeningControls'
import { ProgressBar } from '../components/ProgressBar'
import { FilterPanel } from '../components/FilterPanel'
import { StockTable } from '../components/StockTable'
import { StockDetailModal } from '../components/StockDetailModal'

export function Dashboard() {
  const { job, selectedTicker, setSelectedTicker, stocks } = useScreeningStore()
  const { fetchStocks } = useScreening()

  useEffect(() => {
    fetchStocks()
  }, [])

  const showProgress = job && (job.status === 'running' || job.status === 'queued' || job.status === 'completed' || job.status === 'failed')

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              割安株ファインダー
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">2倍〜10倍を目指せる東証上場銘柄を全自動でスクリーニング</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {stocks.length > 0 && (
              <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                {stocks.length} 銘柄
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-4">
        {/* Screening Controls */}
        <ScreeningControls />

        {/* Progress */}
        {showProgress && <ProgressBar job={job} />}

        {/* Tag summary */}
        {stocks.length > 0 && <TagSummary />}

        {/* Main content */}
        <div className="flex gap-4">
          {/* Filter sidebar */}
          <div className="w-56 flex-shrink-0">
            <FilterPanel />
          </div>

          {/* Stock table */}
          <div className="flex-1 min-w-0">
            <StockTable onSelectStock={setSelectedTicker} />
          </div>
        </div>
      </main>

      {/* Detail modal */}
      {selectedTicker && (
        <StockDetailModal
          ticker={selectedTicker}
          onClose={() => setSelectedTicker(null)}
        />
      )}
    </div>
  )
}

function TagSummary() {
  const { stocks, setFilter } = useScreeningStore()
  const { fetchStocks } = useScreening()
  const tenX = stocks.filter((s) => s.candidate_tag === '10x候補').length
  const twoX = stocks.filter((s) => s.candidate_tag === '2x候補').length

  const handleTagClick = (tag: string | null) => {
    setFilter('candidateTag', tag)
    fetchStocks()
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={() => handleTagClick('10x候補')}
        className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2.5 text-left hover:bg-purple-100 transition-colors"
      >
        <div className="text-2xl font-bold text-purple-700">{tenX}</div>
        <div className="text-xs text-purple-500">10x 候補銘柄</div>
      </button>
      <button
        onClick={() => handleTagClick('2x候補')}
        className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-left hover:bg-blue-100 transition-colors"
      >
        <div className="text-2xl font-bold text-blue-700">{twoX}</div>
        <div className="text-xs text-blue-500">2x 候補銘柄</div>
      </button>
      <button
        onClick={() => handleTagClick(null)}
        className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-left hover:bg-slate-100 transition-colors"
      >
        <div className="text-2xl font-bold text-slate-700">{stocks.length}</div>
        <div className="text-xs text-slate-400">全銘柄（フィルター後）</div>
      </button>
    </div>
  )
}
