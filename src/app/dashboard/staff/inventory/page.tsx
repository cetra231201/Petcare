"use client"
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useInventory from '@/hooks/useInventory'
import useInventoryMovements from '@/hooks/useInventoryMovements'
import { toast } from '@/components/shared/Toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { inventorySchema, inventoryAdjustmentSchema, type InventoryInput, type InventoryAdjustmentInput } from '@/lib/schemas'

export default function StaffInventoryPage() {
  const { query, create, update, remove, adjust } = useInventory()
  const movementsQuery = useInventoryMovements()
  const items = (query.data as { data: any[] } | undefined)?.data || []
  const movements = (movementsQuery.query.data as { data: any[] } | undefined)?.data || []

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: { namaItem: '', kategori: 'OBAT', stok: 0, satuan: '', harga: 0, stokMinimal: 0 },
  })

  const { register: registerAdjust, handleSubmit: handleAdjustSubmit, reset: resetAdjust, formState: { errors: adjustErrors } } = useForm<InventoryAdjustmentInput>({
    resolver: zodResolver(inventoryAdjustmentSchema),
    defaultValues: { inventoryId: '', adjustment: 0, note: '' },
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

  const handleAdjust = async (values: InventoryAdjustmentInput) => {
    try {
      await adjust.mutateAsync({ id: values.inventoryId, adjustment: values.adjustment, note: values.note })
      resetAdjust()
      toast('Penyesuaian stok tersimpan')
    } catch (err: any) {
      toast(err.message || 'Gagal menyesuaikan stok')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-teal-700">Inventory Petshop</h2>
        <p className="mt-1 text-sm text-slate-500">Kelola stok dan pencatatan manual untuk produk petshop.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Tambah Item Baru</h3>
            <form onSubmit={handleSubmit(handleCreate)} className="mt-4 space-y-4">
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
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <input type="number" placeholder="Stok" {...register('stok')} className="w-full rounded-xl border border-slate-200 p-2.5" />
                  {errors.stok && <p className="mt-1 text-xs text-red-600">{errors.stok.message}</p>}
                </div>
                <div>
                  <input placeholder="Satuan" {...register('satuan')} className="w-full rounded-xl border border-slate-200 p-2.5" />
                  {errors.satuan && <p className="mt-1 text-xs text-red-600">{errors.satuan.message}</p>}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <input type="number" placeholder="Harga" {...register('harga')} className="w-full rounded-xl border border-slate-200 p-2.5" />
                  {errors.harga && <p className="mt-1 text-xs text-red-600">{errors.harga.message}</p>}
                </div>
                <div>
                  <input type="number" placeholder="Stok Minimal" {...register('stokMinimal')} className="w-full rounded-xl border border-slate-200 p-2.5" />
                  {errors.stokMinimal && <p className="mt-1 text-xs text-red-600">{errors.stokMinimal.message}</p>}
                </div>
              </div>
              <button className="rounded-xl bg-teal-600 px-4 py-2 text-white transition hover:bg-teal-700">Tambah Item</button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Manual Stock Adjustment</h3>
            <p className="mt-1 text-sm text-slate-500">Gunakan untuk pengecekan akhir hari atau perbaikan stok secara manual.</p>
            <form onSubmit={handleAdjustSubmit(handleAdjust)} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Pilih Item</label>
                <select {...registerAdjust('inventoryId')} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5">
                  <option value="">Pilih inventory</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>{item.namaItem} (Stok: {item.stok})</option>
                  ))}
                </select>
                {adjustErrors.inventoryId && <p className="mt-1 text-xs text-red-600">{adjustErrors.inventoryId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Penyesuaian</label>
                <input type="number" step="1" {...registerAdjust('adjustment')} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5" />
                {adjustErrors.adjustment && <p className="mt-1 text-xs text-red-600">{adjustErrors.adjustment.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Catatan (opsional)</label>
                <textarea {...registerAdjust('note')} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5" rows={3} />
              </div>
              <button className="rounded-xl bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700">Simpan Penyesuaian</button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Daftar Item</h3>
            <div className="mt-4 space-y-3">
              {query.isLoading && <div>Loading...</div>}
              {items.map((it: any) => (
                <div key={it.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold">{it.namaItem}</div>
                      <div className="text-sm text-slate-500">{it.kategori} • Stok: {it.stok} {it.satuan}</div>
                      <div className="text-sm text-slate-500">Harga: Rp {it.harga.toLocaleString('id-ID')}</div>
                      {it.lastManualCheckAt && <div className="text-xs text-slate-400">Terakhir dicek: {new Date(it.lastManualCheckAt).toLocaleString('id-ID')}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => {
                        const newStok = Number(prompt('Jumlah stok baru', String(it.stok)) || it.stok)
                        update.mutateAsync({ id: it.id, data: { stok: newStok } }).then(() => toast('Diperbarui')).catch((e) => toast(e.message || 'Gagal'))
                      }} className="rounded-xl bg-yellow-600 px-3 py-2 text-white">Edit</button>
                      <button onClick={() => setDeleteTarget(it)} className="rounded-xl bg-red-600 px-3 py-2 text-white">Hapus</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Riwayat Pergerakan Stok</h3>
            <p className="mt-1 text-sm text-slate-500">Riwayat perubahan stok terakhir ditampilkan di sini.</p>
            <div className="mt-4 space-y-3">
              {movementsQuery.query.isLoading && <div>Loading...</div>}
              {!movementsQuery.query.isLoading && movements.length === 0 && <div className="text-sm text-slate-500">Belum ada riwayat stok.</div>}
              {movements.map((movement: any) => (
                <div key={movement.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                  <div className="flex flex-col gap-1 text-sm text-slate-700">
                    <div className="font-semibold">{movement.inventory?.namaItem || 'Item tidak ditemukan'}</div>
                    <div>Tipe: {movement.type.replace('_', ' ')}</div>
                    <div>Perubahan: {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}</div>
                    <div>Stok: {movement.beforeStock} → {movement.afterStock}</div>
                    <div>Oleh: {movement.user?.name || 'Sistem'}</div>
                    {movement.note && <div>Catatan: {movement.note}</div>}
                    <div className="text-xs text-slate-500">{new Date(movement.createdAt).toLocaleString('id-ID')}</div>
                  </div>
                </div>
              ))}
            </div>
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
