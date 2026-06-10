import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getApiToken, forbidden, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

export async function GET(req: Request, context: any) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'STAFF' && token.role !== 'DOKTER') return forbidden()

    const service = await prisma.service.findUnique({ where: { id: context.params.id } })
    if (!service) return notFound()

    return NextResponse.json(service)
  } catch (error) {
    logError(error, { fileName: 'service/[id]/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error fetching service' }, { status: 500 })
  }
}
