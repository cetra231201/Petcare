import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { forbidden, getApiToken, getTokenUserId, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

const createSchema = z.object({ dokterId: z.string(), hari: z.enum(['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU']), jamMulai: z.string(), jamSelesai: z.string(), isAktif: z.boolean().optional() })

export async function GET(req: Request) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const url = new URL(req.url)
    const dokterId = url.searchParams.get('dokterId')
    const where: Prisma.JadwalDokterWhereInput = {}

    if (token.role === 'ADMIN') {
      if (dokterId) where.dokterId = dokterId
    } else if (token.role === 'DOKTER') {
      if (dokterId && dokterId !== getTokenUserId(token)) return forbidden()
      where.dokterId = getTokenUserId(token)
    } else {
      return forbidden()
    }

    const data = await prisma.jadwalDokter.findMany({ where })
    return NextResponse.json({ data })
  } catch (error) {
    logError(error, { fileName: 'jadwal/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error fetching jadwal' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && token.role !== 'DOKTER') return forbidden()

    const body = await req.json()
    const parsed = createSchema.parse(body)
    if (token.role === 'DOKTER') {
      if (!parsed.dokterId || parsed.dokterId !== getTokenUserId(token)) return forbidden()
    }

    const created = await prisma.jadwalDokter.create({ data: parsed })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    logError(error, { fileName: 'jadwal/route.ts', functionName: 'POST' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
  }
}
