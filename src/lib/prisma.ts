import { PrismaClient } from '@prisma/client'
import { validateEnv } from './env'

// Validate environment variables on startup
validateEnv()

declare global {
  // eslint-disable-next-line
  var prisma: PrismaClient | undefined
}

const logConfig = process.env.NODE_ENV === 'production' 
  ? ['error', 'warn']
  : ['query', 'error', 'warn']

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: logConfig as Array<'query' | 'error' | 'warn'>,
  })
}

export const prisma = 
  global.prisma ?? 
  createPrismaClient().$extends({
    result: {
      // Add any custom extensions here if needed
    },
  })

// Only cache the Prisma instance in development to avoid connection pool exhaustion
// during Next.js hot reload in production
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma as PrismaClient
}

export default prisma
