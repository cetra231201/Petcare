import { NextResponse } from 'next/server'
import { getApiToken, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  const token = await getApiToken()
  if (!token) return unauthorized()
  return NextResponse.json({ user: { id: token.id, name: token.name, email: token.email, role: token.role, avatar: token.avatar } })
}
