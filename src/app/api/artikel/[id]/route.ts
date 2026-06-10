import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getApiToken, forbidden, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'
import { artikelUpdateSchema } from '@/lib/validation/schemas'

const updateSchema = artikelUpdateSchema

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET(req: NextRequest, context: any) {
  try {
    const article = await prisma.artikel.findUnique({ where: { id: context.params.id } })
    if (!article || !article.isPublished) return notFound()
    return NextResponse.json(article)
  } catch (error) {
    logError(error, { fileName: 'artikel/[id]/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error fetching article' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: any) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN') return forbidden()

    const body = await req.json()
    const parsed = updateSchema.parse(body)
    const data: Record<string, unknown> = { ...parsed }

    if (parsed.slug) {
      const existing = await prisma.artikel.findFirst({ where: { slug: parsed.slug, NOT: { id: context.params.id } } })
      if (existing) return NextResponse.json({ message: 'Slug already in use' }, { status: 400 })
    } else if (parsed.judul) {
      data.slug = slugify(parsed.judul)
    }

    const updated = await prisma.artikel.update({ where: { id: context.params.id }, data })
    return NextResponse.json(updated)
  } catch (error) {
    logError(error, { fileName: 'artikel/[id]/route.ts', functionName: 'PUT' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN') return forbidden()

    await prisma.artikel.delete({ where: { id: context.params.id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    logError(error, { fileName: 'artikel/[id]/route.ts', functionName: 'DELETE' })
    return NextResponse.json({ message: 'Error deleting article' }, { status: 500 })
  }
}
