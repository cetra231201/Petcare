import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const INVOICE_KEY = ['invoice']

export const useInvoice = (status?: string) => {
  const qc = useQueryClient()
  const queryKey = status ? [...INVOICE_KEY, status] : INVOICE_KEY

  const query = useQuery<{ data: any[] }, Error>({
    queryKey,
    queryFn: async () => {
      const url = new URL('/api/invoice', window.location.href)
      if (status) url.searchParams.set('status', status)
      const res = await fetch(url.toString())
      if (!res.ok) throw new Error('Gagal mengambil invoice')
      return res.json()
    },
  })

  const create = useMutation<any, Error, any>({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Gagal membuat invoice')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: INVOICE_KEY }),
  })

  const update = useMutation<any, Error, { id: string; data: any }>({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/invoice/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Gagal memperbarui invoice')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: INVOICE_KEY }),
  })

  const approve = useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/invoice/${id}/approve`, { method: 'PUT' })
      if (!res.ok) throw new Error('Gagal approve invoice')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: INVOICE_KEY }),
  })

  const printInvoice = useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/invoice/${id}/print`, { method: 'PUT' })
      if (!res.ok) throw new Error('Gagal print invoice')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: INVOICE_KEY }),
  })

  const voidInvoice = useMutation<any, Error, { id: string; voidReason: string }>({
    mutationFn: async ({ id, voidReason }) => {
      const res = await fetch(`/api/invoice/${id}/void`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voidReason }),
      })
      if (!res.ok) throw new Error('Gagal void invoice')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: INVOICE_KEY }),
  })

  return { query, create, update, approve, printInvoice, voidInvoice }
}

export default useInvoice
