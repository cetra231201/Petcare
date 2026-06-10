"use client"
import React from 'react'
import { useSession } from 'next-auth/react'
import AppointmentForm from '@/components/client/AppointmentForm'
import { useHewan } from '@/hooks/useHewan'
import { useAppointment, useCreateAppointment } from '@/hooks/useAppointment'
import { useDoctors } from '@/hooks/useDoctors'
import { toast } from '@/components/shared/Toast'

export default function AppointmentPage() {
  const { data: session, status } = useSession()
  const userId = (session?.user as any)?.id

  const { data: petsData } = useHewan(1, 20, userId)
  const { data: doctorsList } = useDoctors()
  const { data: appointmentData, isLoading: isLoadingAppointments } = useAppointment({ pelangganId: userId })
  const create = useCreateAppointment()

  const pets = (petsData as { data: any[] } | undefined)?.data || []
  const doctors = doctorsList || []
  const appointments = (appointmentData as { data: any[] } | undefined)?.data || []

  const handleSubmit = async (vals: any) => {
    try {
      await create.mutateAsync(vals)
      toast('Janji berhasil dibuat')
    } catch (e: any) {
      toast(e.message || 'Gagal membuat janji')
    }
  }

  if (status === 'loading') return <div>Memuat...</div>

  return (
    <div>
      <h2 className="text-2xl font-semibold text-teal-700">Buat Janji</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="bg-white p-4 rounded shadow">
          <AppointmentForm onSubmit={handleSubmit} doctors={doctors} pets={pets} />
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Janji Anda</h3>
            {isLoadingAppointments ? (
              <div className="mt-3">Memuat janji...</div>
            ) : (
              <div className="mt-3 space-y-3">
                {appointments.length === 0 ? (
                  <div>Belum ada janji.</div>
                ) : (
                  appointments.map((item: any) => (
                    <div key={item.id} className="border p-3 rounded">
                      <div className="font-semibold">{new Date(item.tanggal).toLocaleDateString()} {item.waktu}</div>
                      <div className="text-sm text-slate-600">{item.jenis}</div>
                      <div className="text-sm">Hewan ID: {item.hewanId}</div>
                      <div className="text-sm">Dokter ID: {item.dokterId || 'Belum ditentukan'}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
