import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { forbidden, getApiToken, getTokenUserId, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

const updateSchema = z.object({
  nama: z.string().optional(),
  ras: z.string().optional(),
  tanggalLahir: z.string().optional(),
  beratBadan: z.number().optional(),
  foto: z.string().optional(),
  catatanKhusus: z.string().optional(),
})

export async function GET(req: NextRequest, context: any) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const { id } = context.params
    const hewan = await prisma.hewan.findUnique({ where: { id } })
    if (!hewan) return notFound()

    const userId = getTokenUserId(token)
    if (token.role !== 'ADMIN' && token.role !== 'DOKTER' && hewan.pelangganId !== userId) return forbidden()

    return NextResponse.json(hewan)
  } catch (error) {
    logError(error, { fileName: 'hewan/[id]/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: any) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const { id } = context.params
    const hewan = await prisma.hewan.findUnique({ where: { id }, select: { pelangganId: true } })
    if (!hewan) return notFound()

    const userId = getTokenUserId(token)
    if (token.role !== 'ADMIN' && hewan.pelangganId !== userId) return forbidden()

    const body = await req.json()
    const parsed = updateSchema.parse(body)
    const updated = await prisma.hewan.update({ where: { id }, data: parsed })
    return NextResponse.json(updated)
  } catch (error) {
    logError(error, { fileName: 'hewan/[id]/route.ts', functionName: 'PUT' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const { id } = context.params
    const hewan = await prisma.hewan.findUnique({ where: { id }, select: { pelangganId: true } })
    if (!hewan) return notFound()

    const userId = getTokenUserId(token)
    if (token.role !== 'ADMIN' && hewan.pelangganId !== userId) return forbidden()

    await prisma.hewan.delete({ where: { id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    logError(error, { fileName: 'hewan/[id]/route.ts', functionName: 'DELETE' })
    return NextResponse.json({ message: 'Error deleting' }, { status: 500 })
  }
}
