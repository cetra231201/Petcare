import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getApiToken, forbidden, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'
import { serviceCreateSchema } from '@/lib/validation/schemas'

export async function GET(req: Request) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'STAFF' && token.role !== 'DOKTER') return forbidden()

    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { nama: 'asc' },
    })

    return NextResponse.json({ data: services })
  } catch (error) {
    logError(error, { fileName: 'service/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error fetching services' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'STAFF') return forbidden()

    const body = await req.json()
    const parsed = serviceCreateSchema.parse(body)

    const created = await prisma.service.create({
      data: {
        nama: parsed.nama,
        deskripsi: parsed.deskripsi ?? null,
        harga: parsed.harga,
        kategori: parsed.kategori ?? null,
        isActive: parsed.isActive,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    logError(error, { fileName: 'service/route.ts', functionName: 'POST' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
  }
}
