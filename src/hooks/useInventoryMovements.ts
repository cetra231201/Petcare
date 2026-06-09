import { useQuery } from '@tanstack/react-query'

export const useInventoryMovements = (inventoryId?: string) => {
  const key = ['inventory', 'movements', inventoryId || 'all']

  const query = useQuery<{ data: any[] }, Error>({
    queryKey: key,
    queryFn: async () => {
      const url = inventoryId ? `/api/inventory/movements?inventoryId=${inventoryId}` : '/api/inventory/movements'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Gagal memuat riwayat stok')
      return res.json()
    },
  })

  return { query }
}

export default useInventoryMovements
