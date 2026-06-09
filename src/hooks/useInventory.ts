import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const useInventory = ({ all = false } = {}) => {
  const qc = useQueryClient()
  const key = ['inventory', all ? 'all' : 'page']

  const query = useQuery<{ data: any[]; meta?: any }, Error>({
    queryKey: key,
    queryFn: async () => {
      const url = all ? '/api/inventory?all=true' : '/api/inventory'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Gagal fetch inventory')
      return res.json()
    },
  })

  const create = useMutation<any, Error, any>({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) throw new Error('Gagal menambah item')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const update = useMutation<any, Error, { id: string; data: any }>({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/inventory/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) throw new Error('Gagal update')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const remove = useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal hapus')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const adjust = useMutation<any, Error, { id: string; adjustment: number; note?: string }>({
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
