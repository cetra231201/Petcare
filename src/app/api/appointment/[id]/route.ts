import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { assertRole, forbidden, getApiToken, getTokenUserId, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

const updateSchema = z.object({ dokterId: z.string().nullable().optional(), status: z.string().optional(), catatanAdmin: z.string().optional() })

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const { id } = params
    const item = await prisma.appointment.findUnique({ 
      where: { id },
      include: {
        pelanggan: { select: { id: true, name: true, email: true } },
        hewan: { select: { id: true, nama: true, jenis: true } },
        dokter: { select: { id: true, name: true } },
      },
    })
    if (!item) return notFound()

    const userId = getTokenUserId(token)
    if (token.role === 'ADMIN' || token.role === 'STAFF') return NextResponse.json(item)
    if (token.role === 'DOKTER' && item.dokterId !== userId && item.dokterId !== null && item.pelangganId !== userId) return forbidden()
    if (token.role === 'CLIENT' && item.pelangganId !== userId) return forbidden()

    return NextResponse.json(item)
  } catch (error) {
    logError(error, { fileName: 'appointment/[id]/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const token = await getApiToken()
    if (!token) return unauthorized()

    const item = await prisma.appointment.findUnique({ where: { id }, select: { dokterId: true, pelangganId: true } })
    if (!item) return notFound()

    const body = await req.json()
    const parsed = updateSchema.parse(body)
    const userId = getTokenUserId(token)
    if (!assertRole(token, ['ADMIN', 'STAFF', 'DOKTER'])) return forbidden()
    if (token.role === 'DOKTER' && item.dokterId !== userId && item.dokterId !== null) return forbidden()

    const updated = await prisma.appointment.update({ where: { id }, data: parsed })

    // publish queue update via SSE
    try {
      const { sseService } = await import('@/lib/sse')
      sseService.publish({ type: 'queue:update', payload: updated })
    } catch (e) {}

    return NextResponse.json(updated)
  } catch (error) {
    logError(error, { fileName: 'appointment/[id]/route.ts', functionName: 'PUT' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const token = await getApiToken()
    if (!token) return unauthorized()

    // allow ADMIN or owner (pelanggan)
    const appt = await prisma.appointment.findUnique({ where: { id } })
    if (!appt) return notFound()
    const userId = getTokenUserId(token)
    if (token.role !== 'ADMIN' && userId !== appt.pelangganId) return forbidden()

    await prisma.appointment.delete({ where: { id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    logError(error, { fileName: 'appointment/[id]/route.ts', functionName: 'DELETE' })
    return NextResponse.json({ message: 'Error deleting' }, { status: 500 })
  }
}
