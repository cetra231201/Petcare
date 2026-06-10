"use client"

import Link from 'next/link'
import { useState } from 'react'
import useSSE from '@/hooks/useSSE'
import { toast } from '@/components/shared/Toast'

type ProgressItem = {
  id: string
  tanggal: string
  kondisi: string
  progress: string
  catatan?: string | null
}

type RekamMedisItem = {
  id: string
  tanggalPeriksa: string
  diagnosis?: string | null
  tindakan?: string | null
  obat?: string | null
  perawatan?: string | null
  dosis?: string | null
  catatanPerawatan?: string | null
  catatanDokter?: string | null
  dokter?: { name?: string | null }
  progress?: ProgressItem[]
}

type MonitoringItem = {
  id: string
  tanggal: string
  nafsuMakan: string
  aktivitas: string
  catatanGejala?: string | null
}

type HewanWithRecords = {
  id: string
  nama: string
  jenis?: string | null
  Monitoring: MonitoringItem[]
  RekamMedis: RekamMedisItem[]
}

type Props = {
  initialHewan: HewanWithRecords[]
  userId: string
}

export default function MonitoringDashboard({ initialHewan, userId }: Props) {
  const [hewanList, setHewanList] = useState<HewanWithRecords[]>(initialHewan)

  useSSE(userId, (payload) => {
    if (!payload || typeof payload !== 'object') return

    const data = payload as { type?: string; rekamMedisId?: string; id?: string; item?: ProgressItem; updated?: any }
    if (data.type === 'rekam-medis-progress' && data.rekamMedisId && data.item) {
      setHewanList((previous) =>
        previous.map((hewan) => ({
          ...hewan,
          RekamMedis: hewan.RekamMedis.map((record) => {
            if (record.id !== data.rekamMedisId) return record
            return {
              ...record,
              progress: record.progress ? [data.item, ...record.progress] : [data.item],
            } as RekamMedisItem
          }),
        })),
      )
      toast('Progress harian baru diterima untuk salah satu treatment Anda.')
    }

    if (data.type === 'rekam-medis-updated' && data.id && data.updated) {
      setHewanList((previous) =>
        previous.map((hewan) => ({
          ...hewan,
          RekamMedis: hewan.RekamMedis.map((record) => (record.id === data.id ? { ...record, ...data.updated } : record)),
        })),
      )
      toast('Detail treatment dokter telah diperbarui.')
    }
  })

  if (hewanList.length === 0) {
    return <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 text-slate-500">Belum ada hewan terdaftar pada akun Anda.</div>
  }

  return (
    <div className="grid gap-6">
      {hewanList.map((hewan) => (
        <div key={hewan.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xl font-semibold text-slate-900">{hewan.nama}</div>
              <div className="text-sm text-slate-500">Jenis: {hewan.jenis || 'Tidak tersedia'}</div>
            </div>
            <Link href={`/dashboard/pelanggan/hewan/${hewan.id}/rekam-medis`} className="rounded-2xl border border-teal-600 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100">
              Lihat detail rekam medis
            </Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Monitoring Terbaru</div>
              {hewan.Monitoring.length === 0 ? (
                <div className="mt-3 text-sm text-slate-500">Belum ada catatan monitoring.</div>
              ) : (
                hewan.Monitoring.slice(0, 3).map((item) => (
                  <div key={item.id} className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-900">{new Date(item.tanggal).toLocaleDateString()}</div>
                    <div className="mt-2 text-sm text-slate-600">Nafsu makan: {item.nafsuMakan}</div>
                    <div className="text-sm text-slate-600">Aktivitas: {item.aktivitas}</div>
                    <div className="mt-2 text-sm text-slate-600">Catatan: {item.catatanGejala || '-'}</div>
                  </div>
                ))
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Ringkasan Treatment</div>
              {hewan.RekamMedis.length === 0 ? (
                <div className="mt-3 text-sm text-slate-500">Belum ada treatment dokter.</div>
              ) : (
                hewan.RekamMedis.slice(0, 3).map((record) => (
                  <div key={record.id} className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{new Date(record.tanggalPeriksa).toLocaleDateString()}</div>
                        <div className="text-sm text-slate-500">Dokter: {record.dokter?.name || 'Tidak diketahui'}</div>
                      </div>
                      <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">Treatment</span>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <div className="text-sm text-slate-500">Obat</div>
                        <div className="mt-1 text-slate-900">{record.obat || '-'}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <div className="text-sm text-slate-500">Perawatan</div>
                        <div className="mt-1 text-slate-900">{record.perawatan || '-'}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <div className="text-sm text-slate-500">Dosis</div>
                        <div className="mt-1 text-slate-900">{record.dosis || '-'}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <div className="text-sm text-slate-500">Catatan Dokter</div>
                        <div className="mt-1 text-slate-900">{record.catatanDokter || '-'}</div>
                      </div>
                    </div>
                    {record.progress?.length ? (
                      <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-sm font-semibold text-slate-900">Progress Terakhir</div>
                        <div className="mt-3 space-y-3">
                          {record.progress.slice(0, 2).map((progress) => (
                            <div key={progress.id} className="rounded-2xl bg-white p-3 shadow-sm">
                              <div className="text-sm font-semibold text-slate-900">{new Date(progress.tanggal).toLocaleDateString()}</div>
                              <div className="mt-1 text-sm text-slate-600">Kondisi: {progress.kondisi}</div>
                              <div className="text-sm text-slate-600">Progress: {progress.progress}</div>
                              {progress.catatan ? <div className="mt-1 text-sm text-slate-600">Catatan: {progress.catatan}</div> : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
