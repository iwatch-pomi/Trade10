import type { ScreenJob } from '../types/stock'

interface Props {
  job: ScreenJob
}

export function ProgressBar({ job }: Props) {
  const isRunning = job.status === 'running' || job.status === 'queued'
  const statusLabel = {
    queued: '待機中...',
    running: 'スクリーニング中',
    completed: '完了',
    failed: 'エラー',
  }[job.status]

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isRunning && (
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
          )}
          <span className="text-sm font-medium text-slate-700">{statusLabel}</span>
          {job.current_ticker && isRunning && (
            <span className="text-xs text-slate-400">({job.current_ticker})</span>
          )}
        </div>
        <span className="text-sm text-slate-500">
          {job.processed} / {job.total} 銘柄 ({job.pct.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            job.status === 'failed' ? 'bg-red-500' :
            job.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${job.pct}%` }}
        />
      </div>
      {job.error && (
        <p className="text-xs text-red-500 mt-2">{job.error}</p>
      )}
      {job.failed > 0 && (
        <p className="text-xs text-slate-400 mt-1">取得失敗: {job.failed} 銘柄</p>
      )}
    </div>
  )
}
