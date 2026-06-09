import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

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

  return (
    <div>
      <h2 className="text-2xl font-semibold text-teal-700">Monitoring</h2>
      <p className="mt-1 text-sm text-slate-500">Catatan monitoring harian dan treatment dari dokter untuk hewan Anda.</p>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {hewanList.length === 0 ? (
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">Belum ada hewan terdaftar.</div>
        ) : (
          hewanList.map((hewan) => (
            <div key={hewan.id} className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
              <div className="font-semibold text-slate-900">{hewan.nama}</div>
              <div className="mt-3 space-y-4">
                <div>
                  <div className="text-sm font-medium text-slate-900">Monitoring Terakhir</div>
                  {hewan.Monitoring.length === 0 ? (
                    <div className="text-sm text-slate-500">Belum ada monitoring.</div>
                  ) : (
                    hewan.Monitoring.map((item) => (
                      <div key={item.id} className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="text-sm font-semibold text-slate-900">{new Date(item.tanggal).toLocaleDateString()}</div>
                        <div className="text-sm text-slate-600">Nafsu makan: {item.nafsuMakan}</div>
                        <div className="text-sm text-slate-600">Aktivitas: {item.aktivitas}</div>
                        <div className="text-sm text-slate-600">Catatan: {item.catatanGejala || '-'}</div>
                      </div>
                    ))
                  )}
                </div>

                <div>
                  <div className="text-sm font-medium text-slate-900">Riwayat Treatment</div>
                  {hewan.RekamMedis.length === 0 ? (
                    <div className="text-sm text-slate-500">Belum ada treatment dokter.</div>
                  ) : (
                    hewan.RekamMedis.map((rekam) => (
                      <div key={rekam.id} className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="text-sm font-semibold text-slate-900">{new Date(rekam.tanggalPeriksa).toLocaleDateString()}</div>
                        <div className="text-sm text-slate-600">Diagnosis: {rekam.diagnosis || '-'}</div>
                        <div className="text-sm text-slate-600">Perawatan: {rekam.perawatan || '-'}</div>
                        <div className="text-sm text-slate-600">Obat: {rekam.obat || '-'}</div>
                        <div className="text-sm text-slate-600">Dosis: {rekam.dosis || '-'}</div>
                        <div className="text-sm text-slate-600">Catatan Treatment: {rekam.catatanPerawatan || '-'}</div>
                        {rekam.progress?.length ? (
                          <div className="mt-3 space-y-2">
                            <div className="text-sm font-medium text-slate-700">Progress Harian</div>
                            {rekam.progress.map((progress) => (
                              <div key={progress.id} className="rounded-xl bg-white p-3 border border-slate-200">
                                <div className="text-sm font-semibold text-slate-900">{new Date(progress.tanggal).toLocaleDateString()}</div>
                                <div className="text-sm text-slate-600">Kondisi: {progress.kondisi}</div>
                                <div className="text-sm text-slate-600">Progress: {progress.progress}</div>
                                {progress.catatan ? <div className="text-sm text-slate-600">Catatan: {progress.catatan}</div> : null}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}