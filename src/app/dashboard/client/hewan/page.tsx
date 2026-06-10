"use client"

import React from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useHewan, useCreateHewan } from '@/hooks/useHewan'
import HewanForm from '@/components/client/HewanForm'
import { toast } from '@/components/shared/Toast'

export default function HewanPage() {
  const { data: session, status } = useSession()
  const userId = (session?.user as any)?.id
  const { data, isLoading } = useHewan(1, 20, userId)
  const create = useCreateHewan()

  if (status === 'loading') return <div>Memuat...</div>
  if (isLoading) return <div>Loading...</div>
  const hewan = data?.data || []

  const handleCreate = async (vals: any) => {
    try {
      await create.mutateAsync(vals)
      toast('Hewan berhasil ditambahkan')
    } catch (e: any) {
      toast(e.message || 'Gagal menambahkan hewan')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-teal-700">Hewan Peliharaan</h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {hewan.length === 0 ? (
          <div className="bg-white p-4 rounded shadow">Belum ada hewan terdaftar.</div>
        ) : (
          hewan.map((h: any) => (
            <div key={h.id} className="bg-white p-4 rounded shadow">
              <div className="text-lg font-medium">{h.nama}</div>
              <div className="text-sm text-gray-500">{h.jenis} • {h.ras || '-'}</div>
              <div className="mt-3 space-x-2">
                <Link href={`/dashboard/client/hewan/${h.id}`} className="text-teal-600 hover:underline">Detail</Link>
                <Link href={`/dashboard/client/hewan/${h.id}/rekam-medis`} className="text-teal-600 hover:underline">Rekam Medis</Link>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow max-w-md">
        <h3 className="text-lg font-medium">Tambah Hewan</h3>
        <HewanForm onSubmit={handleCreate} />
      </div>
    </div>
  )
}
