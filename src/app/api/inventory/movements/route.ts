import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { forbidden, getApiToken, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

export async function GET(req: Request) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'STAFF') return forbidden()

    const url = new URL(req.url)
    const inventoryId = url.searchParams.get('inventoryId')
    const where = inventoryId ? { inventoryId } : undefined

    const movements = await prisma.inventoryMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { inventory: true, user: true },
    })

    return NextResponse.json({ data: movements })
  } catch (error) {
    logError(error, { fileName: 'inventory/movements/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error fetching inventory movements' }, { status: 500 })
  }
}
