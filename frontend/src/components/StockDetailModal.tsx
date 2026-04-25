import { useEffect, useState } from 'react'
import { getStockDetail } from '../api/client'
import type { StockDetail } from '../types/stock'
import { ScoreBadge } from './ScoreBadge'
import { CandidateTag } from './CandidateTag'
import { scoreBarColor } from '../utils/scoreColors'
import { fmtPrice, fmtMarketCap, fmtNum, fmtDividend, fmtPct } from '../utils/formatters'

interface Props {
  ticker: string
  onClose: () => void
}

export function StockDetailModal({ ticker, onClose }: Props) {
  const [stock, setStock] = useState<StockDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getStockDetail(ticker)
      .then(setStock)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [ticker])

  const yahooUrl = `https://finance.yahoo.co.jp/quote/${ticker}`

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-800">{stock?.name ?? ticker}</h2>
              {stock?.candidate_tag && <CandidateTag tag={stock.candidate_tag} />}
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{ticker} · {stock?.sector ?? ''}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none ml-4"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">読み込み中...</div>
        ) : stock ? (
          <div className="p-6 space-y-6">
            {/* Key metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard label="株価" value={fmtPrice(stock.price)} />
              <MetricCard label="時価総額" value={fmtMarketCap(stock.market_cap)} />
              <MetricCard label="PER" value={fmtNum(stock.per, 1)} />
              <MetricCard label="PBR" value={fmtNum(stock.pbr, 2)} />
              <MetricCard label="配当利回り" value={fmtDividend(stock.dividend_yield)} />
              <MetricCard label="売上成長率" value={fmtPct(stock.revenue_growth)} />
              <MetricCard label="利益成長率" value={fmtPct(stock.profit_growth)} />
              <MetricCard label="ROE" value={fmtPct(stock.roe != null ? stock.roe * 100 : undefined)} />
            </div>

            {/* Score breakdown */}
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-3">スコア内訳</h3>
              <div className="space-y-3">
                <ScoreBar label="PER スコア" score={stock.per_score} />
                <ScoreBar label="PBR スコア" score={stock.pbr_score} />
                <ScoreBar label="成長率 スコア" score={stock.growth_score} />
                <ScoreBar label="配当・健全性 スコア" score={stock.dividend_health_score} />
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">総合スコア</span>
                    <ScoreBadge score={stock.composite_score} />
                  </div>
                </div>
              </div>
            </div>

            {/* Financial health */}
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-3">財務状況</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <MetricCard label="負債資本倍率" value={fmtNum(stock.debt_to_equity, 1)} />
                <MetricCard label="流動比率" value={fmtNum(stock.current_ratio, 2)} />
                <MetricCard label="EPS" value={fmtNum(stock.eps, 0)} />
              </div>
            </div>

            <div className="flex justify-end">
              <a
                href={yahooUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                Yahoo!ファイナンスで詳細を見る →
              </a>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-red-400">データを取得できませんでした</div>
        )}
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-medium text-slate-700">{score.toFixed(0)}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full">
        <div
          className={`h-full rounded-full transition-all ${scoreBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
