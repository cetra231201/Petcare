'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import type { Inventory, ApiPaginatedResponse, InventoryCreateInput, InventoryUpdateInput } from '@/types'

interface InventoryQueryResponse {
  data: Inventory[]
  meta?: {
    page: number
    limit: number
    total: number
  }
}

interface AdjustInventoryParams {
  id: string
  adjustment: number
  note?: string
}

export interface UseInventoryResult {
  query: UseQueryResult<InventoryQueryResponse, Error>
  create: UseMutationResult<Inventory, Error, InventoryCreateInput>
  update: UseMutationResult<Inventory, Error, { id: string; data: InventoryUpdateInput }>
  remove: UseMutationResult<void, Error, string>
  adjust: UseMutationResult<Inventory, Error, AdjustInventoryParams>
}

export const useInventory = ({ all = false } = {}): UseInventoryResult => {
  const key = ['inventory', all ? 'all' : 'page']
  const query = useQuery<InventoryQueryResponse, Error>({
    queryKey: key,
    queryFn: async () => {
      const url = all ? '/api/inventory?all=true' : '/api/inventory'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Gagal fetch inventory')
      return res.json()
    },
  })

  const qc = useQueryClient()

  const create = useMutation<Inventory, Error, InventoryCreateInput>({
    mutationFn: async (data: InventoryCreateInput) => {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Gagal menambah item')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const update = useMutation<Inventory, Error, { id: string; data: InventoryUpdateInput }>({
    mutationFn: async ({ id, data }: { id: string; data: InventoryUpdateInput }) => {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Gagal update')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const remove = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal hapus')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const adjust = useMutation<Inventory, Error, AdjustInventoryParams>({
    mutationFn: async ({ id, adjustment, note }) => {
      const res = await fetch(`/api/inventory/${id}/adjust`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustment, note }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message || 'Gagal menyesuaikan stok')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key })
      qc.invalidateQueries({ queryKey: ['inventory', 'movements'] })
    },
  })

  return { query, create, update, remove, adjust }
}

export default useInventory
