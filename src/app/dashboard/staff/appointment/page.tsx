import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function StaffAppointmentPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'STAFF') redirect('/dashboard')

  const appointments = await prisma.appointment.findMany({
    include: { hewan: true, pelanggan: true, dokter: true },
    orderBy: { tanggal: 'desc' },
    take: 30,
  })

  return (
    <div>
      <h2 className="text-2xl font-semibold text-teal-700">Appointment</h2>
      <p className="mt-1 text-sm text-slate-500">Daftar appointment untuk monitoring dan invoice.</p>
      <div className="mt-6 space-y-3">
        {appointments.length === 0 ? (
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">Belum ada appointment.</div>
        ) : (
          appointments.map((item) => (
            <div key={item.id} className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
              <div className="font-semibold text-slate-900">{new Date(item.tanggal).toLocaleDateString()} {item.waktu}</div>
              <div className="mt-1 text-sm text-slate-600">Pelanggan: {item.pelanggan?.name || item.pelangganId}</div>
              <div className="text-sm text-slate-600">Hewan: {item.hewan?.nama || item.hewanId}</div>
              <div className="text-sm text-slate-600">Dokter: {item.dokter?.name || 'Belum ditentukan'}</div>
              <div className="text-sm text-slate-600">Status: {item.status}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
