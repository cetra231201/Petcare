import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { forbidden, getApiToken, getTokenUserId, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'
import type { ApiPaginatedResponse, HewanCreateInput } from '@/types'

const createSchema = z.object({
  nama: z.string(),
  jenis: z.enum(['KUCING', 'ANJING', 'BURUNG', 'KELINCI', 'LAINNYA']),
  ras: z.string().optional(),
  tanggalLahir: z.string().optional(),
  beratBadan: z.number().optional(),
  foto: z.string().optional(),
  catatanKhusus: z.string().optional(),
  pelangganId: z.string().optional(),
})

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const userId = getTokenUserId(token)
    const role = token.role
    const url = new URL(req.url)
    const page = Number(url.searchParams.get('page') || '1')
    const limit = Number(url.searchParams.get('limit') || '10')
    const pelangganId = url.searchParams.get('pelangganId')
    const skip = (page - 1) * limit

    interface WhereClause {
      pelangganId?: string
    }
    let where: WhereClause | undefined

    if (role === 'ADMIN' || role === 'DOKTER' || role === 'STAFF') {
      where = pelangganId ? { pelangganId } : undefined
    } else {
      if (pelangganId && pelangganId !== userId) return forbidden()
      where = { pelangganId: userId }
    }

    const [data, count] = await Promise.all([
      prisma.hewan.findMany({ where, skip, take: limit }),
      where ? prisma.hewan.count({ where }) : prisma.hewan.count(),
    ])

    const response: ApiPaginatedResponse = { data, meta: { page, limit, total: count } }
    return NextResponse.json(response)
  } catch (error) {
    logError(error, {
      fileName: 'hewan/route.ts',
      functionName: 'GET',
    })
    return NextResponse.json({ message: 'Error fetching hewan' }, { status: 500 })
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const userId = getTokenUserId(token)
    const role = token.role
    if (!userId) return unauthorized()

    const body = await req.json()
    const parsed = createSchema.parse(body)
    if (role === 'CLIENT') parsed.pelangganId = userId
    if (!parsed.pelangganId) return NextResponse.json({ message: 'pelangganId is required' }, { status: 400 })
    if (role === 'CLIENT' && parsed.pelangganId !== userId) return forbidden()

    const createData: HewanCreateInput = {
      nama: parsed.nama,
      jenis: parsed.jenis,
      ras: parsed.ras ?? null,
      tanggalLahir: parsed.tanggalLahir ? new Date(parsed.tanggalLahir) : null,
      beratBadan: parsed.beratBadan ?? null,
      foto: parsed.foto ?? null,
      catatanKhusus: parsed.catatanKhusus ?? null,
      pelangganId: parsed.pelangganId,
    }

    const created = await prisma.hewan.create({ data: createData as any })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    logError(error, {
      fileName: 'hewan/route.ts',
      functionName: 'POST',
    })
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', details: error.errors }, { status: 400 })
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to create hewan'
    return NextResponse.json({ message: errorMessage }, { status: 400 })
  }
}
