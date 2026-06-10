import React from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import RekamMedisClient from '@/components/client/RekamMedisClient'

export default async function RekamMedisPage({ params }: any) {
  const session = await auth()
  if (!session) redirect('/dashboard')
  const currentUserId = (session.user as any)?.id as string

  const hewan = await prisma.hewan.findUnique({ where: { id: params.id }, include: { pelanggan: true } })
  if (!hewan) return <div>Not found</div>
  if (hewan.pelangganId !== currentUserId) redirect('/dashboard')

  return (
    <div>
      <h2 className="text-2xl font-semibold text-teal-700">Rekam Medis - {hewan.nama}</h2>
      <div className="mt-4">
        <RekamMedisClient hewanId={hewan.id} />
      </div>
    </div>
  )
}
