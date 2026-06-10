import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { CalendarDays, ClipboardList, Package, ShoppingBag, CreditCard, Bell, Activity, Database, FileText, DollarSign, ListChecks } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatsCard from '@/components/shared/StatsCard'

function startOfDay() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}

function endOfDay(start: Date) {
  const next = new Date(start)
  next.setDate(next.getDate() + 1)
  return next
}

export default async function StaffDashboard() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'STAFF') redirect('/dashboard')

  const todayStart = startOfDay()
  const todayEnd = endOfDay(todayStart)

  const [appointmentsToday, waitingToday, confirmedToday, completedToday, pendingInvoices, revenueToday, vaccineAppointments, activeInventory, notifications] = await Promise.all([
    prisma.appointment.count({ where: { tanggal: { gte: todayStart, lt: todayEnd } } }),
    prisma.appointment.count({ where: { tanggal: { gte: todayStart, lt: todayEnd }, status: 'MENUNGGU' } }),
    prisma.appointment.count({ where: { tanggal: { gte: todayStart, lt: todayEnd }, status: 'DIKONFIRMASI' } }),
    prisma.appointment.count({ where: { tanggal: { gte: todayStart, lt: todayEnd }, status: 'SELESAI' } }),
    prisma.invoice.count({ where: { status: { in: ['DRAFT', 'PENDING_APPROVAL'] } } }),
    prisma.invoice.aggregate({
      where: { status: { in: ['APPROVED', 'PRINTED', 'PAID'] }, updatedAt: { gte: todayStart, lt: todayEnd } },
      _sum: { total: true },
    }).then((result) => result._sum.total ?? 0),
    prisma.appointment.count({ where: { tanggal: { gte: todayStart, lt: todayEnd }, jenis: 'VAKSINASI' } }),
    prisma.inventory.findMany({ select: { stok: true, stokMinimal: true } }),
    prisma.notifikasi.count({ where: { tipe: 'PERINGATAN', createdAt: { gte: todayStart, lt: todayEnd } } }),
  ])

  const lowStockCount = activeInventory.filter((item) => item.stok <= item.stokMinimal).length

  const [recentInvoices, recentInventoryMovements] = await Promise.all([
    prisma.invoice.findMany({
      where: { status: { in: ['APPROVED', 'PRINTED', 'PAID'] } },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { customer: true, items: { include: { service: true } } },
    }),
    prisma.inventoryMovement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { inventory: true },
    }),
  ])

  return (
    <div>
      <PageHeader title="Staff Dashboard" subtitle="Selesaikan tugas harian Anda dengan kontrol operasional yang mudah dijangkau dan statistik ringkas." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={<CalendarDays size={24} />} label="Janji Hari Ini" value={appointmentsToday} trend={{ direction: 'up', percent: 12, label: 'dibanding kemarin' }} />
        <StatsCard icon={<ListChecks size={24} />} label="Menunggu" value={waitingToday} trend={{ direction: 'down', percent: 5, label: 'antrian aktif' }} />
        <StatsCard icon={<DollarSign size={24} />} label="Pendapatan" value={`Rp ${revenueToday.toLocaleString('id-ID')}`} trend={{ direction: 'up', percent: 8, label: 'hari ini' }} />
        <StatsCard icon={<Database size={24} />} label="Stok Kurang" value={lowStockCount} trend={{ direction: 'up', percent: 20, label: 'perhatian' }} />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Konfirmasi pasien</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">{waitingToday} menunggu</h3>
        </div>
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Sedang dirawat</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">{confirmedToday} dalam proses</h3>
        </div>
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Janji vaksinasi</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">{vaccineAppointments} hari ini</h3>
        </div>
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Pengingat obat</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">{notifications}</h3>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/dashboard/staff/appointment" className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Atur jadwal janji</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">Appointment</h3>
            </div>
            <ClipboardList size={28} className="text-teal-600" />
          </div>
        </Link>

        <Link href="/dashboard/staff/inventory" className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Kelola produk</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">Inventory</h3>
            </div>
            <Package size={28} className="text-teal-600" />
          </div>
        </Link>

        <Link href="/dashboard/staff/pos" className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Buka kasir dan penjualan</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">POS</h3>
            </div>
            <ShoppingBag size={28} className="text-teal-600" />
          </div>
        </Link>

        <Link href="/dashboard/staff/invoice" className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Kelola faktur</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">Invoice</h3>
            </div>
            <CreditCard size={28} className="text-teal-600" />
          </div>
        </Link>
      </section>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Ringkasan Transaksi</h3>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
              <div>
                <p className="text-sm text-slate-500">Invoice tertunda</p>
                <p className="text-xl font-semibold text-slate-900">{pendingInvoices}</p>
              </div>
              <div className="rounded-2xl bg-teal-100 px-3 py-2 text-teal-700">
                <Activity size={18} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
              <div>
                <p className="text-sm text-slate-500">Pasien selesai</p>
                <p className="text-xl font-semibold text-slate-900">{completedToday}</p>
              </div>
              <div className="rounded-2xl bg-indigo-100 px-3 py-2 text-indigo-700">
                <ListChecks size={18} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Aktivitas Terbaru</h3>
          <div className="mt-6 space-y-3">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Invoice {invoice.invoiceNumber}</p>
                <p className="mt-1 font-semibold text-slate-900">Rp {invoice.total.toLocaleString('id-ID')}</p>
                <p className="text-sm text-slate-500">{invoice.customer?.name || 'Pelanggan anonim'}</p>
              </div>
            ))}
            {recentInventoryMovements.map((movement) => (
              <div key={movement.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <p className="text-sm text-slate-500">{movement.inventory?.namaItem || 'Barang tidak ditemukan'}</p>
                <p className="mt-1 text-sm text-slate-700">{movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity} stok</p>
                <p className="text-xs text-slate-500">{new Date(movement.createdAt).toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
