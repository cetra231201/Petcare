import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'
import { forbidden, getApiToken, getTokenUserId, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'
import type { ApiPaginatedResponse, AppointmentCreateInput } from '@/types'

const createSchema = z.object({
  pelangganId: z.string().optional(),
  hewanId: z.string(),
  dokterId: z.string().optional(),
  tanggal: z.string(),
  waktu: z.string(),
  jenis: z.enum(['PEMERIKSAAN', 'VAKSINASI', 'BEDAH', 'GROOMING', 'DENTAL', 'RAWAT_INAP', 'TELEMEDICINE', 'HOME_VISIT']),
  keluhan: z.string().optional(),
})

interface AppointmentWhereClause {
  pelangganId?: string
  dokterId?: string
  OR?: Array<{ dokterId: string } | { pelangganId: string }>
}

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const userId = getTokenUserId(token)
    const role = token.role
    const url = new URL(req.url)
    const page = Number(url.searchParams.get('page') || '1')
    const limit = Number(url.searchParams.get('limit') || '20')
    const pelangganId = url.searchParams.get('pelangganId')
    const dokterId = url.searchParams.get('dokterId')
    const skip = (page - 1) * limit
    const where: AppointmentWhereClause = {}

    if (role === 'ADMIN' || role === 'STAFF') {
      if (pelangganId) where.pelangganId = pelangganId
      if (dokterId) where.dokterId = dokterId
    } else if (role === 'DOKTER') {
      if (pelangganId && pelangganId !== userId) return forbidden()
      if (dokterId && dokterId !== userId) return forbidden()
      where.OR = [{ dokterId: userId }, { pelangganId: pelangganId || userId }]
    } else {
      if (pelangganId && pelangganId !== userId) return forbidden()
      if (dokterId) return forbidden()
      where.pelangganId = userId
    }

    const [data, total] = await Promise.all([
      prisma.appointment.findMany({ 
        where, 
        skip, 
        take: limit, 
        orderBy: { tanggal: 'desc' },
        include: {
          pelanggan: { select: { id: true, name: true, email: true } },
          hewan: { select: { id: true, nama: true, jenis: true } },
          dokter: { select: { id: true, name: true } },
        },
      }),
      prisma.appointment.count({ where }),
    ])

    const response: ApiPaginatedResponse = { data, meta: { page, limit, total } }
    return NextResponse.json(response)
  } catch (error) {
    logError(error, {
      fileName: 'appointment/route.ts',
      functionName: 'GET',
    })
    return NextResponse.json({ message: 'Error fetching appointments' }, { status: 500 })
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const limit = checkRateLimit(req, 'create-appointment', 10, 15 * 60 * 1000)
    if (limit.limited) {
      return NextResponse.json(
        { message: 'Too many appointment creation attempts, please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
      )
    }

    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'CLIENT' && token.role !== 'ADMIN') return forbidden()

    const body = await req.json()
    const parsed = createSchema.parse(body)
    const userId = getTokenUserId(token)
    if (!parsed.pelangganId || token.role === 'CLIENT') parsed.pelangganId = userId
    if (!parsed.pelangganId) return NextResponse.json({ message: 'pelangganId is required' }, { status: 400 })
    if (token.role === 'CLIENT' && parsed.pelangganId !== userId) return forbidden()

    const appointmentData: AppointmentCreateInput = {
      pelangganId: parsed.pelangganId,
      hewanId: parsed.hewanId,
      dokterId: parsed.dokterId ?? null,
      tanggal: new Date(parsed.tanggal),
      waktu: parsed.waktu,
      jenis: parsed.jenis,
      keluhan: parsed.keluhan ?? null,
    }

    const created = await prisma.appointment.create({ data: appointmentData })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    logError(error, {
      fileName: 'appointment/route.ts',
      functionName: 'POST',
    })
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', details: error.errors }, { status: 400 })
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to create appointment'
    return NextResponse.json({ message: errorMessage }, { status: 400 })
  }
}
