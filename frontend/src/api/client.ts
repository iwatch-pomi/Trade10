import axios from 'axios'
import type { ScreenJob, StockListResponse, StockDetail, FilterState } from '../types/stock'

const api = axios.create({ baseURL: '/api' })

export async function startScreening(opts: {
  force_refresh?: boolean
  batch_size?: number
  max_stocks?: number | null
}): Promise<ScreenJob> {
  const { data } = await api.post<ScreenJob>('/screen/start', opts)
  return data
}

export async function getJobStatus(jobId: string): Promise<ScreenJob> {
  const { data } = await api.get<ScreenJob>(`/screen/status/${jobId}`)
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
