import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { forbidden, getApiToken, getTokenUserId, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'
import { sseService } from '@/lib/sse'
import { rekamMedisUpdateSchema } from '@/lib/validation/schemas'

const updateSchema = rekamMedisUpdateSchema

export async function GET(req: NextRequest, context: any) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const { id } = context.params
    const item = await prisma.rekamMedis.findUnique({
      where: { id },
      select: {
        hewanId: true,
        dokterId: true,
        progress: { orderBy: { tanggal: 'desc' } },
      },
    })
    if (!item) return notFound()

    const userId = getTokenUserId(token)
    if (token.role === 'ADMIN') {
      // admins can access all records
    } else if (token.role === 'DOKTER') {
      if (item.dokterId !== userId) return forbidden()
    } else {
      const hewan = await prisma.hewan.findUnique({ where: { id: item.hewanId }, select: { pelangganId: true } })
      if (!hewan || hewan.pelangganId !== userId) return forbidden()
    }

    return NextResponse.json(item)
  } catch (error) {
    logError(error, { fileName: 'rekam-medis/[id]/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: any) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'DOKTER') return forbidden()

    const { id } = context.params
    const item = await prisma.rekamMedis.findUnique({ where: { id }, select: { dokterId: true } })
    if (!item) return notFound()
    if (token.role === 'DOKTER' && item.dokterId !== getTokenUserId(token)) return forbidden()

    const body = await req.json()
    const parsed = updateSchema.parse(body)
    const updated = await prisma.rekamMedis.update({ where: { id }, data: parsed })

    const rekam = await prisma.rekamMedis.findUnique({ where: { id }, select: { hewan: { select: { pelangganId: true } }, dokterId: true } })
    if (rekam) {
      sseService.publish({ type: `message:${rekam.hewan.pelangganId}`, payload: { type: 'rekam-medis-updated', id, updated } })
      sseService.publish({ type: `message:${rekam.dokterId}`, payload: { type: 'rekam-medis-updated', id, updated } })
    }

    return NextResponse.json(updated)
  } catch (error) {
    logError(error, { fileName: 'rekam-medis/[id]/route.ts', functionName: 'PUT' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'DOKTER') return forbidden()

    const { id } = context.params
    const item = await prisma.rekamMedis.findUnique({ where: { id }, select: { dokterId: true } })
    if (!item) return notFound()
    if (token.role === 'DOKTER' && item.dokterId !== getTokenUserId(token)) return forbidden()

    await prisma.rekamMedis.delete({ where: { id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    logError(error, { fileName: 'rekam-medis/[id]/route.ts', functionName: 'DELETE' })
    return NextResponse.json({ message: 'Error deleting' }, { status: 500 })
  }
}
