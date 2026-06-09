import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import InvoiceDashboard from '@/components/invoice/InvoiceDashboard'

export default async function AdminInvoicePage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dashboard')

  return <InvoiceDashboard role="ADMIN" />
}
