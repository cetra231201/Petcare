import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { forbidden, getApiToken, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'
import { inventoryUpdateSchema } from '@/lib/validation/schemas'

const updateSchema = inventoryUpdateSchema

export async function PUT(req: NextRequest, context: any) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'STAFF') return forbidden()

    const body = await req.json()
    const parsed = updateSchema.parse(body) as any
    const item = await prisma.inventory.findUnique({ where: { id: context.params.id } })
    if (!item) return notFound()
    const updated = await prisma.inventory.update({ where: { id: context.params.id }, data: parsed })
    return NextResponse.json(updated)
  } catch (error) {
    logError(error, { fileName: 'inventory/[id]/route.ts', functionName: 'PUT' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN') return forbidden()
    const item = await prisma.inventory.findUnique({ where: { id: context.params.id } })
    if (!item) return notFound()
    await prisma.inventory.delete({ where: { id: context.params.id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    logError(error, { fileName: 'inventory/[id]/route.ts', functionName: 'DELETE' })
    return NextResponse.json({ message: 'Error deleting' }, { status: 500 })
  }
}
