import { NextResponse } from 'next/server'

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'SMTP_HOST',
]

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  const envCheck = REQUIRED_ENV_VARS.map(varName => ({
    name: varName,
    set: Boolean(process.env[varName]),
  }))

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    requiredVariables: envCheck,
    allVariablesSet: envCheck.every(v => v.set),
  })
}
