import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import type { ApiToken, ApiRole, CurrentUser, CurrentUserWithName } from '@/types'
import { logError } from './error-logging'

export const API_ROLES = ['ADMIN', 'STAFF', 'DOKTER', 'CLIENT'] as const

export async function getApiToken(): Promise<ApiToken | null> {
  try {
    const session = await auth()
    if (!session?.user) return null

    const sessionUser = session.user as unknown as Record<string, unknown>
    const role = normalizeRole(sessionUser.role as string | null)
    if (!role) return null

    return {
      id: session.user.id as string,
      role,
      name: session.user.name ?? undefined,
      email: session.user.email ?? undefined,
      avatar: (sessionUser.avatar as string | undefined) ?? undefined,
    }
  } catch (error) {
    logError(error, {
      fileName: 'api-auth.ts',
      functionName: 'getApiToken',
    })
    return null
  }
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await getApiToken()
  if (!token || !token.id || !token.role || !token.email) return null
  return {
    id: token.id,
    role: token.role,
    email: token.email,
  }
}

export async function getCurrentUserWithRole(): Promise<CurrentUserWithName | null> {
  const token = await getApiToken()
  if (!token || !token.id || !token.role) return null
  return {
    id: getTokenUserId(token),
    role: token.role,
    name: token.name,
    email: token.email,
    avatar: token.avatar,
  }
}

export function getTokenUserId(token: ApiToken | null): string {
  return token?.id || token?.sub || ''
}

export function normalizeRole(role?: string | null): ApiRole | undefined {
  if (!role) return undefined
  if (API_ROLES.includes(role as ApiRole)) return role as ApiRole
  return undefined
}

export function assertRole(token: ApiToken | null, expectedRoles: ApiRole[]): token is ApiToken {
  return Boolean(token && token.role && expectedRoles.includes(token.role))
}

export function unauthorized(message = 'Unauthorized'): NextResponse {
  return NextResponse.json({ message }, { status: 401 })
}

export function forbidden(message = 'Forbidden'): NextResponse {
  return NextResponse.json({ message }, { status: 403 })
}

export function notFound(message = 'Not found'): NextResponse {
  return NextResponse.json({ message }, { status: 404 })
}