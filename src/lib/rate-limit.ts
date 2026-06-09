type RateLimitEntry = {
  count: number
  resetAt: number
}

type RateLimitResult = {
  limited: boolean
  remaining: number
  retryAfterSeconds: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

function getClientIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || req.headers.get('x-real-ip') || 'unknown'
}

/**
 * In-memory rate limiter for single-instance deployments.
 * WARNING: This implementation is NOT suitable for multi-instance deployments (Docker Swarm, Kubernetes, etc.)
 * because each instance maintains its own in-memory store.
 *
 * TODO: Replace with a distributed rate limiter using Redis or similar for production scaling.
 * Example: use @upstash/ratelimit with Redis backend.
 */
export function checkRateLimit(req: Request, key: string, max: number, windowMs: number): RateLimitResult {
  const ip = getClientIp(req)
  
  // Handle undefined or invalid identifier
  if (!key || !ip) {
    return { limited: false, remaining: max, retryAfterSeconds: 0 }
  }
  
  const id = `${key}:${ip}`
  const now = Date.now()
  const existing = rateLimitStore.get(id)

  if (!existing || now >= existing.resetAt) {
    rateLimitStore.set(id, { count: 1, resetAt: now + windowMs })
    return { limited: false, remaining: max - 1, retryAfterSeconds: Math.ceil(windowMs / 1000) }
  }

  if (existing.count >= max) {
    return { limited: true, remaining: 0, retryAfterSeconds: Math.max(0, Math.ceil((existing.resetAt - now) / 1000)) }
  }

  existing.count += 1
  return { limited: false, remaining: max - existing.count, retryAfterSeconds: Math.max(0, Math.ceil((existing.resetAt - now) / 1000)) }
}
