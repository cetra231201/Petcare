import { getApiToken, getTokenUserId, notFound, unauthorized, forbidden } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateHewanCardDocument, createPdfBufferFromDocument } from '@/lib/pdf'
import { logError } from '@/lib/error-logging'

export async function GET(req: NextRequest, context: any) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()

    const { id } = context.params
    const hewan = await prisma.hewan.findUnique({ where: { id }, include: { pelanggan: true } })
    if (!hewan) return notFound()

    const userId = getTokenUserId(token)
    if (token.role !== 'ADMIN' && hewan.pelangganId !== userId) return forbidden()

    const doc = generateHewanCardDocument(hewan, hewan.pelanggan)
    
    try {
      const buffer = await createPdfBufferFromDocument(doc)
      const filename = `kartu-${hewan.nama.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
      return new Response(buffer as any, { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        } 
      })
    } catch (pdfError) {
      logError(pdfError, { fileName: 'hewan/[id]/pdf/route.ts', functionName: 'GET', additionalContext: { context: 'PDF generation failed' } })
      return NextResponse.json({ message: 'Failed to generate PDF' }, { status: 500 })
    }
  } catch (error) {
    logError(error, { fileName: 'hewan/[id]/pdf/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error generating PDF' }, { status: 500 })
  }
}
