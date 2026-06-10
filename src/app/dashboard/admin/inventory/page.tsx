"use client"
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useInventory from '@/hooks/useInventory'
import { toast } from '@/components/shared/Toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { inventorySchema, type InventoryInput } from '@/lib/schemas'

export default function AdminInventoryPage() {
  const { query, create, update, remove } = useInventory()
  const items = (query.data as { data: any[] } | undefined)?.data || []
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InventoryInput>({
    resolver: zodResolver(inventorySchema),
    defaultValues: { namaItem: '', kategori: 'OBAT', stok: 0, satuan: '', harga: 0, stokMinimal: 0 },
  })

  const handleCreate = async (values: InventoryInput) => {
    try {
      await create.mutateAsync(values)
      reset()
      toast('Item ditambahkan')
    } catch (err: any) {
      toast(err.message || 'Gagal menambah item')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-teal-700">Inventory</h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium">Tambah Item</h3>
          <form onSubmit={handleSubmit(handleCreate)} className="space-y-2 mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <input placeholder="Nama Item" {...register('namaItem')} className="w-full rounded-xl border border-slate-200 p-2.5" />
              {errors.namaItem && <p className="mt-1 text-xs text-red-600">{errors.namaItem.message}</p>}
            </div>
            <div>
              <select {...register('kategori')} className="w-full rounded-xl border border-slate-200 p-2.5">
              <option value="OBAT">Obat</option>
              <option value="ALAT">Alat</option>
              <option value="KONSUMABLE">Konsumable</option>
            </select>
            </div>
            <div>
              <input type="number" placeholder="Stok" {...register('stok')} className="w-full rounded-xl border border-slate-200 p-2.5" />
              {errors.stok && <p className="mt-1 text-xs text-red-600">{errors.stok.message}</p>}
            </div>
            <div>
              <input placeholder="Satuan" {...register('satuan')} className="w-full rounded-xl border border-slate-200 p-2.5" />
              {errors.satuan && <p className="mt-1 text-xs text-red-600">{errors.satuan.message}</p>}
            </div>
            <div>
              <input type="number" placeholder="Harga" {...register('harga')} className="w-full rounded-xl border border-slate-200 p-2.5" />
              {errors.harga && <p className="mt-1 text-xs text-red-600">{errors.harga.message}</p>}
            </div>
            <div>
              <input type="number" placeholder="Stok Minimal" {...register('stokMinimal')} className="w-full rounded-xl border border-slate-200 p-2.5" />
              {errors.stokMinimal && <p className="mt-1 text-xs text-red-600">{errors.stokMinimal.message}</p>}
            </div>
            <button className="rounded-xl bg-teal-600 px-4 py-2 text-white transition hover:bg-teal-700">Tambah</button>
          </form>
        </div>

        <div>
          <h3 className="font-medium">Daftar Item</h3>
          <div className="mt-2 space-y-2">
            {query.isLoading && <div>Loading...</div>}
            {items.map((it: any) => (
              <div key={it.id} className="border p-3 rounded flex justify-between items-center">
                <div>
                  <div className="font-semibold">{it.namaItem} ({it.kategori})</div>
                  <div className="text-sm text-gray-600">Stok: {it.stok} • Satuan: {it.satuan}</div>
                </div>
                <div className="space-x-2">
                  <button onClick={() => {
                    const newStok = Number(prompt('Jumlah stok baru', String(it.stok)) || it.stok)
                    update.mutateAsync({ id: it.id, data: { stok: newStok } }).then(() => toast('Diperbarui')).catch((e) => toast(e.message || 'Gagal'))
                  }} className="px-2 py-1 bg-yellow-600 text-white rounded">Edit</button>
                  <button onClick={() => setDeleteTarget(it)} className="px-2 py-1 bg-red-600 text-white rounded">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus item inventory"
        message={`Hapus ${deleteTarget?.namaItem || 'item'} dari inventaris?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await remove.mutateAsync(deleteTarget.id)
            toast('Dihapus')
          } catch (e: any) {
            toast(e.message || 'Gagal')
          } finally {
            setDeleteTarget(null)
          }
        }}
      />
    </div>
  )
}
