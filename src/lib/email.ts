import nodemailer from 'nodemailer'
import type { Appointment } from '@/types'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendWelcomeEmail(to: string, name: string) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: `Selamat datang di Klinik Hewan, ${name}`,
    html: buildEmailTemplate({
      title: `Selamat datang, ${name}`,
      subtitle: 'Akun Anda sudah aktif dan siap digunakan.',
      body: 'Silakan login untuk mengelola hewan, membuat janji temu, dan memantau layanan klinik.',
      cta: { label: 'Buka Dashboard', href: `${baseUrl()}/dashboard` },
    }),
  })
}

export async function sendAppointmentConfirmation(to: string, appointment: Appointment) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: `Konfirmasi Janji Temu - ${appointment.jenis}`,
    html: buildEmailTemplate({
      title: 'Janji Temu Dikonfirmasi',
      subtitle: `Layanan ${appointment.jenis} telah dijadwalkan.`,
      body: renderAppointmentDetails(appointment),
    }),
  })
}

export async function sendAppointmentReminder(to: string, appointment: Appointment) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: `Pengingat Janji Temu - ${appointment.jenis}`,
    html: buildEmailTemplate({
      title: 'Pengingat Janji Temu',
      subtitle: 'Jangan lupa jadwal pemeriksaan Anda.',
      body: renderAppointmentDetails(appointment),
      cta: { label: 'Lihat Dashboard', href: `${baseUrl()}/dashboard/client` },
    }),
  })
}

export async function sendAppointmentCancellation(to: string, appointment: Appointment) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: `Pembatalan Janji Temu - ${appointment.jenis}`,
    html: buildEmailTemplate({
      title: 'Janji Temu Dibatalkan',
      subtitle: 'Jadwal Anda tidak lagi aktif.',
      body: renderAppointmentDetails(appointment),
    }),
  })
}

export async function sendPasswordReset(to: string, token: string) {
  const url = `${baseUrl()}/reset-password?token=${token}`
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'Reset Password',
    html: buildEmailTemplate({
      title: 'Reset Password',
      subtitle: 'Gunakan tombol berikut untuk mengatur ulang password Anda.',
      body: 'Tautan reset bersifat sementara dan hanya dapat digunakan satu kali.',
      cta: { label: 'Reset Password', href: url },
    }),
  })
}

function baseUrl() {
  return process.env.NEXTAUTH_URL || process.env.NOW_URL || 'http://localhost:3000'
}

function renderAppointmentDetails(appointment: Appointment) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:16px;">
      <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;"><strong>Tanggal</strong><br/>${appointment.tanggal}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;"><strong>Waktu</strong><br/>${appointment.waktu}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;"><strong>Jenis</strong><br/>${appointment.jenis}</td></tr>
      <tr><td style="padding:10px 0;"><strong>Catatan</strong><br/>${appointment.keluhan || '-'}</td></tr>
    </table>
  `
}

function buildEmailTemplate({ title, subtitle, body, cta }: { title: string; subtitle: string; body: string; cta?: { label: string; href: string } }) {
  const ctaMarkup = cta
    ? `<tr><td align="center" style="padding-top:24px;"><a href="${cta.href}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600;">${cta.label}</a></td></tr>`
    : ''

  return `
    <div style="margin:0;padding:0;background:#f8fafc;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;">
              <tr>
                <td style="background:linear-gradient(135deg,#0f766e,#115e59);padding:28px 32px;color:#ffffff;">
                  <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;">Klinik Hewan</div>
                  <h1 style="margin:8px 0 0;font-size:26px;line-height:1.2;">${title}</h1>
                  <p style="margin:10px 0 0;font-size:14px;line-height:1.6;opacity:.92;">${subtitle}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;color:#0f172a;font-size:15px;line-height:1.75;">
                  ${body}
                </td>
              </tr>
              ${ctaMarkup}
              <tr>
                <td style="padding:24px 32px 32px;color:#94a3b8;font-size:12px;line-height:1.6;">
                  Email ini dikirim otomatis oleh sistem Klinik Hewan. Jika Anda tidak meminta email ini, abaikan pesan ini.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `
}

export default transporter
