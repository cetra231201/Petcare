import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { forbidden, getCurrentUserWithRole, notFound, unauthorized } from '@/lib/api-auth'

const db = prisma as any
const voidSchema = z.object({ voidReason: z.string().min(1) })

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getCurrentUserWithRole(req)
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN') return forbidden()

    const invoice = await db.invoice.findUnique({ where: { id: params.id }, select: { status: true } })
    if (!invoice) return notFound()
    if (invoice.status === 'VOID') return NextResponse.json({ message: 'Invoice already voided' }, { status: 400 })

    const body = await req.json()
    const parsed = voidSchema.parse(body)

    const updated = await db.invoice.update({
      where: { id: params.id },
      data: { status: 'VOID', voidReason: parsed.voidReason },
      include: { customer: true, hewan: true, approvedBy: true, printedBy: true, items: true },
    })

    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Error voiding invoice' }, { status: 400 })
  }
}
