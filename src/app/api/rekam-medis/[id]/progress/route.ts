import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { forbidden, getApiToken, getTokenUserId, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'
import { sseService } from '@/lib/sse'

const progressSchema = z.object({
  kondisi: z.string(),
  progress: z.string(),
  catatan: z.string().optional(),
})

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const { id } = params
    const rekam = await prisma.rekamMedis.findUnique({ where: { id }, select: { hewan: { select: { pelangganId: true } }, dokterId: true } })
    if (!rekam) return notFound()

    const userId = getTokenUserId(token)
    if (token.role !== 'ADMIN' && token.role !== 'DOKTER' && rekam.hewan.pelangganId !== userId) return forbidden()

    const data = await prisma.treatmentProgress.findMany({ where: { rekamMedisId: id }, orderBy: { tanggal: 'desc' } })
    return NextResponse.json({ data })
  } catch (error) {
    logError(error, { fileName: 'rekam-medis/[id]/progress/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error fetching progress' }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'DOKTER') return forbidden()

    const { id } = params
    const rekam = await prisma.rekamMedis.findUnique({ where: { id }, select: { hewan: { select: { pelangganId: true } }, dokterId: true } })
    if (!rekam) return notFound()
    if (token.role === 'DOKTER' && rekam.dokterId !== getTokenUserId(token)) return forbidden()

    const body = await req.json()
    const parsed = progressSchema.parse(body)
    const created = await prisma.treatmentProgress.create({ data: { ...parsed, rekamMedisId: id, tanggal: new Date() } })

    sseService.publish({ type: `message:${rekam.hewan.pelangganId}`, payload: { type: 'rekam-medis-progress', rekamMedisId: id, item: created } })
    sseService.publish({ type: `message:${rekam.dokterId}`, payload: { type: 'rekam-medis-progress', rekamMedisId: id, item: created } })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    logError(error, { fileName: 'rekam-medis/[id]/progress/route.ts', functionName: 'POST' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
  }
}
