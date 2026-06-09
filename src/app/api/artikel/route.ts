import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getApiToken, forbidden, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

const artikelSchema = z.object({
  judul: z.string().min(1),
  slug: z.string().min(1).optional(),
  konten: z.string().min(1),
  thumbnail: z.string().url().optional(),
  isPublished: z.boolean().optional(),
})

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET() {
  try {
    const articles = await prisma.artikel.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: articles })
  } catch (error) {
    logError(error, { fileName: 'artikel/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error fetching articles' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN') return forbidden()

    const body = await req.json()
    const parsed = artikelSchema.parse(body)
    const slug = parsed.slug?.trim() || slugify(parsed.judul)

    const existing = await prisma.artikel.findUnique({ where: { slug } })
    if (existing) return NextResponse.json({ message: 'Slug already in use' }, { status: 400 })

    const created = await prisma.artikel.create({
      data: {
        judul: parsed.judul,
        slug,
        konten: parsed.konten,
        thumbnail: parsed.thumbnail,
        isPublished: parsed.isPublished ?? false,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    logError(error, { fileName: 'artikel/route.ts', functionName: 'POST' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
  }
}
