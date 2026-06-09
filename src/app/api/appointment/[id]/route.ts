import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { forbidden, getApiToken, getTokenUserId, notFound, unauthorized } from '@/lib/api-auth'

const updateSchema = z.object({ dokterId: z.string().nullable().optional(), status: z.string().optional(), catatanAdmin: z.string().optional() })

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getApiToken(req)
    if (!token) return unauthorized()

    const { id } = params
    const item = await prisma.appointment.findUnique({ where: { id } })
    if (!item) return notFound()

    const userId = getTokenUserId(token)
    if (token.role !== 'ADMIN' && token.role !== 'DOKTER' && token.role !== 'STAFF' && item.pelangganId !== userId) return forbidden()
    if (token.role === 'DOKTER' && item.dokterId !== userId && item.pelangganId !== userId) return forbidden()

    return NextResponse.json(item)
  } catch (err) {
    return NextResponse.json({ message: 'Error' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const token = await getApiToken(req)
    if (!token) return unauthorized()

    const item = await prisma.appointment.findUnique({ where: { id }, select: { dokterId: true, pelangganId: true } })
    if (!item) return notFound()

    const body = await req.json()
    const parsed = updateSchema.parse(body)
    // allow DOKTER or ADMIN to update appointment
    const userId = getTokenUserId(token)
    if (token.role !== 'ADMIN' && token.role !== 'DOKTER') return forbidden()
    if (token.role === 'DOKTER' && item.dokterId !== userId) return forbidden()

    const updated = await prisma.appointment.update({ where: { id }, data: parsed as any })

    // publish queue update via SSE
    try {
      const { sseService } = await import('@/lib/sse')
      sseService.publish({ type: 'queue:update', payload: updated })
    } catch (e) {}

    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Invalid input' }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const token = await getApiToken(req)
    if (!token) return unauthorized()

    // allow ADMIN or owner (pelanggan)
    const appt = await prisma.appointment.findUnique({ where: { id } })
    if (!appt) return notFound()
    const userId = getTokenUserId(token)
    if (token.role !== 'ADMIN' && userId !== appt.pelangganId) return forbidden()

    await prisma.appointment.delete({ where: { id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (err) {
    return NextResponse.json({ message: 'Error deleting' }, { status: 500 })
  }
}
