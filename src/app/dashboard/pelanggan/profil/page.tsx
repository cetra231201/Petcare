import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function PelangganProfilPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'CLIENT') redirect('/dashboard')

  const userId = (session.user as any)?.id as string
  const sessionRole = (session.user as any)?.role as string | undefined
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, phone: true, role: true },
  })

  return (
    <div>
      <h2 className="text-2xl font-semibold text-teal-700">Profil</h2>
      <p className="mt-1 text-sm text-slate-500">Ringkasan akun pelanggan Anda.</p>
      <div className="mt-6 max-w-xl rounded-2xl bg-white p-5 shadow-sm border border-slate-100 space-y-3">
        <div>
          <div className="text-sm text-slate-500">Nama</div>
          <div className="font-medium text-slate-900">{profile?.name || session.user?.name || '-'}</div>
        </div>
        <div>
          <div className="text-sm text-slate-500">Email</div>
          <div className="font-medium text-slate-900">{profile?.email || session.user?.email || '-'}</div>
        </div>
        <div>
          <div className="text-sm text-slate-500">Telepon</div>
          <div className="font-medium text-slate-900">{profile?.phone || '-'}</div>
        </div>
        <div>
          <div className="text-sm text-slate-500">Role</div>
          <div className="font-medium text-slate-900">{(profile as any)?.role || sessionRole || '-'}</div>
        </div>
        <div className="pt-2">
          <Link href="/request-reset" className="inline-flex rounded-lg bg-teal-600 px-4 py-2 text-white">Ubah Password</Link>
        </div>
      </div>
    </div>
  )
}