import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { forbidden, getApiToken, getTokenUserId, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

const updateSchema = z.object({ beratBadan: z.number().optional(), suhu: z.number().optional(), nafsuMakan: z.enum(['BAIK', 'SEDANG', 'BURUK']).optional(), aktivitas: z.enum(['AKTIF', 'NORMAL', 'LESU']).optional(), catatanGejala: z.string().optional() })

export async function GET(req: NextRequest, context: any) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const { id } = context.params
    const item = await prisma.monitoringHarian.findUnique({ where: { id }, select: { hewan: { select: { pelangganId: true } }, id: true, hewanId: true, tanggal: true, beratBadan: true, suhu: true, nafsuMakan: true, aktivitas: true, catatanGejala: true, createdAt: true } })
    if (!item) return notFound()

    const userId = getTokenUserId(token)
    if (token.role !== 'ADMIN' && token.role !== 'DOKTER' && item.hewan.pelangganId !== userId) return forbidden()

    return NextResponse.json(item)
  } catch (error) {
    logError(error, { fileName: 'monitoring/[id]/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: any) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const { id } = context.params
    const item = await prisma.monitoringHarian.findUnique({ where: { id }, select: { hewan: { select: { pelangganId: true } } } })
    if (!item) return notFound()

    const userId = getTokenUserId(token)
    if (token.role !== 'ADMIN' && token.role !== 'DOKTER' && item.hewan.pelangganId !== userId) return forbidden()

    const body = await req.json()
    const parsed = updateSchema.parse(body)
    const updated = await prisma.monitoringHarian.update({ where: { id }, data: parsed })
    return NextResponse.json(updated)
  } catch (error) {
    logError(error, { fileName: 'monitoring/[id]/route.ts', functionName: 'PUT' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const { id } = context.params
    const item = await prisma.monitoringHarian.findUnique({ where: { id }, select: { hewan: { select: { pelangganId: true } } } })
    if (!item) return notFound()

    const userId = getTokenUserId(token)
    if (token.role !== 'ADMIN' && token.role !== 'DOKTER' && item.hewan.pelangganId !== userId) return forbidden()

    await prisma.monitoringHarian.delete({ where: { id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    logError(error, { fileName: 'monitoring/[id]/route.ts', functionName: 'DELETE' })
    return NextResponse.json({ message: 'Error deleting' }, { status: 500 })
  }
}
