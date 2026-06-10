import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { forbidden, getCurrentUserWithRole, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

export async function PUT(req: NextRequest, context: any) {
  try {
    const token = await getCurrentUserWithRole()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'STAFF') return forbidden()

    const invoice = await prisma.invoice.findUnique({
      where: { id: context.params.id },
      include: { items: true },
    })
    if (!invoice) return notFound()
    if (invoice.status !== 'APPROVED') return NextResponse.json({ message: 'Only approved invoices can be printed' }, { status: 400 })

    const inventoryItems = invoice.items.filter((item) => item.inventoryId)
    const stocks = await Promise.all(
      inventoryItems.map(async (item) => {
        const stock = await prisma.inventory.findUnique({ where: { id: item.inventoryId! }, select: { stok: true } })
        if (!stock) throw new Error(`Item inventory tidak ditemukan: ${item.namaItem}`)
        return { item, stock: stock.stok }
      })
    )

    for (const { item, stock } of stocks) {
      if (stock < item.quantity) {
        return NextResponse.json({ message: `Stok ${item.namaItem} tidak cukup` }, { status: 400 })
      }
    }

    const operations = stocks.flatMap(({ item, stock }) => [
      prisma.inventory.update({
        where: { id: item.inventoryId! },
        data: { stok: { decrement: item.quantity } },
      }),
      prisma.inventoryMovement.create({
        data: {
          inventoryId: item.inventoryId!,
          userId: token.id,
          type: 'SALE',
          quantity: item.quantity,
          beforeStock: stock,
          afterStock: stock - item.quantity,
          note: `Auto deduct for invoice ${context.params.id}`,
        },
      }),
    ])

    const result = await prisma.$transaction([
      ...operations,
      prisma.invoice.update({
        where: { id: context.params.id },
        data: { status: 'PRINTED', printedAt: new Date(), printedById: token.id },
        include: { customer: true, hewan: true, approvedBy: true, printedBy: true, items: true },
      }),
    ])
    const printedInvoice = result[result.length - 1]

    return NextResponse.json(printedInvoice)
  } catch (error) {
    logError(error, { fileName: 'invoice/[id]/print/route.ts', functionName: 'PUT' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Error printing invoice' }, { status: 500 })
  }
}
