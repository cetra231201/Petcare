import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import RekamMedisTreatmentEditor from '@/components/rekam-medis/RekamMedisTreatmentEditor'
import TreatmentProgressManager from '@/components/rekam-medis/TreatmentProgressManager'

export default async function DokterRekamMedisPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'DOKTER') redirect('/dashboard')

  const dokterId = (session.user as any)?.id as string
  const records = await prisma.rekamMedis.findMany({
    where: { dokterId },
    include: { hewan: true, appointment: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-teal-700">Rekam Medis & Treatment</h2>
        <p className="mt-1 text-sm text-slate-500">Catat treatment dan progress harian untuk hewan pasien Anda.</p>
      </div>

      {records.length === 0 ? (
        <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">Belum ada rekam medis.</div>
      ) : (
        <div className="grid gap-6">
          {records.map((record) => (
            <div key={record.id} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_1fr]">
              <div className="space-y-4">
                <div>
                  <div className="text-lg font-semibold text-slate-900">{record.hewan?.nama || record.hewanId}</div>
                  <div className="text-sm text-slate-500">{record.appointment?.jenis || 'Rekam medis'} • {new Date(record.tanggalPeriksa).toLocaleDateString()}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Keluhan</div>
                  <div className="mt-1 text-slate-900">{record.keluhan || '-'}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Diagnosis</div>
                  <div className="mt-1 text-slate-900">{record.diagnosis || '-'}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Tindakan</div>
                  <div className="mt-1 text-slate-900">{record.tindakan || '-'}</div>
                </div>
                <RekamMedisTreatmentEditor record={record} />
              </div>

              <TreatmentProgressManager rekamMedis={record} allowUpdate={true} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}