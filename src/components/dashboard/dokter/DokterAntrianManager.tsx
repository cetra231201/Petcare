'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/Toast'

type Appointment = {
  id: string
  tanggal: string
  waktu: string
  status: string
  hewan?: { nama?: string }
  pelanggan?: { name?: string }
}

export default function DokterAntrianManager({ dokterId }: { dokterId: string }) {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dokterAntrian', dokterId],
    queryFn: async () => {
      const res = await fetch(`/api/appointment?dokterId=${dokterId}`)
      if (!res.ok) throw new Error('Gagal memuat antrian')
      return res.json()
    },
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/appointment/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Gagal memperbarui status')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dokterAntrian', dokterId] }),
  })

  if (isLoading) return <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 text-slate-500">Memuat antrian...</div>
  if (isError) return <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 text-slate-500">Terjadi kesalahan memuat antrian.</div>

  const appointments: Appointment[] = data?.data || []

  return (
    <div className="mt-6 space-y-4">
      {appointments.length === 0 ? (
        <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">Belum ada antrian mendatang.</div>
      ) : (
        appointments.map((appointment) => (
          <div key={appointment.id} className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold text-slate-900">{new Date(appointment.tanggal).toLocaleDateString()} {appointment.waktu}</div>
                <div className="text-sm text-slate-600">Pasien: {appointment.hewan?.nama || '-'}</div>
                <div className="text-sm text-slate-600">Pemilik: {appointment.pelanggan?.name || '-'}</div>
                <div className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{appointment.status}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {appointment.status !== 'DIKONFIRMASI' && appointment.status !== 'DIBATALKAN' ? (
                  <button
                    type="button"
                    onClick={() => updateStatus.mutate({ id: appointment.id, status: 'DIKONFIRMASI' })}
                    className="rounded-lg bg-teal-600 px-4 py-2 text-white"
                  >
                    Konfirmasi
                  </button>
                ) : null}
                {appointment.status !== 'SELESAI' && appointment.status !== 'DIBATALKAN' ? (
                  <button
                    type="button"
                    onClick={() => updateStatus.mutate({ id: appointment.id, status: 'SELESAI' })}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-white"
                  >
                    Tanda Selesai
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
