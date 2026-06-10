import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function DashboardRootPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const role = (session.user as any)?.role as string | undefined
  if (role === 'ADMIN') redirect('/dashboard/admin')
  if (role === 'DOKTER') redirect('/dashboard/dokter')
  if (role === 'STAFF') redirect('/dashboard/staff')
  redirect('/dashboard/client')
}
