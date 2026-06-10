import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { prisma } from '@/lib/prisma'
import { forbidden, getApiToken, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'
import { inventoryCreateSchema } from '@/lib/validation/schemas'
import type { ApiPaginatedResponse, InventoryCreateInput } from '@/types'

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'STAFF') return forbidden()

    const url = new URL(req.url)
    const all = url.searchParams.get('all') === 'true'
    if (all) {
      const data = await prisma.inventory.findMany({ orderBy: { updatedAt: 'desc' } })
      return NextResponse.json({ data })
    }

    const page = Number(url.searchParams.get('page') || '1')
    const limit = Number(url.searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      prisma.inventory.findMany({ skip, take: limit, orderBy: { updatedAt: 'desc' } }),
      prisma.inventory.count(),
    ])

    const response: ApiPaginatedResponse = { data, meta: { page, limit, total } }
    return NextResponse.json(response)
  } catch (error) {
    logError(error, {
      fileName: 'inventory/route.ts',
      functionName: 'GET',
    })
    return NextResponse.json({ message: 'Error fetching inventory' }, { status: 500 })
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'STAFF') return forbidden()

    const body = await req.json()
    const parsed = inventoryCreateSchema.parse(body)

    const createData: InventoryCreateInput = {
      namaItem: parsed.namaItem,
      kategori: parsed.kategori,
      stok: parsed.stok,
      satuan: parsed.satuan,
      harga: parsed.harga,
      stokMinimal: parsed.stokMinimal,
      categoryId: parsed.categoryId ?? null,
    }

    const created = await prisma.inventory.create({ data: createData })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    logError(error, {
      fileName: 'inventory/route.ts',
      functionName: 'POST',
    })
    if (error instanceof ZodError) {
      return NextResponse.json({ message: 'Invalid input', details: error.errors }, { status: 400 })
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to create inventory'
    return NextResponse.json({ message: errorMessage }, { status: 400 })
  }
}
