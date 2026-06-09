import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { forbidden, getApiToken, getTokenUserId, notFound, unauthorized } from '@/lib/api-auth'
import { sseService } from '@/lib/sse'

const updateSchema = z.object({ keluhan: z.string().optional(), diagnosis: z.string().optional(), tindakan: z.string().optional(), resep: z.string().optional(), obat: z.string().optional(), perawatan: z.string().optional(), dosis: z.string().optional(), catatanPerawatan: z.string().optional(), catatanDokter: z.string().optional(), lampiran: z.array(z.string()).optional() })

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getApiToken(req)
    if (!token) return unauthorized()

    const { id } = params
    const item = await prisma.rekamMedis.findUnique({ where: { id }, include: { progress: { orderBy: { tanggal: 'desc' } } } })
    if (!item) return notFound()

    const userId = getTokenUserId(token)
    if (token.role !== 'ADMIN' && token.role !== 'DOKTER') {
      const hewan = await prisma.hewan.findUnique({ where: { id: item.hewanId }, select: { pelangganId: true } })
      if (!hewan || hewan.pelangganId !== userId) return forbidden()
    }

    return NextResponse.json(item)
  } catch (err) {
    return NextResponse.json({ message: 'Error' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getApiToken(req)
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'DOKTER') return forbidden()

    const { id } = params
    const item = await prisma.rekamMedis.findUnique({ where: { id }, select: { dokterId: true } })
    if (!item) return notFound()
    if (token.role === 'DOKTER' && item.dokterId !== getTokenUserId(token)) return forbidden()

    const body = await req.json()
    const parsed = updateSchema.parse(body)
    const updated = await prisma.rekamMedis.update({ where: { id }, data: parsed as any })

    const rekam = await prisma.rekamMedis.findUnique({ where: { id }, select: { hewan: { select: { pelangganId: true } }, dokterId: true } })
    if (rekam) {
      sseService.publish({ type: `message:${rekam.hewan.pelangganId}`, payload: { type: 'rekam-medis-updated', id, updated } })
      sseService.publish({ type: `message:${rekam.dokterId}`, payload: { type: 'rekam-medis-updated', id, updated } })
    }

    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Invalid input' }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getApiToken(req)
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'DOKTER') return forbidden()

    const { id } = params
    const item = await prisma.rekamMedis.findUnique({ where: { id }, select: { dokterId: true } })
    if (!item) return notFound()
    if (token.role === 'DOKTER' && item.dokterId !== getTokenUserId(token)) return forbidden()

    await prisma.rekamMedis.delete({ where: { id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (err) {
    return NextResponse.json({ message: 'Error deleting' }, { status: 500 })
  }
}
