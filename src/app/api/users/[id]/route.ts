import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { forbidden, getCurrentUserWithRole, getTokenUserId, notFound, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

const updateSchema = z.object({
  name: z.string().trim().optional(),
  email: z.string().email().transform(e => e.toLowerCase()).optional(),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'STAFF', 'DOKTER', 'CLIENT']).optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional(),
})

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getCurrentUserWithRole()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && getTokenUserId(token) !== params.id) return forbidden()

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!user) return notFound()
    return NextResponse.json(user)
  } catch (error) {
    logError(error, { fileName: 'users/[id]/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error fetching user' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getCurrentUserWithRole()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN' && getTokenUserId(token) !== params.id) return forbidden()

    const body = await req.json()
    const parsed = updateSchema.parse(body)
    
    // Get current user to check email/password constraints
    const currentUser = await prisma.user.findUnique({ where: { id: params.id } })
    if (!currentUser) return notFound()

    // If password is being set, validate it's not the same as email
    if (parsed.password) {
      const emailToCheck = parsed.email || currentUser.email
      if (parsed.password.toLowerCase() === emailToCheck.toLowerCase()) {
        return NextResponse.json(
          { message: 'Password cannot be the same as email' },
          { status: 400 }
        )
      }
    }

    const data: Record<string, unknown> = {}
    if (parsed.name !== undefined) data.name = parsed.name
    if (parsed.email !== undefined) data.email = parsed.email
    if (parsed.phone !== undefined) data.phone = parsed.phone
    if (parsed.role !== undefined && token.role === 'ADMIN') data.role = parsed.role

    if (parsed.password) {
      const salt = await bcrypt.genSalt(10)
      data.password = await bcrypt.hash(parsed.password, salt)
    }

    const updated = await prisma.user.update({ where: { id: params.id }, data })
    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: error.errors },
        { status: 400 }
      )
    }
    logError(error, { fileName: 'users/[id]/route.ts', functionName: 'PUT' })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getCurrentUserWithRole()
    if (!token) return unauthorized()
    if (token.role !== 'ADMIN') return forbidden()
    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    logError(error, { fileName: 'users/[id]/route.ts', functionName: 'DELETE' })
    return NextResponse.json({ message: 'Error deleting' }, { status: 500 })
  }
}
