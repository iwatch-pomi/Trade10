import type { ScreeningProgress } from '../types/stock'

interface Props {
  progress: ScreeningProgress
}

export function ProgressBar({ progress }: Props) {
  const isRunning = progress.status === 'running'
  const statusLabel = {
    idle: '',
    running: 'スクリーニング中',
    completed: '完了',
    failed: 'エラー',
  }[progress.status]

  if (progress.status === 'idle') return null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isRunning && (
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
          )}
          <span className="text-sm font-medium text-slate-700">{statusLabel}</span>
          {progress.currentTicker && isRunning && (
            <span className="text-xs text-slate-400">({progress.currentTicker})</span>
          )}
        </div>
        <span className="text-sm text-slate-500">
          {progress.processed} / {progress.total} 銘柄 ({progress.pct}%)
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            progress.status === 'failed' ? 'bg-red-500' :
            progress.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progress.pct}%` }}
        />
      </div>
    </div>
  )
}
