import { NextResponse } from 'next/server'
import sendUpcomingAppointmentReminders from '@/lib/reminders'
import { checkRateLimit } from '@/lib/rate-limit'
import { forbidden, getApiToken, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

export async function POST(req: Request) {
  try {
    const limit = checkRateLimit(req, 'send-reminders', 5, 60 * 60 * 1000)
    if (limit.limited) {
      return NextResponse.json(
        { message: 'Too many reminder requests, please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
      )
    }

    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN') return forbidden()

    const body = await req.json().catch(() => ({}))
    const hours = Number(body.hours || 24)
    const result = await sendUpcomingAppointmentReminders(hours)
    return NextResponse.json({ message: 'Reminders sent', ...result })
  } catch (error) {
    logError(error, { fileName: 'appointments/send-reminders/route.ts', functionName: 'POST' })
    return NextResponse.json({ message: 'Error sending reminders' }, { status: 500 })
  }
}
