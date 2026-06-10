import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { forbidden, getApiToken, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

export async function GET(req: Request) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'DOKTER') return forbidden()

    const url = new URL(req.url)
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    const type = url.searchParams.get('type') || 'monthly'

    // simple aggregation: count appointments by status
    const where: Prisma.AppointmentWhereInput = {}
    if (from) where.createdAt = { gte: new Date(from) }
    if (to) where.createdAt = { ...(where.createdAt as Prisma.DateTimeFilter | undefined), lte: new Date(to) }

    const counts = await (prisma.appointment.groupBy as any)({
      by: ['status'],
      where,
      _count: { status: true },
    })

    return NextResponse.json({ counts, type })
  } catch (error) {
    logError(error, { fileName: 'laporan/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error generating report' }, { status: 500 })
  }
}
