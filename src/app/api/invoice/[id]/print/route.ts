import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { forbidden, getCurrentUserWithRole, notFound, unauthorized } from '@/lib/api-auth'

const db = prisma as any

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getCurrentUserWithRole(req)
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'STAFF') return forbidden()

    const invoice = await db.invoice.findUnique({
      where: { id: params.id },
      include: { items: true },
    })
    if (!invoice) return notFound()
    if (invoice.status !== 'APPROVED') return NextResponse.json({ message: 'Only approved invoices can be printed' }, { status: 400 })

    const inventoryItems = invoice.items.filter((item) => item.inventoryId)
    const stocks = await Promise.all(
      inventoryItems.map(async (item) => {
        const stock = await db.inventory.findUnique({ where: { id: item.inventoryId! }, select: { stok: true } })
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
      db.inventory.update({
        where: { id: item.inventoryId! },
        data: { stok: { decrement: item.quantity } },
      }),
      db.inventoryMovement.create({
        data: {
          inventoryId: item.inventoryId!,
          userId: token.id,
          type: 'SALE',
          quantity: item.quantity,
          beforeStock: stock,
          afterStock: stock - item.quantity,
          note: `Auto deduct for invoice ${params.id}`,
        },
      }),
    ])

    const result = await db.$transaction([
      ...operations,
      db.invoice.update({
        where: { id: params.id },
        data: { status: 'PRINTED', printedAt: new Date(), printedById: token.id },
        include: { customer: true, hewan: true, approvedBy: true, printedBy: true, items: true },
      }),
    ])
    const printedInvoice = result[result.length - 1]

    return NextResponse.json(printedInvoice)
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Error printing invoice' }, { status: 500 })
  }
}
