import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import RiwayatHistory from '@/components/pelanggan/RiwayatHistory'

export default async function PelangganRiwayatPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'CLIENT') redirect('/dashboard')

  const pelangganId = (session.user as any)?.id as string
  const treatmentRecords = await prisma.rekamMedis.findMany({
    where: { hewan: { pelangganId } },
    include: {
      hewan: true,
      dokter: { select: { name: true } },
      progress: { orderBy: { tanggal: 'desc' } },
    },
    orderBy: { tanggalPeriksa: 'desc' },
    take: 20,
  })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-teal-700">Riwayat</h2>
        <p className="mt-1 text-sm text-slate-500">Lihat appointment dan treatment sebelumnya untuk hewan Anda.</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Riwayat Appointment</h3>
          <p className="mt-1 text-sm text-slate-500">Daftar appointment dan kunjungan yang sudah terjadi.</p>
          <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <RiwayatHistory />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-slate-900">Riwayat Treatment</h3>
          <p className="mt-1 text-sm text-slate-500">Rekam medis dan progress yang dicatat dokter untuk hewan Anda.</p>
          {treatmentRecords.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">Belum ada treatment atau progress dokter untuk hewan Anda.</div>
          ) : (
            <div className="mt-4 space-y-4">
              {treatmentRecords.map((rekam) => (
                <div key={rekam.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{rekam.hewan?.nama || 'Hewan tidak diketahui'}</div>
                      <div className="text-sm text-slate-500">{new Date(rekam.tanggalPeriksa).toLocaleDateString()} • Dokter: {rekam.dokter?.name || '-'}</div>
                    </div>
                    <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">Treatment</span>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4 border border-slate-200">
                      <div className="text-sm text-slate-500">Diagnosis</div>
                      <div className="mt-1 text-slate-900">{rekam.diagnosis || '-'}</div>
                    </div>
                    <div className="rounded-2xl bg-white p-4 border border-slate-200">
                      <div className="text-sm text-slate-500">Tindakan</div>
                      <div className="mt-1 text-slate-900">{rekam.tindakan || '-'}</div>
                    </div>
                    <div className="rounded-2xl bg-white p-4 border border-slate-200">
                      <div className="text-sm text-slate-500">Obat</div>
                      <div className="mt-1 text-slate-900">{rekam.obat || '-'}</div>
                    </div>
                    <div className="rounded-2xl bg-white p-4 border border-slate-200">
                      <div className="text-sm text-slate-500">Dosis</div>
                      <div className="mt-1 text-slate-900">{rekam.dosis || '-'}</div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-white p-4 border border-slate-200">
                      <div className="text-sm text-slate-500">Catatan Treatment</div>
                      <div className="mt-1 text-slate-900">{rekam.catatanPerawatan || '-'}</div>
                    </div>
                    <div className="rounded-2xl bg-white p-4 border border-slate-200">
                      <div className="text-sm text-slate-500">Catatan Dokter</div>
                      <div className="mt-1 text-slate-900">{rekam.catatanDokter || '-'}</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-semibold text-slate-900">Riwayat Progress Harian</div>
                    {rekam.progress.length === 0 ? (
                      <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">Belum ada progress harian.</div>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {rekam.progress.map((progress) => (
                          <div key={progress.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="text-sm font-semibold text-slate-900">{new Date(progress.tanggal).toLocaleDateString()}</div>
                              <span className="text-sm text-slate-500">{progress.progress}</span>
                            </div>
                            <div className="mt-2 text-sm text-slate-600">Kondisi: {progress.kondisi}</div>
                            {progress.catatan ? <div className="mt-1 text-sm text-slate-600">Catatan: {progress.catatan}</div> : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}