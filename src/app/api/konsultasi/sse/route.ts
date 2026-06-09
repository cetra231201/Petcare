import { sseService } from '../../../../lib/sse'
import { getApiToken, getTokenUserId, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  const token = await getApiToken()
  if (!token) return unauthorized()

  const url = new URL(req.url)
  const requestedUserId = url.searchParams.get('userId')
  if (requestedUserId === 'global' && token.role !== 'ADMIN') return unauthorized()

  const userId = requestedUserId === 'global' ? 'global' : getTokenUserId(token)

  let controller: ReadableStreamDefaultController | null = null
  const cleanupFns: Array<() => void> = []
  let closed = false

  const cleanup = () => {
    if (closed) return
    closed = true
    cleanupFns.forEach((fn) => fn())
    if (controller) {
      try {
        controller.close()
      } catch {}
    }
  }

  const stream = new ReadableStream({
    start(c) {
      controller = c
      const channel = userId === 'global' ? 'message:global' : `message:${userId}`
      
      // Subscribe to messages
      const unsubscribe = sseService.subscribe(channel, (payload) => {
        try {
          controller?.enqueue(encodeEvent({ event: 'message', data: payload }))
        } catch {}
      })
      cleanupFns.push(unsubscribe)

      // Keep-alive ping every 20 seconds
      const keepAlive = setInterval(() => {
        try {
          controller?.enqueue(encodeEvent({ event: 'ping', data: { t: Date.now() } }))
        } catch {}
      }, 20000)
      cleanupFns.push(() => clearInterval(keepAlive))
      
      // Connection timeout: close after 30 minutes to prevent memory leaks
      const connectionTimeout = setTimeout(() => {
        cleanup()
      }, 30 * 60 * 1000) // 30 minutes
      cleanupFns.push(() => clearTimeout(connectionTimeout))
    },
    cancel() {
      cleanup()
    },
  })

  // Cleanup on client disconnect
  req.signal.addEventListener('abort', cleanup, { once: true })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
    },
  })
}

function encodeEvent(event: { event?: string; data: unknown }) {
  const lines: string[] = []
  if (event.event) lines.push(`event: ${event.event}`)
  const payload = typeof event.data === 'string' ? event.data : JSON.stringify(event.data)
  payload.split('\n').forEach((line) => lines.push(`data: ${line}`))
  lines.push('\n')
  return new TextEncoder().encode(lines.join('\n'))
}
