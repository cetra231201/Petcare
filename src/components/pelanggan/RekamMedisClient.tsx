"use client"
import React, { useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import useRekamMedis from '@/hooks/useRekamMedis'
import useSSE from '@/hooks/useSSE'
import { toast } from '@/components/shared/Toast'
import { useDoctors } from '@/hooks/useDoctors'

export default function RekamMedisClient({ hewanId }: { hewanId: string }) {
  const { query, create, downloadPdf } = useRekamMedis(hewanId)
  const { data: doctorsData } = useDoctors()
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id
  const role = (session?.user as any)?.role
  const invalidateKey = useMemo(() => ['rekam-medis', hewanId], [hewanId])
  useSSE(userId, undefined, invalidateKey)
  const doctors = doctorsData || []
  const [form, setForm] = useState({ tanggalPeriksa: '', dokterId: '', keluhan: '', diagnosis: '', tindakan: '', resep: '', obat: '', perawatan: '', dosis: '', catatanPerawatan: '', catatanDokter: '' })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await create.mutateAsync({ ...form, hewanId, tanggalPeriksa: form.tanggalPeriksa })
      toast('Rekam medis berhasil disimpan')
      setForm({ tanggalPeriksa: '', dokterId: '', keluhan: '', diagnosis: '', tindakan: '', resep: '', obat: '', perawatan: '', dosis: '', catatanPerawatan: '', catatanDokter: '' })
    } catch (err: any) {
      toast(err.message || 'Gagal menyimpan rekam medis')
    }
  }

  return (
    <div>
      <h3 className="text-lg font-medium">Rekam Medis</h3>
      {role === 'CLIENT' ? (
        <p className="mt-2 text-sm text-slate-500">Lihat riwayat treatment dan progress dari dokter. Hanya dokter/admin dapat menambahkan catatan.</p>
      ) : null}
      {role === 'DOKTER' || role === 'ADMIN' ? (
        <div className="mt-4">
          <form onSubmit={handleCreate} className="space-y-2">
            <div>
              <label className="block text-sm">Tanggal Periksa</label>
              <input type="date" value={form.tanggalPeriksa} onChange={(e) => setForm({ ...form, tanggalPeriksa: e.target.value })} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="block text-sm">Dokter</label>
              <select value={form.dokterId} onChange={(e) => setForm({ ...form, dokterId: e.target.value })} className="border p-2 rounded w-full">
                <option value="">Pilih dokter</option>
                {doctors.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm">Keluhan</label>
              <input value={form.keluhan} onChange={(e) => setForm({ ...form, keluhan: e.target.value })} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="block text-sm">Diagnosa</label>
              <input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="block text-sm">Tindakan</label>
              <input value={form.tindakan} onChange={(e) => setForm({ ...form, tindakan: e.target.value })} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="block text-sm">Resep</label>
              <input value={form.resep} onChange={(e) => setForm({ ...form, resep: e.target.value })} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="block text-sm">Obat</label>
              <input value={form.obat} onChange={(e) => setForm({ ...form, obat: e.target.value })} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="block text-sm">Perawatan</label>
              <input value={form.perawatan} onChange={(e) => setForm({ ...form, perawatan: e.target.value })} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="block text-sm">Dosis</label>
              <input value={form.dosis} onChange={(e) => setForm({ ...form, dosis: e.target.value })} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="block text-sm">Catatan Treatment</label>
              <textarea value={form.catatanPerawatan} onChange={(e) => setForm({ ...form, catatanPerawatan: e.target.value })} className="border p-2 rounded w-full" rows={3} />
            </div>
            <div>
              <label className="block text-sm">Catatan Dokter</label>
              <input value={form.catatanDokter || ''} onChange={(e) => setForm({ ...form, catatanDokter: e.target.value })} className="border p-2 rounded w-full" />
            </div>
            <div>
              <button type="submit" className="px-3 py-2 bg-teal-600 text-white rounded">Simpan</button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="mt-6">
        <h4 className="font-medium">Daftar Rekam Medis</h4>
        <div className="mt-2 space-y-2">
          {query.isLoading && <div>Loading...</div>}
          {(query.data as { data: any[] } | undefined)?.data?.length === 0 && <div>Belum ada rekam medis.</div>}
          {(query.data as { data: any[] } | undefined)?.data?.map((r: any) => (
            <div key={r.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{new Date(r.tanggalPeriksa).toLocaleDateString()}</div>
                  <div className="text-sm text-slate-600">Keluhan: {r.keluhan || '-'}</div>
                </div>
                <button onClick={() => downloadPdf(r.id)} className="rounded bg-blue-600 px-3 py-1 text-white">PDF</button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-white p-3 border border-slate-200">
                  <div className="text-sm text-slate-500">Diagnosis</div>
                  <div className="mt-1 text-slate-900">{r.diagnosis || '-'}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border border-slate-200">
                  <div className="text-sm text-slate-500">Tindakan</div>
                  <div className="mt-1 text-slate-900">{r.tindakan || '-'}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border border-slate-200">
                  <div className="text-sm text-slate-500">Obat</div>
                  <div className="mt-1 text-slate-900">{r.obat || '-'}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border border-slate-200">
                  <div className="text-sm text-slate-500">Dosis</div>
                  <div className="mt-1 text-slate-900">{r.dosis || '-'}</div>
                </div>
              </div>
              <div className="mt-3 rounded-xl bg-white p-3 border border-slate-200">
                <div className="text-sm text-slate-500">Perawatan</div>
                <div className="mt-1 text-slate-900">{r.perawatan || '-'}</div>
                <div className="mt-2 text-sm text-slate-500">Catatan Treatment</div>
                <div className="mt-1 text-slate-900">{r.catatanPerawatan || '-'}</div>
              </div>
              <div className="mt-3 rounded-xl bg-white p-3 border border-slate-200">
                <div className="text-sm text-slate-500">Catatan Dokter</div>
                <div className="mt-1 text-slate-900">{r.catatanDokter || '-'}</div>
              </div>
              {r.progress?.length ? (
                <div className="mt-3 space-y-2">
                  <div className="text-sm font-medium text-slate-900">Riwayat Progress</div>
                  {r.progress.map((item: any) => (
                    <div key={item.id} className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                        <span>{new Date(item.tanggal).toLocaleDateString()}</span>
                        <span className="text-slate-500">{item.progress}</span>
                      </div>
                      <div className="mt-1 text-sm text-slate-600">Kondisi: {item.kondisi}</div>
                      {item.catatan ? <div className="mt-1 text-sm text-slate-600">Catatan: {item.catatan}</div> : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
