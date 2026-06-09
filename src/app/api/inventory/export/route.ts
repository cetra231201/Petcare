import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { forbidden, getApiToken, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

/**
 * SECURITY NOTE: The xlsx package (v0.18.5) used here has known vulnerabilities.
 * TODO: Upgrade to exceljs or another actively maintained package.
 * For now, ensure strict permission checks and input validation below.
 */

export async function GET(req: Request) {
  try {
    const token = await getApiToken()
    if (!token) return unauthorized()
    
    // Strict permission check: only ADMIN and STAFF can export
    if (token.role !== 'ADMIN' && token.role !== 'STAFF') return forbidden()

    const items = await prisma.inventory.findMany()
    const header = ['Nama Item','Kategori','Stok','Satuan','Harga','Stok Minimal']
    const rows = items.map(i => [i.namaItem, i.kategori, String(i.stok), i.satuan, String(i.harga), String(i.stokMinimal)])
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
    
    const filename = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`
    return new Response(csv, { 
      headers: { 
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      } 
    })
  } catch (error) {
    logError(error, { fileName: 'inventory/export/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error exporting' }, { status: 500 })
  }
}
