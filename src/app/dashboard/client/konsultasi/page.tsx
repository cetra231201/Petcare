import React from 'react'
import Chat from '@/components/client/Chat'
import { auth } from '@/auth'

export default async function KonsultasiPage() {
  // server-side get session to obtain user id
  // fallback: client will fetch /api/users/me for user id
  let userId: string | undefined
  try {
    const session: any = await auth()
    userId = session?.user?.id
  } catch (e) {
    userId = undefined
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-teal-700">Konsultasi</h2>
      <p className="mt-1 text-sm text-slate-500">Chat langsung dengan klinik untuk pertanyaan atau tindak lanjut.</p>
      <div className="mt-4">
        <Chat userId={userId} />
      </div>
    </div>
  )
}
