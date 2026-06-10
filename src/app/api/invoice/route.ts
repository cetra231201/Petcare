import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InvoiceStatus } from '@prisma/client'
import { forbidden, getCurrentUserWithRole, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'
import { invoiceCreateSchema } from '@/lib/validation/schemas'

async function generateInvoiceNumber() {
  const now = new Date()
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
  const startOfDay = new Date(`${now.toISOString().slice(0, 10)}T00:00:00.000Z`)
  const endOfDay = new Date(`${now.toISOString().slice(0, 10)}T23:59:59.999Z`)
  const countToday = await prisma.invoice.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  })
  const sequence = String(countToday + 1).padStart(4, '0')
  return `INV-${datePart}-${sequence}`
}

export async function GET(req: Request) {
  try {
    const token = await getCurrentUserWithRole()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'STAFF') return forbidden()

    const url = new URL(req.url)
    const status = url.searchParams.get('status') as InvoiceStatus | null
    const invoices = await prisma.invoice.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { customer: true, hewan: true, approvedBy: true, printedBy: true, items: true },
    })

    return NextResponse.json({ data: invoices })
  } catch (error) {
    logError(error, { fileName: 'invoice/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error fetching invoices' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const token = await getCurrentUserWithRole()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'STAFF') return forbidden()

    const body = await req.json()
    const parsed = invoiceCreateSchema.parse(body)
    const total = parsed.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

    if (parsed.total !== undefined && parsed.total !== total) {
      return NextResponse.json({ message: 'Total tidak sesuai dengan jumlah item' }, { status: 400 })
    }

    const created = await prisma.invoice.create({
      data: {
        invoiceNumber: await generateInvoiceNumber(),
        customerId: parsed.customerId,
        hewanId: parsed.hewanId ?? null,
        total,
        status: 'DRAFT',
        items: {
          create: parsed.items.map((item) => ({
            inventoryId: item.inventoryId,
            namaItem: item.namaItem,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subTotal: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    logError(error, { fileName: 'invoice/route.ts', functionName: 'POST' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
  }
}
