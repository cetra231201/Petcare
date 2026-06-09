import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function StaffDashboard() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'STAFF') redirect('/dashboard')

  const [appointmentCount, inventoryCount] = await Promise.all([
    prisma.appointment.count(),
    prisma.inventory.count(),
  ])

  return (
    <div>
      <h2 className="text-2xl font-semibold text-teal-700">Staff Dashboard</h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">Total Appointment: {appointmentCount}</div>
        <div className="p-4 bg-white rounded shadow">Total Inventory Items: {inventoryCount}</div>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/staff/appointment" className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 hover:border-teal-300">
          <div className="text-sm text-slate-500">Kelola jadwal appointment</div>
          <div className="mt-1 font-semibold text-slate-900">Appointment</div>
        </Link>
        <Link href="/dashboard/staff/inventory" className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 hover:border-teal-300">
          <div className="text-sm text-slate-500">Akses inventory petshop</div>
          <div className="mt-1 font-semibold text-slate-900">Inventory</div>
        </Link>
        <Link href="/dashboard/staff/petshop" className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 hover:border-teal-300">
          <div className="text-sm text-slate-500">Buat invoice penjualan petshop</div>
          <div className="mt-1 font-semibold text-slate-900">Petshop</div>
        </Link>
        <Link href="/dashboard/staff/invoice" className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 hover:border-teal-300">
          <div className="text-sm text-slate-500">Kelola invoice customer</div>
          <div className="mt-1 font-semibold text-slate-900">Invoice</div>
        </Link>
      </div>
    </div>
  )
}
