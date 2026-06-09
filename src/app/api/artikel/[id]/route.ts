import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getApiToken, forbidden, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

const updateSchema = z.object({
  judul: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  konten: z.string().min(1).optional(),
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

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const article = await prisma.artikel.findUnique({ where: { id: params.id } })
    if (!article || !article.isPublished) return notFound()
    return NextResponse.json(article)
  } catch (error) {
    logError(error, { fileName: 'artikel/[id]/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error fetching article' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN') return forbidden()

    const body = await req.json()
    const parsed = updateSchema.parse(body)
    const data: Record<string, unknown> = { ...parsed }

    if (parsed.slug) {
      const existing = await prisma.artikel.findFirst({ where: { slug: parsed.slug, NOT: { id: params.id } } })
      if (existing) return NextResponse.json({ message: 'Slug already in use' }, { status: 400 })
    } else if (parsed.judul) {
      data.slug = slugify(parsed.judul)
    }

    const updated = await prisma.artikel.update({ where: { id: params.id }, data })
    return NextResponse.json(updated)
  } catch (error) {
    logError(error, { fileName: 'artikel/[id]/route.ts', functionName: 'PUT' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getApiToken(_)
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN') return forbidden()

    await prisma.artikel.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    logError(error, { fileName: 'artikel/[id]/route.ts', functionName: 'DELETE' })
    return NextResponse.json({ message: 'Error deleting article' }, { status: 500 })
  }
}
