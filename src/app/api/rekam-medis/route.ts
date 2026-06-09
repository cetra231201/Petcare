import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { forbidden, getApiToken, getTokenUserId, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

const createSchema = z.object({
  appointmentId: z.string(),
  hewanId: z.string(),
  dokterId: z.string(),
  tanggalPeriksa: z.string(),
  keluhan: z.string().optional(),
  diagnosis: z.string().optional(),
  tindakan: z.string().optional(),
  resep: z.string().optional(),
  obat: z.string().optional(),
  perawatan: z.string().optional(),
  dosis: z.string().optional(),
  catatanPerawatan: z.string().optional(),
  catatanDokter: z.string().optional(),
  lampiran: z.array(z.string()).optional(),
})

export async function GET(req: Request) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const url = new URL(req.url)
    const hewanId = url.searchParams.get('hewanId') || undefined
    const page = Number(url.searchParams.get('page') || '1')
    const limit = Number(url.searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const userId = getTokenUserId(token)

    if (hewanId) {
      const hewan = await prisma.hewan.findUnique({ where: { id: hewanId }, select: { pelangganId: true } })
      if (!hewan) return notFound('Hewan not found')
      if (token.role !== 'ADMIN' && token.role !== 'DOKTER' && hewan.pelangganId !== userId) return forbidden()

      const [data, total] = await Promise.all([
        prisma.rekamMedis.findMany({ where: { hewanId }, include: { progress: { orderBy: { tanggal: 'desc' } } }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        prisma.rekamMedis.count({ where: { hewanId } }),
      ])
      return NextResponse.json({ data, meta: { page, limit, total } })
    }

    if (token.role === 'ADMIN') {
      const [data, total] = await Promise.all([
        prisma.rekamMedis.findMany({ include: { progress: { orderBy: { tanggal: 'desc' } } }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        prisma.rekamMedis.count(),
      ])
      return NextResponse.json({ data, meta: { page, limit, total } })
    }
    if (token.role === 'DOKTER') {
      const [data, total] = await Promise.all([
        prisma.rekamMedis.findMany({ where: { dokterId: userId }, include: { progress: { orderBy: { tanggal: 'desc' } } }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        prisma.rekamMedis.count({ where: { dokterId: userId } }),
      ])
      return NextResponse.json({ data, meta: { page, limit, total } })
    }

    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  } catch (error) {
    logError(error, { fileName: 'rekam-medis/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error fetching rekam medis' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'DOKTER' && token.role !== 'ADMIN') return forbidden()

    const body = await req.json()
    const parsed = createSchema.parse(body)
    // enforce dokterId from token for DOKTER role
    if (token.role === 'DOKTER') parsed.dokterId = getTokenUserId(token)
    if (token.role === 'ADMIN' && !parsed.dokterId) return NextResponse.json({ message: 'dokterId is required' }, { status: 400 })
    const created = await prisma.rekamMedis.create({ data: { ...parsed, tanggalPeriksa: new Date(parsed.tanggalPeriksa) } })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    logError(error, { fileName: 'rekam-medis/route.ts', functionName: 'POST' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
  }
}
