import React from 'react'
import prisma from '@/lib/prisma'

export default async function HewanDetail({ params }: any) {
  const hewan = await prisma.hewan.findUnique({ where: { id: params.id }, include: { pelanggan: true } })
  if (!hewan) return <div>Not found</div>

  return (
    <div>
      <h2 className="text-2xl font-semibold text-teal-700">{hewan.nama}</h2>
      <div className="mt-4 bg-white p-4 rounded shadow max-w-md">
        <div>Jenis: {hewan.jenis}</div>
        <div>Ras: {hewan.ras}</div>
        <div>Tanggal Lahir: {hewan.tanggalLahir ? new Date(hewan.tanggalLahir).toLocaleDateString() : '-'}</div>
        <div>Berat: {hewan.beratBadan ?? '-'}</div>
        <div className="mt-4">
          <a className="px-3 py-2 bg-teal-600 text-white rounded" href={`/api/hewan/${hewan.id}/pdf`}>Download Kartu PDF</a>
        </div>
      </div>
    </div>
  )
}
