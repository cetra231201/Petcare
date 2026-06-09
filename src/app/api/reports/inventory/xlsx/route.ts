import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import { forbidden, getApiToken, unauthorized } from '@/lib/api-auth'
import { logError } from '@/lib/error-logging'

/**
 * SECURITY NOTE: The xlsx package (v0.18.5) used here has known vulnerabilities.
 * TODO: Upgrade to exceljs or another actively maintained package for production.
 */

export async function GET(req: Request) {
  const token = await getApiToken()
  if (!token) return unauthorized()
  
  // Strict permission check: only ADMIN and STAFF can export
  if (token.role !== 'ADMIN' && token.role !== 'STAFF') return forbidden()

  try {
    const items = await prisma.inventory.findMany()
    const wsData = [
      ['Nama Item','Kategori','Stok','Satuan','Harga','Stok Minimal'],
      ...items.map(i => [i.namaItem, i.kategori, i.stok, i.satuan, i.harga, i.stokMinimal])
    ]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory')
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })
    
    const filename = `inventory-${new Date().toISOString().split('T')[0]}.xlsx`
    return new Response(buf, { 
      headers: { 
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      } 
    })
  } catch (error) {
    logError(error, { fileName: 'reports/inventory/xlsx/route.ts', functionName: 'GET' })
    return NextResponse.json({ message: 'Error exporting xlsx' }, { status: 500 })
  }
}
