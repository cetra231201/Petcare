"use client"

import { useState } from 'react'
import useRekamMedisProgress from '@/hooks/useRekamMedisProgress'
import { toast } from '@/components/shared/Toast'

export default function TreatmentProgressManager({ rekamMedis, allowUpdate = false }: { rekamMedis: any; allowUpdate?: boolean }) {
  const { query, create } = useRekamMedisProgress(rekamMedis?.id)
  const [form, setForm] = useState({ kondisi: '', progress: '', catatan: '' })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await create.mutateAsync({ rekamMedisId: rekamMedis.id, data: form })
      toast('Progress harian berhasil ditambahkan')
      setForm({ kondisi: '', progress: '', catatan: '' })
    } catch (err: any) {
      toast(err.message || 'Gagal menambahkan progress')
    }
  }

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">Progress Harian</h4>
          <p className="text-sm text-slate-500">Catatan perkembangan kondisi harian untuk treatment.</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-sm text-slate-500">Obat</div>
            <div className="mt-1 text-slate-900">{rekamMedis.obat || '-'}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-sm text-slate-500">Perawatan</div>
            <div className="mt-1 text-slate-900">{rekamMedis.perawatan || '-'}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-sm text-slate-500">Dosis</div>
            <div className="mt-1 text-slate-900">{rekamMedis.dosis || '-'}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-sm text-slate-500">Catatan Treatment</div>
            <div className="mt-1 text-slate-900">{rekamMedis.catatanPerawatan || '-'}</div>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-medium text-slate-900">Riwayat Progress</h5>
          <div className="mt-3 space-y-2">
            {query.isLoading && <div>Memuat progress...</div>}
            {!query.isLoading && query.data?.data?.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-500">Belum ada progress harian.</div>}
            {query.data?.data?.map((item: any) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                  <span>{new Date(item.tanggal).toLocaleDateString()}</span>
                  <span className="text-slate-500">{item.progress}</span>
                </div>
                <div className="mt-1 text-sm text-slate-600">Kondisi: {item.kondisi}</div>
                {item.catatan ? <div className="mt-1 text-sm text-slate-600">Catatan: {item.catatan}</div> : null}
              </div>
            ))}
          </div>
        </div>

        {allowUpdate ? (
          <form onSubmit={handleCreate} className="space-y-3 border-t border-slate-200 pt-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Kondisi</label>
              <input value={form.kondisi} onChange={(e) => setForm({ ...form, kondisi: e.target.value })} className="mt-1 w-full rounded border p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Progress</label>
              <input value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} className="mt-1 w-full rounded border p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Catatan</label>
              <textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} className="mt-1 w-full rounded border p-2" rows={3} />
            </div>
            <button type="submit" disabled={create.isLoading} className="rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">
              Tambah Progress
            </button>
          </form>
        ) : null}
      </div>
    </div>
  )
}
