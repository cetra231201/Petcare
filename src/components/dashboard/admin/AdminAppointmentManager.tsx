'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDoctors } from '@/hooks/useDoctors'
import { toast } from '@/components/shared/Toast'

type Appointment = {
  id: string
  tanggal: string
  waktu: string
  status: string
  hewan?: { nama?: string }
  dokter?: { name?: string }
  pelanggan?: { name?: string }
}

type Doctor = { id: string; name: string }

export default function AdminAppointmentManager() {
  const queryClient = useQueryClient()
  const [assignedDoctor, setAssignedDoctor] = useState<Record<string, string>>({})
  const { data: doctorData, isLoading: isDoctorsLoading } = useDoctors()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminAppointments'],
    queryFn: async () => {
      const res = await fetch('/api/appointment?limit=50')
      if (!res.ok) throw new Error('Gagal memuat appointment')
      return res.json()
    },
  })

  const updateAppointment = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await fetch(`/api/appointment/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Gagal memperbarui appointment')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminAppointments'] }),
  })

  if (isLoading || isDoctorsLoading) return <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 text-slate-500">Memuat appointment...</div>
  if (isError) return <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 text-slate-500">Terjadi kesalahan memuat appointment.</div>

  const appointments: Appointment[] = data?.data || []
  const doctors: Doctor[] = doctorData || []

  return (
    <div className="mt-6 space-y-4">
      {appointments.length === 0 ? (
        <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">Belum ada appointment.</div>
      ) : (
        appointments.map((item) => (
          <div key={item.id} className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="font-semibold text-slate-900">{new Date(item.tanggal).toLocaleDateString()} {item.waktu}</div>
                <div className="text-sm text-slate-600">Pelanggan: {item.pelanggan?.name || '-'}</div>
                <div className="text-sm text-slate-600">Hewan: {item.hewan?.nama || '-'}</div>
                <div className="text-sm text-slate-600">Dokter: {item.dokter?.name || 'Belum ditugaskan'}</div>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{item.status}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {item.status !== 'DIKONFIRMASI' && item.status !== 'DIBATALKAN' ? (
                <button
                  type="button"
                  onClick={() => updateAppointment.mutate({ id: item.id, payload: { status: 'DIKONFIRMASI' } })}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-white"
                >
                  Konfirmasi
                </button>
              ) : null}
              {item.status !== 'DIBATALKAN' ? (
                <button
                  type="button"
                  onClick={() => updateAppointment.mutate({ id: item.id, payload: { status: 'DIBATALKAN' } })}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-white"
                >
                  Batalkan
                </button>
              ) : null}
              <div className="flex items-center gap-2">
                <select
                  value={assignedDoctor[item.id] || item.dokter?.name || ''}
                  onChange={(e) => setAssignedDoctor((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <option value="">Pilih dokter</option>
                  {doctors.map((dokter) => (
                    <option key={dokter.id} value={dokter.id}>{dokter.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!assignedDoctor[item.id]}
                  onClick={() => updateAppointment.mutate({ id: item.id, payload: { dokterId: assignedDoctor[item.id] } })}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-white disabled:opacity-50"
                >
                  Tugaskan
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
