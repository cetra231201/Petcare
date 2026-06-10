import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export default function useSSE(
  userId?: string,
  onMessage?: (payload: any) => void,
  invalidateQueryKey?: readonly unknown[],
) {
  const qc = useQueryClient()

  useEffect(() => {
    if (!userId) return
    const es = new EventSource(`/api/konsultasi/sse?userId=${userId}`)
    es.addEventListener('message', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data)
        if (invalidateQueryKey) {
          qc.invalidateQueries({ queryKey: invalidateQueryKey })
        } else {
          qc.invalidateQueries({ queryKey: ['konsultasi', { userId }] })
        }
        onMessage?.(payload)
      } catch (err) {
        // ignore
      }
    })
    return () => es.close()
  }, [userId, qc, onMessage, invalidateQueryKey])
}
