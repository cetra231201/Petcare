import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { normalizeRole } from '@/lib/api-auth'

const LOGIN_PATH = '/login'

export default auth((req) => {
  const pathname = new URL(req.url).pathname

  // Bypass auth for health check and auth routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/auth') || pathname.startsWith('/api/health')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/dashboard')) {
    if (!req.auth) {
      return NextResponse.redirect(new URL(LOGIN_PATH, req.url))
    }

    const role = normalizeRole((req.auth.user as any)?.role as string | undefined)
    if (pathname.startsWith('/dashboard/pelanggan') && role !== 'CLIENT') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/dokter') && role !== 'DOKTER') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/staff') && role !== 'STAFF') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  if (pathname === LOGIN_PATH && req.auth) {
    const role = normalizeRole((req.auth.user as any)?.role as string | undefined)
    const dest = role === 'ADMIN' ? '/dashboard/admin' : role === 'DOKTER' ? '/dashboard/dokter' : role === 'STAFF' ? '/dashboard/staff' : '/dashboard/pelanggan'
    return NextResponse.redirect(new URL(dest, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
