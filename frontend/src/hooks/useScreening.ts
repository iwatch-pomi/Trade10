import { useCallback, useEffect, useRef } from 'react'
import { startScreening, getJobStatus, getStocks } from '../api/client'
import { useScreeningStore } from '../store/screeningStore'

export function useScreening() {
  const { setJobId, setJob, filters, setStocks } = useScreeningStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

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
      stopPolling()
      const job = await startScreening({ ...opts, batch_size: 20 })
      setJobId(job.job_id)
      setJob(job)

      intervalRef.current = setInterval(async () => {
        try {
          const updated = await getJobStatus(job.job_id)
          setJob(updated)
          if (updated.status === 'completed' || updated.status === 'failed') {
            stopPolling()
            if (updated.status === 'completed') {
              await fetchStocks()
            }
          }
        } catch (e) {
          console.error('Polling error', e)
          stopPolling()
        }
      }, 1500)
    },
    [setJobId, setJob, stopPolling, fetchStocks],
  )

  useEffect(() => {
    return stopPolling
  }, [stopPolling])

  return { start, fetchStocks }
}
