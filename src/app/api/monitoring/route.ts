import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { forbidden, getApiToken, getTokenUserId, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

const createSchema = z.object({
  hewanId: z.string(),
  tanggal: z.string(),
  beratBadan: z.number().optional(),
  suhu: z.number().optional(),
  nafsuMakan: z.enum(['BAIK', 'SEDANG', 'BURUK']),
  aktivitas: z.enum(['AKTIF', 'NORMAL', 'LESU']),
  catatanGejala: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const userId = getTokenUserId(token)
    const role = token.role
    const url = new URL(req.url)
    const hewanId = url.searchParams.get('hewanId')
    const where: Prisma.MonitoringHarianWhereInput = {}

    if (role === 'ADMIN' || role === 'DOKTER') {
      if (hewanId) where.hewanId = hewanId
    } else if (hewanId) {
      const hewan = await prisma.hewan.findUnique({ where: { id: hewanId }, select: { pelangganId: true } })
      if (!hewan) return notFound('Hewan not found')
      if (hewan.pelangganId !== userId) return forbidden()
      where.hewanId = hewanId
    } else {
      where.hewan = { pelangganId: userId }
    }

    const data = await prisma.monitoringHarian.findMany({ where, orderBy: { tanggal: 'asc' } })
    return NextResponse.json({ data })
  } catch (error) {
    logError(error, { fileName: 'monitoring/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error fetching monitoring' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const userId = getTokenUserId(token)
    const role = token.role
    const body = await req.json()
    const parsed = createSchema.parse(body)
    const hewan = await prisma.hewan.findUnique({ where: { id: parsed.hewanId }, select: { pelangganId: true } })
    if (!hewan) return notFound('Hewan not found')
    if (role === 'CLIENT' && hewan.pelangganId !== userId) return forbidden()

    const created = await prisma.monitoringHarian.create({ data: { ...parsed, tanggal: new Date(parsed.tanggal) } })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    logError(error, { fileName: 'monitoring/route.ts', functionName: 'POST' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
  }
}
