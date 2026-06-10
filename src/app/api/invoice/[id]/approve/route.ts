import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { forbidden, getCurrentUserWithRole, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

export async function PUT(req: NextRequest, context: any) {
  try {
    const token = await getCurrentUserWithRole()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN') return forbidden()

    const invoice = await prisma.invoice.findUnique({ where: { id: context.params.id }, select: { status: true, items: { select: { inventoryId: true, quantity: true, namaItem: true } } } })
    if (!invoice) return notFound()
    if (invoice.status === 'APPROVED' || invoice.status === 'PRINTED' || invoice.status === 'VOID') {
      return NextResponse.json({ message: 'Invoice cannot be approved' }, { status: 400 })
    }

    const updated = await (prisma.$transaction as any)(async (tx: any) => {
      for (const item of invoice.items) {
        if (!item.inventoryId) continue

        const inventory = await tx.inventory.findUnique({ where: { id: item.inventoryId } })
        if (!inventory) {
          throw new Error(`Inventory item not found for ${item.namaItem}`)
        }
        if (inventory.stok < item.quantity) {
          throw new Error(`Insufficient stock for ${item.namaItem}`)
        }

        const afterStock = inventory.stok - item.quantity
        await tx.inventory.update({ where: { id: item.inventoryId }, data: { stok: afterStock } })
        await tx.inventoryMovement.create({
          data: {
            inventoryId: item.inventoryId,
            userId: token.id,
            type: 'SALE',
            quantity: item.quantity,
            beforeStock: inventory.stok,
            afterStock,
            note: `Sale from invoice ${context.params.id}`,
          },
        })
      }

      return tx.invoice.update({
        where: { id: context.params.id },
        data: { status: 'APPROVED', approvedAt: new Date(), approvedById: token.id },
        include: { customer: true, hewan: true, approvedBy: true, printedBy: true, items: true },
      })
    })

    return NextResponse.json(updated)
  } catch (error) {
    logError(error, { fileName: 'invoice/[id]/approve/route.ts', functionName: 'PUT' })
    const message = error instanceof Error ? error.message : 'Error approving invoice'
    if (message.includes('Insufficient stock')) {
      return NextResponse.json({ message }, { status: 422 })
    }
    return NextResponse.json({ message: 'Error approving invoice' }, { status: 500 })
  }
}
