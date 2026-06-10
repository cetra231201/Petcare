import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { forbidden, getApiToken, getTokenUserId, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

const updateSchema = z.object({
  hari: z.string().optional(),
  jamMulai: z.string().optional(),
  jamSelesai: z.string().optional(),
  isAktif: z.boolean().optional(),
})

export async function PUT(req: NextRequest, context: any) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const jadwal = await prisma.jadwalDokter.findUnique({ where: { id: context.params.id }, select: { dokterId: true } })
    if (!jadwal) return notFound()
    if (token.role !== 'ADMIN' && token.role !== 'DOKTER') return forbidden()
    if (token.role === 'DOKTER' && getTokenUserId(token) !== jadwal.dokterId) return forbidden()

    const body = await req.json()
    const parsed = updateSchema.parse(body)
    const updated = await prisma.jadwalDokter.update({ where: { id: context.params.id }, data: parsed as any })
    return NextResponse.json(updated)
  } catch (error) {
    logError(error, { fileName: 'jadwal/[id]/route.ts', functionName: 'PUT' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const jadwal = await prisma.jadwalDokter.findUnique({ where: { id: context.params.id }, select: { dokterId: true } })
    if (!jadwal) return notFound()
    if (token.role !== 'ADMIN' && token.role !== 'DOKTER') return forbidden()
    if (token.role === 'DOKTER' && getTokenUserId(token) !== jadwal.dokterId) return forbidden()

    await prisma.jadwalDokter.delete({ where: { id: context.params.id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    logError(error, { fileName: 'jadwal/[id]/route.ts', functionName: 'DELETE' })
    return NextResponse.json({ message: 'Error deleting jadwal' }, { status: 500 })
  }
}
