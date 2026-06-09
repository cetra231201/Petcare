import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { forbidden, getApiToken, getTokenUserId, unauthorized } from '@/lib/api-auth'

const createSchema = z.object({
  nama: z.string(),
  jenis: z.string(),
  ras: z.string().optional(),
  tanggalLahir: z.string().optional(),
  beratBadan: z.number().optional(),
  foto: z.string().optional(),
  catatanKhusus: z.string().optional(),
  pelangganId: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const token = await getApiToken(req)
    if (!token) return unauthorized()

    const userId = getTokenUserId(token)
    const role = token.role
    const url = new URL(req.url)
    const page = Number(url.searchParams.get('page') || '1')
    const limit = Number(url.searchParams.get('limit') || '10')
    const pelangganId = url.searchParams.get('pelangganId')
    const skip = (page - 1) * limit
    let where: { pelangganId?: string } | undefined

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
    return NextResponse.json({ data, meta: { page, limit, total: count } })
  } catch (err) {
    return NextResponse.json({ message: 'Error fetching hewan' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const token = await getApiToken(req)
    if (!token) return unauthorized()

    const userId = getTokenUserId(token)
    const role = token.role
    if (!userId) return unauthorized()

    const body = await req.json()
    const parsed = createSchema.parse(body)
    if (role === 'CLIENT') parsed.pelangganId = userId
    if (!parsed.pelangganId) return NextResponse.json({ message: 'pelangganId is required' }, { status: 400 })
    if (role === 'CLIENT' && parsed.pelangganId !== userId) return forbidden()
    const created = await prisma.hewan.create({ data: parsed as any })
    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Invalid input' }, { status: 400 })
  }
}
