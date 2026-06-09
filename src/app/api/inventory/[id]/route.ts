import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { forbidden, getApiToken, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

const updateSchema = z.object({ namaItem: z.string().optional(), kategori: z.string().optional(), stok: z.number().optional(), satuan: z.string().optional(), harga: z.number().optional(), stokMinimal: z.number().optional() })

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'STAFF') return forbidden()

    const body = await req.json()
    const parsed = updateSchema.parse(body)
    const item = await prisma.inventory.findUnique({ where: { id: params.id } })
    if (!item) return notFound()
    const updated = await prisma.inventory.update({ where: { id: params.id }, data: parsed })
    return NextResponse.json(updated)
  } catch (error) {
    logError(error, { fileName: 'inventory/[id]/route.ts', functionName: 'PUT' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN') return forbidden()
    const item = await prisma.inventory.findUnique({ where: { id: params.id } })
    if (!item) return notFound()
    await prisma.inventory.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    logError(error, { fileName: 'inventory/[id]/route.ts', functionName: 'DELETE' })
    return NextResponse.json({ message: 'Error deleting' }, { status: 500 })
  }
}
