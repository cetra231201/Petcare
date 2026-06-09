import prisma from '@/lib/prisma'
import { sendAppointmentReminder } from './email'
import { logError } from './error-logging'

export async function sendUpcomingAppointmentReminders(windowHours = 24) {
  const now = new Date()
  const until = new Date(now.getTime() + windowHours * 60 * 60 * 1000)

  const appts = await prisma.appointment.findMany({
    where: {
      tanggal: { gte: now, lte: until },
      status: { in: ['MENUNGGU', 'DIKONFIRMASI'] },
    },
    include: { pelanggan: true, hewan: true },
  })

  let sent = 0
  for (const a of appts) {
    try {
      const to = a.pelanggan.email
      await sendAppointmentReminder(to, { id: a.id, tanggal: a.tanggal.toISOString(), jenis: a.jenis })
      await prisma.notifikasi.create({ data: { userId: a.pelangganId, judul: 'Pengingat Janji Temu', isi: `Janji temu untuk ${a.hewan.nama} pada ${a.tanggal.toLocaleString()}`, tipe: 'INFO' } })
      sent++
    } catch (err) {
      // log and continue
      logError(err, { fileName: 'reminders.ts', functionName: 'sendUpcomingAppointmentReminders', additionalContext: { appointmentId: a.id } })
    }
  }

  return { count: sent }
}

export default sendUpcomingAppointmentReminders
