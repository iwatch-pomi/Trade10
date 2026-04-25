import axios from 'axios'
import type { StockListResponse, StockDetail, StockResult, TickerInfo, FilterState } from '../types/stock'

const api = axios.create({ baseURL: '/api' })

export async function getTickers(): Promise<TickerInfo[]> {
  const { data } = await api.get<TickerInfo[]>('/tickers')
  return data
}

export async function analyzeBatch(
  tickers: string[],
  force_refresh = false,
): Promise<StockResult[]> {
  const { data } = await api.post<StockResult[]>('/analyze', { tickers, force_refresh })
  return data
}

export async function getStocks(filters: FilterState): Promise<StockListResponse> {
  const params: Record<string, unknown> = {
    min_score: filters.minScore,
    sort_by: filters.sortBy,
    sort_dir: filters.sortDir,
    limit: 200,
    offset: 0,
  }
  if (filters.maxPer !== null) params.max_per = filters.maxPer
  if (filters.maxPbr !== null) params.max_pbr = filters.maxPbr
  if (filters.minDividend !== null) params.min_dividend = filters.minDividend
  if (filters.candidateTag) params.candidate_tag = filters.candidateTag
  if (filters.markets.length > 0) params.market = filters.markets.join(',')

  const { data } = await api.get<StockListResponse>('/stocks', { params })
  return data
}

export async function getStockDetail(ticker: string): Promise<StockDetail> {
  const { data } = await api.get<StockDetail>(`/stocks/${encodeURIComponent(ticker)}`)
  return data
}

export async function getHealth() {
  const { data } = await api.get('/health')
  return data
}

export async function clearCache() {
  await api.delete('/cache')
}
