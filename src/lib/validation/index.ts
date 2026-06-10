import { NextResponse } from 'next/server'
import { ZodError, ZodType } from 'zod'

export function parseRequestBody<T>(body: unknown, schema: ZodType<T>): T {
  return schema.parse(body)
}

export function zodErrorResponse(error: unknown, message = 'Invalid input') {
  if (error instanceof ZodError) {
    return NextResponse.json({ message, details: error.errors }, { status: 400 })
  }
  return NextResponse.json({ message: error instanceof Error ? error.message : 'Invalid input' }, { status: 400 })
}
