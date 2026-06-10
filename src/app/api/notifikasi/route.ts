import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { forbidden, getApiToken, getTokenUserId, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'
import { notificationBroadcastSchema } from '@/lib/validation/schemas'

export async function GET(req: Request) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const url = new URL(req.url)
    const requestedUserId = url.searchParams.get('userId')
    const targetUserId = token.role === 'ADMIN' && requestedUserId ? requestedUserId : getTokenUserId(token)
    if (!targetUserId) return unauthorized()
    if (token.role !== 'ADMIN' && requestedUserId && requestedUserId !== targetUserId) return forbidden()

    const data = await prisma.notifikasi.findMany({ where: { userId: targetUserId }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ data })
  } catch (error) {
    logError(error, { fileName: 'notifikasi/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error fetching notifications' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN') return forbidden()

    const body = await req.json()
    const parsed = notificationBroadcastSchema.parse(body)
    // simple broadcast to all users for demo
    const users = await prisma.user.findMany()
    const creates = users.map((u) => ({ userId: u.id, judul: parsed.judul, isi: parsed.isi, tipe: parsed.tipe }))
    await prisma.notifikasi.createMany({ data: creates })
    return NextResponse.json({ message: 'Broadcast sent' })
  } catch (error) {
    logError(error, { fileName: 'notifikasi/route.ts', functionName: 'POST' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
  }
}
