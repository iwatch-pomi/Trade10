import { create } from 'zustand'
import type { StockResult, FilterState, ScreeningProgress } from '../types/stock'

interface ScreeningStore {
  progress: ScreeningProgress
  stocks: StockResult[]
  totalStocks: number
  filters: FilterState
  selectedTicker: string | null
  setProgress: (p: Partial<ScreeningProgress>) => void
  addStocks: (newStocks: StockResult[]) => void
  setStocks: (stocks: StockResult[], total: number) => void
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  resetFilters: () => void
  setSelectedTicker: (ticker: string | null) => void
}

const defaultFilters: FilterState = {
  minScore: 0,
  maxPer: null,
  maxPbr: null,
  minDividend: null,
  candidateTag: null,
  markets: [],
  sortBy: 'composite_score',
  sortDir: 'desc',
}

const defaultProgress: ScreeningProgress = {
  status: 'idle',
  total: 0,
  processed: 0,
  pct: 0,
}

export const useScreeningStore = create<ScreeningStore>((set) => ({
  progress: defaultProgress,
  stocks: [],
  totalStocks: 0,
  filters: defaultFilters,
  selectedTicker: null,

  setProgress: (p) =>
    set((s) => ({ progress: { ...s.progress, ...p } })),

  addStocks: (newStocks) =>
    set((s) => {
      const map = new Map(s.stocks.map((x) => [x.ticker, x]))
      for (const stock of newStocks) map.set(stock.ticker, stock)
      const merged = Array.from(map.values())
      return { stocks: merged, totalStocks: merged.length }
    }),

  setStocks: (stocks, total) => set({ stocks, totalStocks: total }),

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),

  resetFilters: () => set({ filters: defaultFilters }),

  setSelectedTicker: (ticker) => set({ selectedTicker: ticker }),
}))
