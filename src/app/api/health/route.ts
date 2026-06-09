import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logError } from '@/lib/error-logging'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`
    
    // Get version from package.json
    const packageJson = await import('@/../../package.json', { with: { type: 'json' } }).then(m => m.default).catch(() => ({ version: 'unknown' }))
    
    const response = {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      version: packageJson.version,
      database: 'connected' as const,
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
    }
    
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    logError(error, { fileName: 'health/route.ts', functionName: 'GET' })
    
    const response = {
      status: 'error' as const,
      timestamp: new Date().toISOString(),
      database: 'error' as const,
      uptime: process.uptime(),
      message: 'Database connectivity check failed',
    }
    
    return NextResponse.json(response, { status: 503 })
  }
}
