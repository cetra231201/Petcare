import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TreatmentProgress } from '@/types'

export function useRekamMedisProgress(rekamMedisId?: string) {
  const qc = useQueryClient()
  const key = ['rekam-medis-progress', rekamMedisId]

  const query = useQuery<{ data: TreatmentProgress[] }, Error>({
    queryKey: key,
    queryFn: async () => {
      if (!rekamMedisId) return { data: [] }
      const res = await fetch(`/api/rekam-medis/${rekamMedisId}/progress`)
      if (!res.ok) throw new Error('Gagal fetch progress')
      return res.json()
    },
    enabled: !!rekamMedisId,
  })

  const create = useMutation<TreatmentProgress, Error, { rekamMedisId: string; data: { kondisi: string; progress: string; catatan?: string } }>({
    mutationFn: async ({ rekamMedisId, data }) => {
      const res = await fetch(`/api/rekam-medis/${rekamMedisId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Gagal membuat progress')
      return res.json()
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: key })
      qc.invalidateQueries({ queryKey: ['rekam-medis', variables.rekamMedisId] })
    },
  })

  return { query, create }
}

export default useRekamMedisProgress
