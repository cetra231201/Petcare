"use client"
import React, { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import useRekamMedis, { useDownloadRekamMedisPdf } from '@/hooks/useRekamMedis'
import useSSE from '@/hooks/useSSE'
import { toast } from '@/components/shared/Toast'

export default function RekamMedisClient({ hewanId }: { hewanId: string }) {
  const query = useRekamMedis(hewanId)
  const downloadPdf = useDownloadRekamMedisPdf()
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id
  const role = (session?.user as any)?.role
  const invalidateKey = useMemo(() => ['rekam-medis', hewanId], [hewanId])
  useSSE(userId, undefined, invalidateKey)

  return (
    <div>
      <h3 className="text-lg font-medium">Rekam Medis</h3>
      <p className="mt-2 text-sm text-slate-500">Lihat riwayat treatment dan progress dari dokter. Data hanya dapat diakses oleh pemilik hewan.</p>

      <div className="mt-6">
        <h4 className="font-medium">Daftar Rekam Medis</h4>
        <div className="mt-2 space-y-4">
          {query.isLoading && <div>Memuat rekam medis...</div>}
          {(query.data as { data: any[] } | undefined)?.data?.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">Belum ada rekam medis untuk hewan ini.</div>}
          {(query.data as { data: any[] } | undefined)?.data?.map((r: any) => (
            <div key={r.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-900">{new Date(r.tanggalPeriksa).toLocaleDateString()}</div>
                  <div className="text-sm text-slate-500">Keluhan: {r.keluhan || '-'}</div>
                </div>
                <button onClick={() => downloadPdf(r.id)} className="rounded-2xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Unduh PDF</button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Diagnosis</div>
                  <div className="mt-1 text-slate-900">{r.diagnosis || '-'}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Tindakan</div>
                  <div className="mt-1 text-slate-900">{r.tindakan || '-'}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Obat</div>
                  <div className="mt-1 text-slate-900">{r.obat || '-'}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Dosis</div>
                  <div className="mt-1 text-slate-900">{r.dosis || '-'}</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Perawatan</div>
                  <div className="mt-1 text-slate-900">{r.perawatan || '-'}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Catatan Treatment</div>
                  <div className="mt-1 text-slate-900">{r.catatanPerawatan || '-'}</div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Catatan Dokter</div>
                <div className="mt-1 text-slate-900">{r.catatanDokter || '-'}</div>
              </div>

              {r.progress?.length ? (
                <div className="mt-4 space-y-3">
                  <div className="text-sm font-semibold text-slate-900">Riwayat Progress</div>
                  {r.progress.map((item: any) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                        <span>{new Date(item.tanggal).toLocaleDateString()}</span>
                        <span className="text-slate-500">{item.progress}</span>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">Kondisi: {item.kondisi}</div>
                      {item.catatan ? <div className="mt-1 text-sm text-slate-600">Catatan: {item.catatan}</div> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">Belum ada progress harian pada treatment ini.</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
