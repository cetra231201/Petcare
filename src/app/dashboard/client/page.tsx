"use client"

import React from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useHewan } from '@/hooks/useHewan'
import { useAppointment } from '@/hooks/useAppointment'
import { useNotifikasi } from '@/hooks/useNotifikasi'
import { Bell, ClipboardList, HeartPulse, PawPrint, Users, CalendarDays } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatsCard from '@/components/shared/StatsCard'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function PelangganHome() {
  const { data: session, status } = useSession()
  const userId = (session?.user as any)?.id
  const { data: hewanData } = useHewan(1, 20, userId)
  const { data: appointmentData } = useAppointment({ pelangganId: userId })
  const { data: notifikasiData } = useNotifikasi(userId)

  const hewanCount = (hewanData as { data: any[] } | undefined)?.data?.length || 0
  const appointmentCount = (appointmentData as { data: any[] } | undefined)?.data?.length || 0
  const unreadNotifications = (notifikasiData as { data: any[] } | undefined)?.data?.filter((n) => !n.isRead).length || 0

  if (status === 'loading') return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        title={`Selamat datang, ${session?.user?.name || 'Pelanggan'}`}
        subtitle="Kelola hewan kesayangan, jadwal kunjungan, dan notifikasi klinik dengan tampilan yang aman dan mudah diakses." 
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <StatsCard icon={<PawPrint size={24} />} label="Hewan" value={hewanCount} trend={{ direction: 'up', percent: 7, label: 'dibanding bulan lalu' }} />
        <StatsCard icon={<CalendarDays size={24} />} label="Janji" value={appointmentCount} trend={{ direction: 'up', percent: 5, label: 'minggu ini' }} />
        <StatsCard icon={<Bell size={24} />} label="Notifikasi" value={unreadNotifications} trend={{ direction: 'up', percent: 2, label: 'baru' }} />
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/client/monitoring" className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Cek status kesehatan</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">Monitoring</h3>
            </div>
            <HeartPulse size={28} className="text-teal-600" />
          </div>
        </Link>

        <Link href="/dashboard/client/riwayat" className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Lihat riwayat kunjungan</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">Riwayat</h3>
            </div>
            <ClipboardList size={28} className="text-teal-600" />
          </div>
        </Link>

        <Link href="/dashboard/client/profil" className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Perbarui informasi akun</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">Profil</h3>
            </div>
            <Users size={28} className="text-teal-600" />
          </div>
        </Link>
      </section>
    </div>
  )
}
