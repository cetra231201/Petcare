import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { forbidden, getApiToken, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

const adjustSchema = z.object({
  adjustment: z.coerce.number().int(),
  note: z.string().optional(),
})

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'STAFF') return forbidden()

    const body = await req.json()
    const parsed = adjustSchema.parse(body)

    const inventory = await prisma.inventory.findUnique({ where: { id: params.id } })
    if (!inventory) return notFound()

    const nextStock = inventory.stok + parsed.adjustment
    if (nextStock < 0) {
      return NextResponse.json({ message: 'Penyesuaian stok tidak boleh membuat stok negatif' }, { status: 400 })
    }

    const updated = await prisma.$transaction([
      prisma.inventory.update({
        where: { id: params.id },
        data: {
          stok: nextStock,
          lastManualCheckAt: new Date(),
        },
      }),
      prisma.inventoryMovement.create({
        data: {
          inventoryId: params.id,
          userId: token.id,
          type: 'MANUAL_ADJUSTMENT',
          quantity: parsed.adjustment,
          beforeStock: inventory.stok,
          afterStock: nextStock,
          note: parsed.note,
        },
      }),
    ])

    return NextResponse.json(updated[0])
  } catch (error) {
    logError(error, { fileName: 'inventory/[id]/adjust/route.ts', functionName: 'PUT' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Error adjusting inventory' }, { status: 400 })
  }
}
