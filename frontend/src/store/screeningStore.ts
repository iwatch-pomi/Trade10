import { create } from 'zustand'
import type { ScreenJob, StockResult, FilterState } from '../types/stock'

interface ScreeningStore {
  jobId: string | null
  job: ScreenJob | null
  stocks: StockResult[]
  totalStocks: number
  filters: FilterState
  selectedTicker: string | null
  setJobId: (id: string) => void
  setJob: (job: ScreenJob) => void
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
  sortBy: 'composite_score',
  sortDir: 'desc',
}

export const useScreeningStore = create<ScreeningStore>((set) => ({
  jobId: null,
  job: null,
  stocks: [],
  totalStocks: 0,
  filters: defaultFilters,
  selectedTicker: null,

  setJobId: (id) => set({ jobId: id }),
  setJob: (job) => set({ job }),
  setStocks: (stocks, total) => set({ stocks, totalStocks: total }),
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setSelectedTicker: (ticker) => set({ selectedTicker: ticker }),
}))
