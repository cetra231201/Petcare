import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { normalizeRole } from '@/lib/api-auth'

const LOGIN_PATH = '/login'

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public assets and auth routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/auth')) return NextResponse.next()

  // redirect unauthenticated users from dashboard
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = LOGIN_PATH
      return NextResponse.redirect(url)
    }

    // role guard
    const role = normalizeRole((token as any).role as string | undefined)
    if (pathname.startsWith('/dashboard/pelanggan') && role !== 'CLIENT') {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    }
    if (pathname.startsWith('/dashboard/dokter') && role !== 'DOKTER') {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    }
    if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    }
    if (pathname.startsWith('/dashboard/staff') && role !== 'STAFF') {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    }
  }

  // redirect logged-in users away from /login to their dashboard
  if (pathname === LOGIN_PATH) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (token) {
      const role = normalizeRole((token as any).role as string | undefined)
      const dest = role === 'ADMIN' ? '/dashboard/admin' : role === 'DOKTER' ? '/dashboard/dokter' : role === 'STAFF' ? '/dashboard/staff' : '/dashboard/pelanggan'
      const url = req.nextUrl.clone()
      url.pathname = dest
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
