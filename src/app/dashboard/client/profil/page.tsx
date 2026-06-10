import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import ProfilEditor from '@/components/client/ProfilEditor'

export default async function PelangganProfilPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'CLIENT') redirect('/dashboard')

  return (
    <div>
      <h2 className="text-2xl font-semibold text-teal-700">Profil</h2>
      <p className="mt-1 text-sm text-slate-500">Perbarui informasi akun Anda dan data kontak.</p>
      <ProfilEditor />
    </div>
  )
}