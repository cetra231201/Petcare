'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from '@/components/shared/Toast'

type Appointment = {
  id: string
  tanggal: string
  waktu: string
  status: string
  hewan?: { nama?: string }
  dokter?: { name?: string }
}

export default function RiwayatHistory() {
  const [statusFilter, setStatusFilter] = useState('')
  const { data, isLoading, isError } = useQuery({
    queryKey: ['appointmentHistory'],
    queryFn: async () => {
      const res = await fetch('/api/appointment?limit=50')
      if (!res.ok) throw new Error('Gagal mengambil riwayat appointment')
      return res.json()
    },
  })

  if (isLoading) {
    return <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 text-slate-500">Memuat riwayat...</div>
  }
  if (isError) {
    toast('Tidak dapat memuat riwayat appointment')
    return <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 text-slate-500">Terjadi kesalahan saat memuat riwayat.</div>
  }

  const appointments: Appointment[] = data?.data || []
  const filtered = statusFilter ? appointments.filter((item) => item.status === statusFilter) : appointments

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-600">Filter status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2"
          >
            <option value="">Semua status</option>
            <option value="MENUNGGU">Menunggu</option>
            <option value="DIKONFIRMASI">Dikonfirmasi</option>
            <option value="SELESAI">Selesai</option>
            <option value="DIBATALKAN">Dibatalkan</option>
          </select>
        </div>
        <a
          href="/api/reports/appointments?format=pdf"
          className="inline-flex items-center rounded-lg bg-teal-600 px-4 py-2 text-white"
        >
          Unduh PDF Riwayat
        </a>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 text-slate-500">Belum ada riwayat appointment.</div>
      ) : (
        filtered.map((item) => (
          <div key={item.id} className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold text-slate-900">{new Date(item.tanggal).toLocaleDateString()} {item.waktu}</div>
                <div className="text-sm text-slate-600">Hewan: {item.hewan?.nama || '-'}</div>
                <div className="text-sm text-slate-600">Dokter: {item.dokter?.name || 'Belum ditentukan'}</div>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{item.status}</div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
