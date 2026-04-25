import { useCallback, useRef } from 'react'
import { getTickers, analyzeBatch, getStocks } from '../api/client'
import { useScreeningStore } from '../store/screeningStore'

const BATCH_SIZE = 8

function chunks<T>(arr: T[], n: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += n) result.push(arr.slice(i, i + n))
  return result
}

export function useScreening() {
  const { setProgress, addStocks, setStocks, filters } = useScreeningStore()
  const abortRef = useRef(false)

  const fetchStocks = useCallback(async () => {
    try {
      const result = await getStocks(filters)
      setStocks(result.items, result.total)
    } catch (e) {
      console.error('Failed to fetch stocks', e)
    }
  }, [filters, setStocks])

  const start = useCallback(
    async (opts: { force_refresh?: boolean; max_stocks?: number | null }) => {
      abortRef.current = false
      setProgress({ status: 'running', processed: 0, pct: 0 })

      try {
        const allTickers = await getTickers()
        const tickers = opts.max_stocks
          ? allTickers.slice(0, opts.max_stocks)
          : allTickers

        const batches = chunks(tickers.map((t) => t.ticker), BATCH_SIZE)
        const total = tickers.length

        setProgress({ total })

        for (let i = 0; i < batches.length; i++) {
          if (abortRef.current) break
          const batch = batches[i]
          setProgress({ currentTicker: batch[0] })

          try {
            const results = await analyzeBatch(batch, opts.force_refresh ?? false)
            addStocks(results)
          } catch (e) {
            console.warn('Batch failed', batch[0], e)
          }

          const processed = Math.min((i + 1) * BATCH_SIZE, total)
          setProgress({
            processed,
            pct: Math.round((processed / total) * 100),
          })
        }

        setProgress({ status: 'completed', pct: 100, currentTicker: undefined })
      } catch (e) {
        setProgress({ status: 'failed' })
        console.error('Screening failed', e)
      }
    },
    [setProgress, addStocks],
  )

  const stop = useCallback(() => {
    abortRef.current = true
    setProgress({ status: 'idle' })
  }, [setProgress])

  return { start, stop, fetchStocks }
}
