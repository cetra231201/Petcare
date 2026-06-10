"use client"

import { useState } from 'react'
import { useUpdateRekamMedis } from '@/hooks/useRekamMedis'
import { toast } from '@/components/shared/Toast'

export default function RekamMedisTreatmentEditor({ record }: { record: any }) {
  const update = useUpdateRekamMedis()
  const [form, setForm] = useState({
    obat: record.obat || '',
    perawatan: record.perawatan || '',
    dosis: record.dosis || '',
    catatanPerawatan: record.catatanPerawatan || '',
    catatanDokter: record.catatanDokter || '',
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await update.mutateAsync({ id: record.id, data: form })
      toast('Detail treatment berhasil disimpan')
    } catch (err: any) {
      toast(err.message || 'Gagal menyimpan treatment')
    }
  }

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Treatment: {record.hewan?.nama || 'Pasien'}</h3>
      <p className="text-sm text-slate-500">Atur obat, perawatan, dosis, dan catatan agar pasien dapat dipantau dengan jelas.</p>
      <form onSubmit={handleSave} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Obat</label>
          <input value={form.obat} onChange={(e) => setForm({ ...form, obat: e.target.value })} className="mt-1 w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Perawatan</label>
          <input value={form.perawatan} onChange={(e) => setForm({ ...form, perawatan: e.target.value })} className="mt-1 w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Dosis</label>
          <input value={form.dosis} onChange={(e) => setForm({ ...form, dosis: e.target.value })} className="mt-1 w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Catatan Treatment</label>
          <textarea value={form.catatanPerawatan} onChange={(e) => setForm({ ...form, catatanPerawatan: e.target.value })} className="mt-1 w-full rounded border p-2" rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Catatan Dokter</label>
          <textarea value={form.catatanDokter} onChange={(e) => setForm({ ...form, catatanDokter: e.target.value })} className="mt-1 w-full rounded border p-2" rows={3} />
        </div>
        <button type="submit" className="rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">
          Simpan Treatment
        </button>
      </form>
    </div>
  )
}
