export interface StockResult {
  ticker: string
  name?: string
  sector?: string
  price?: number
  market_cap?: number
  per?: number
  per_score: number
  pbr?: number
  pbr_score: number
  revenue_growth?: number
  profit_growth?: number
  growth_score: number
  dividend_yield?: number
  debt_to_equity?: number
  current_ratio?: number
  roe?: number
  dividend_health_score: number
  composite_score: number
  candidate_tag?: string
  data_quality: string
  cached_at?: string
}

export interface StockDetail extends StockResult {
  eps?: number
  score_breakdown?: Record<string, number>
}

export interface StockListResponse {
  items: StockResult[]
  total: number
}

export interface TickerInfo {
  ticker: string
  name: string
  sector: string
}

export type JobStatus = 'idle' | 'running' | 'completed' | 'failed'

export interface ScreeningProgress {
  status: JobStatus
  total: number
  processed: number
  pct: number
  currentTicker?: string
}

export interface FilterState {
  minScore: number
  maxPer: number | null
  maxPbr: number | null
  minDividend: number | null
  candidateTag: string | null
  sortBy: string
  sortDir: 'asc' | 'desc'
}
