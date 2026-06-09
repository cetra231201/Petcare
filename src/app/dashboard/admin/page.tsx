import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dashboard')
  const [clientCount, dokterCount, hewanCount, appointmentCount] = await Promise.all([
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.user.count({ where: { role: 'DOKTER' } }),
    prisma.hewan.count(),
    prisma.appointment.count(),
  ])

  return (
    <div>
      <h2 className="text-2xl font-semibold text-teal-700">Admin Dashboard</h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">Total Pelanggan: {clientCount}</div>
        <div className="p-4 bg-white rounded shadow">Total Dokter: {dokterCount}</div>
        <div className="p-4 bg-white rounded shadow">Total Janji: {appointmentCount}</div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link href="/dashboard/admin/appointment" className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 hover:border-teal-300">
          <div className="text-sm text-slate-500">Pantau transaksi</div>
          <div className="mt-1 font-semibold text-slate-900">Appointment</div>
        </Link>
        <Link href="/dashboard/admin/jadwal-dokter" className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 hover:border-teal-300">
          <div className="text-sm text-slate-500">Atur jadwal</div>
          <div className="mt-1 font-semibold text-slate-900">Jadwal Dokter</div>
        </Link>
        <Link href="/dashboard/admin/petshop" className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 hover:border-teal-300">
          <div className="text-sm text-slate-500">Kelola penjualan petshop</div>
          <div className="mt-1 font-semibold text-slate-900">Petshop</div>
        </Link>
        <Link href="/dashboard/admin/invoice" className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 hover:border-teal-300">
          <div className="text-sm text-slate-500">Kelola invoice</div>
          <div className="mt-1 font-semibold text-slate-900">Invoice</div>
        </Link>
        <Link href="/dashboard/admin/reports" className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 hover:border-teal-300">
          <div className="text-sm text-slate-500">Ekspor data</div>
          <div className="mt-1 font-semibold text-slate-900">Reports</div>
        </Link>
      </div>
      <div className="mt-6 bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold">Hewan Terdaftar</h3>
        <div className="mt-3">Total hewan: {hewanCount}</div>
      </div>
    </div>
  )
}
