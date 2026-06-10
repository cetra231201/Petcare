import { NextRequest } from 'next/server'
import { forbidden, getApiToken, getTokenUserId, notFound, unauthorized } from '@/lib/api-auth'
import prisma from '@/lib/prisma'
import { generateRekamMedisDocument, createPdfBufferFromDocument } from '@/lib/pdf'

export async function GET(req: NextRequest, context: any) {
  const token = await getApiToken()
  if (!token) return unauthorized()

  const { id } = context.params
  const rekam = await prisma.rekamMedis.findUnique({ where: { id }, include: { dokter: true, hewan: true } })
  if (!rekam) return notFound()

  const userId = getTokenUserId(token)
  if (token.role !== 'ADMIN' && token.role !== 'DOKTER' && rekam.hewan.pelangganId !== userId) return forbidden()
  if (token.role === 'DOKTER' && rekam.dokterId !== userId) return forbidden()

  const doc = generateRekamMedisDocument(rekam)
  const buffer = await createPdfBufferFromDocument(doc)

  return new Response(buffer as any, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="rekam-${rekam.id}.pdf"`,
    },
  })
}
