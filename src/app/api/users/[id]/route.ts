import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { forbidden, getCurrentUserWithRole, getTokenUserId, notFound, unauthorized } from '@/lib/api-auth'

const updateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'STAFF', 'DOKTER', 'CLIENT']).optional(),
  password: z.string().min(6).optional(),
})

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getCurrentUserWithRole(_)
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && getTokenUserId(token) !== params.id) return forbidden()

    const user = await prisma.user.findUnique({ where: { id: params.id } })
    if (!user) return notFound()
    return NextResponse.json(user)
  } catch (err) {
    return NextResponse.json({ message: 'Error fetching user' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getCurrentUserWithRole(req)
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && getTokenUserId(token) !== params.id) return forbidden()

    const body = await req.json()
    const parsed = updateSchema.parse(body)
    const data: any = { ...parsed }

    if (parsed.password) {
      const salt = await bcrypt.genSalt(10)
      data.password = await bcrypt.hash(parsed.password, salt)
    }

    const updated = await prisma.user.update({ where: { id: params.id }, data })
    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Invalid input' }, { status: 400 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getCurrentUserWithRole(_)
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN') return forbidden()
    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (err) {
    return NextResponse.json({ message: 'Error deleting' }, { status: 500 })
  }
}
