import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import AdminJadwalManager from '@/components/dashboard/admin/AdminJadwalManager'

export default async function AdminJadwalDokterPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div>
      <h2 className="text-2xl font-semibold text-teal-700">Jadwal Dokter</h2>
      <p className="mt-1 text-sm text-slate-500">Semua jadwal praktek yang terdaftar.</p>
      <AdminJadwalManager />
    </div>
  )
}