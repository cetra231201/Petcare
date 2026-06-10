import EventEmitter from 'eventemitter3'

export interface SSEAdapter {
  publish(event: SSEEvent): void
  subscribe(type: string, cb: (payload: unknown) => void): () => void
}

type SSEEvent = {
  type: string
  payload: unknown
}

/**
 * WARNING: In-memory SSE is not compatible with multi-instance or horizontally scaled deployments.
 * Replace this adapter with a distributed implementation (Redis, Pub/Sub, etc.) before scaling.
 */
export class InMemorySSEAdapter implements SSEAdapter {
  private emitter = new EventEmitter()

  constructor() {
    // EventEmitter3 does not support setMaxListeners; keep default behavior.
  }

  publish(event: SSEEvent) {
    this.emitter.emit(event.type, event.payload)
  }

  subscribe(type: string, cb: (payload: unknown) => void) {
    this.emitter.on(type, cb)
    return () => this.emitter.off(type, cb)
  }
}

export const sseService: SSEAdapter = new InMemorySSEAdapter()
