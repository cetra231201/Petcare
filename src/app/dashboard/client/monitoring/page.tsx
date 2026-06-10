import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import MonitoringDashboard from '@/components/client/MonitoringDashboard'

export default async function PelangganMonitoringPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'CLIENT') redirect('/dashboard')

  const pelangganId = (session.user as any)?.id as string
  const hewanList = await prisma.hewan.findMany({
    where: { pelangganId },
    include: {
      Monitoring: { orderBy: { tanggal: 'desc' }, take: 5 },
      RekamMedis: { include: { progress: { orderBy: { tanggal: 'desc' } } }, orderBy: { createdAt: 'desc' }, take: 5 },
    },
    orderBy: { createdAt: 'desc' },
  })

  const initialHewan = JSON.parse(JSON.stringify(hewanList))

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-teal-700">Monitoring</h2>
        <p className="mt-1 text-sm text-slate-500">Pantau semua treatment dan progress dokter untuk hewan Anda secara real-time.</p>
      </div>
      <MonitoringDashboard initialHewan={initialHewan} userId={pelangganId} />
    </div>
  )
}