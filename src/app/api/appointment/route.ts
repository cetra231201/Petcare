import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { forbidden, getApiToken, getTokenUserId, unauthorized } from '@/lib/api-auth'

const createSchema = z.object({
  pelangganId: z.string().optional(),
  hewanId: z.string(),
  dokterId: z.string().optional(),
  tanggal: z.string(),
  waktu: z.string(),
  jenis: z.string(),
  keluhan: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const token = await getApiToken(req)
    if (!token) return unauthorized()

    const userId = getTokenUserId(token)
    const role = token.role
    const url = new URL(req.url)
    const page = Number(url.searchParams.get('page') || '1')
    const limit = Number(url.searchParams.get('limit') || '20')
    const pelangganId = url.searchParams.get('pelangganId')
    const dokterId = url.searchParams.get('dokterId')
    const skip = (page - 1) * limit
    const where: any = {}

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
      prisma.appointment.findMany({ where, skip, take: limit, orderBy: { tanggal: 'desc' } }),
      prisma.appointment.count({ where }),
    ])
    return NextResponse.json({ data, meta: { page, limit, total } })
  } catch (err) {
    return NextResponse.json({ message: 'Error fetching appointments' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const token = await getApiToken(req)
    if (!token) return unauthorized()
    if (token.role !== 'CLIENT' && token.role !== 'ADMIN') return forbidden()

    const body = await req.json()
    const parsed = createSchema.parse(body)
    const userId = getTokenUserId(token)
    if (!parsed.pelangganId || token.role === 'CLIENT') parsed.pelangganId = userId
    if (!parsed.pelangganId) return NextResponse.json({ message: 'pelangganId is required' }, { status: 400 })
    if (token.role === 'CLIENT' && parsed.pelangganId !== userId) return forbidden()
    const appointmentData = { ...parsed, tanggal: new Date(parsed.tanggal) } as any
    const created = await prisma.appointment.create({ data: appointmentData })
    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Invalid input' }, { status: 400 })
  }
}
