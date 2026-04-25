import { useScreeningStore } from '../store/screeningStore'
import { ScoreBadge } from './ScoreBadge'
import { CandidateTag } from './CandidateTag'
import { fmtPrice, fmtMarketCap, fmtNum, fmtDividend, fmtPct } from '../utils/formatters'
import type { StockResult } from '../types/stock'

interface Props {
  onSelectStock: (ticker: string) => void
}

export function StockTable({ onSelectStock }: Props) {
  const { stocks, totalStocks } = useScreeningStore()

  if (stocks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
        <p className="text-lg">まだデータがありません</p>
        <p className="text-sm mt-1">スクリーニングを開始してください</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">
          {totalStocks} 銘柄中 {stocks.length} 件表示
        </span>
        <span className="text-xs text-slate-400">クリックで詳細表示</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 font-medium text-slate-500 whitespace-nowrap">銘柄</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">セクター</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">スコア</th>
              <th className="text-center px-4 py-3 font-medium text-slate-500">候補</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">株価</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">PER</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">PBR</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">成長率</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">配当</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">時価総額</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock: StockResult) => (
              <tr
                key={stock.ticker}
                onClick={() => onSelectStock(stock.ticker)}
                className="border-b border-slate-50 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{stock.name ?? stock.ticker}</div>
                  <div className="text-xs text-slate-400">{stock.ticker}</div>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{stock.sector ?? '-'}</td>
                <td className="px-4 py-3 text-right">
                  <ScoreBadge score={stock.composite_score} size="sm" />
                </td>
                <td className="px-4 py-3 text-center">
                  <CandidateTag tag={stock.candidate_tag} />
                </td>
                <td className="px-4 py-3 text-right text-slate-700">{fmtPrice(stock.price)}</td>
                <td className="px-4 py-3 text-right text-slate-700">{fmtNum(stock.per, 1)}</td>
                <td className="px-4 py-3 text-right text-slate-700">{fmtNum(stock.pbr, 2)}</td>
                <td className="px-4 py-3 text-right">
                  <GrowthCell growth={stock.revenue_growth} />
                </td>
                <td className="px-4 py-3 text-right text-slate-700">{fmtDividend(stock.dividend_yield)}</td>
                <td className="px-4 py-3 text-right text-slate-500 text-xs">{fmtMarketCap(stock.market_cap)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function GrowthCell({ growth }: { growth?: number }) {
  if (growth == null) return <span className="text-slate-400">-</span>
  const color = growth >= 20 ? 'text-green-600' : growth >= 0 ? 'text-slate-700' : 'text-red-500'
  return <span className={`font-medium ${color}`}>{fmtPct(growth)}</span>
}
