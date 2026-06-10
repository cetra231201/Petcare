import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { forbidden, getCurrentUserWithRole, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'
const voidSchema = z.object({ voidReason: z.string().min(1) })

export async function PUT(req: NextRequest, context: any) {
  try {
    const token = await getCurrentUserWithRole()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN') return forbidden()

    const invoice = await prisma.invoice.findUnique({ where: { id: context.params.id }, select: { status: true } })
    if (!invoice) return notFound()
    if (invoice.status === 'VOID' || invoice.status === 'PRINTED') return NextResponse.json({ message: 'Invoice cannot be voided after printing' }, { status: 400 })

    const body = await req.json()
    const parsed = voidSchema.parse(body)

    const updated = await prisma.invoice.update({
      where: { id: context.params.id },
      data: { status: 'VOID', voidReason: parsed.voidReason },
      include: { customer: true, hewan: true, approvedBy: true, printedBy: true, items: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    logError(error, { fileName: 'invoice/[id]/void/route.ts', functionName: 'PUT' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Error voiding invoice' }, { status: 400 })
  }
}
