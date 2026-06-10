'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import type { Service } from '@/types'

interface ServiceQueryResponse {
  data: Service[]
}

interface CreateServiceInput {
  nama: string
  deskripsi?: string
  harga: number
  kategori?: string
  isActive?: boolean
}

export interface UseServiceResult {
  query: UseQueryResult<ServiceQueryResponse, Error>
  create: UseMutationResult<Service, Error, CreateServiceInput>
}

const SERVICES_KEY = ['service']

export const useService = (): UseServiceResult => {
  const qc = useQueryClient()

  const query = useQuery<ServiceQueryResponse, Error>({
    queryKey: SERVICES_KEY,
    queryFn: async () => {
      const res = await fetch('/api/service')
      if (!res.ok) throw new Error('Gagal mengambil layanan')
      return res.json()
    },
  })

  const create = useMutation<Service, Error, CreateServiceInput>({
    mutationFn: async (data: CreateServiceInput) => {
      const res = await fetch('/api/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Gagal menambah layanan')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SERVICES_KEY }),
  })

  return { query, create }
}

export default useService
