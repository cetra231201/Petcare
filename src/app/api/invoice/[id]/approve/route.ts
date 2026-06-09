import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { forbidden, getCurrentUserWithRole, notFound, unauthorized } from '@/lib/api-auth'

const db = prisma as any

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getCurrentUserWithRole(req)
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN') return forbidden()

    const invoice = await db.invoice.findUnique({ where: { id: params.id }, select: { status: true } })
    if (!invoice) return notFound()
    if (invoice.status === 'APPROVED' || invoice.status === 'PRINTED' || invoice.status === 'VOID') {
      return NextResponse.json({ message: 'Invoice cannot be approved' }, { status: 400 })
    }

    const updated = await db.invoice.update({
      where: { id: params.id },
      data: { status: 'APPROVED', approvedAt: new Date(), approvedById: token.id },
      include: { customer: true, hewan: true, approvedBy: true, printedBy: true, items: true },
    })

    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json({ message: 'Error approving invoice' }, { status: 500 })
  }
}
