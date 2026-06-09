import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { forbidden, getCurrentUserWithRole, notFound, unauthorized } from '@/lib/api-auth'

const db = prisma as any

const updateSchema = z.object({
  customerId: z.string().optional(),
  hewanId: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL']).optional(),
  items: z.array(z.object({
    inventoryId: z.string().optional(),
    namaItem: z.string().min(1),
    quantity: z.coerce.number().int().min(1),
    unitPrice: z.coerce.number().min(0),
  })).optional(),
})

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getCurrentUserWithRole(req)
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'STAFF') return forbidden()

    const invoice = await db.invoice.findUnique({
      where: { id: params.id },
      include: { customer: true, hewan: true, approvedBy: true, printedBy: true, items: true },
    })
    if (!invoice) return notFound()

    return NextResponse.json(invoice)
  } catch (err) {
    return NextResponse.json({ message: 'Error fetching invoice' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getCurrentUserWithRole(req)
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'STAFF') return forbidden()

    const invoice = await prisma.invoice.findUnique({ where: { id: params.id }, select: { status: true } })
    if (!invoice) return notFound()
    if (invoice.status === 'PRINTED' || invoice.status === 'VOID') return forbidden('Invoice locked after printing or void')

    const body = await req.json()
    const parsed = updateSchema.parse(body)
    const data: any = {}

    if (parsed.customerId) data.customerId = parsed.customerId
    if (parsed.hewanId !== undefined) data.hewanId = parsed.hewanId
    if (parsed.status) data.status = parsed.status

    if (parsed.items) {
      const total = parsed.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      data.total = total
      data.items = {
        deleteMany: {},
        create: parsed.items.map((item) => ({
          inventoryId: item.inventoryId,
          namaItem: item.namaItem,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subTotal: item.quantity * item.unitPrice,
        })),
      }
    }

    const updated = await db.invoice.update({
      where: { id: params.id },
      data,
      include: { items: true },
    })

    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Invalid input' }, { status: 400 })
  }
}
