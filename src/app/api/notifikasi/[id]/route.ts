import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { forbidden, getApiToken, getTokenUserId, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'
import { notificationUpdateSchema } from '@/lib/validation/schemas'

const updateSchema = notificationUpdateSchema

export async function PATCH(req: NextRequest, context: any) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const item = await prisma.notifikasi.findUnique({ where: { id: context.params.id }, select: { userId: true } })
    if (!item) return notFound('Notification not found')

    const userId = getTokenUserId(token)
    if (token.role !== 'ADMIN' && item.userId !== userId) return forbidden()

    const body = await req.json()
    const parsed = updateSchema.parse(body)
    const updated = await prisma.notifikasi.update({
      where: { id: context.params.id },
      data: { isRead: parsed.isRead },
    })
    return NextResponse.json(updated)
  } catch (error) {
    logError(error, { fileName: 'notifikasi/[id]/route.ts', functionName: 'PATCH' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Error updating notification' }, { status: 400 })
  }
}
