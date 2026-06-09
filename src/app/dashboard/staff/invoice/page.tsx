import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import InvoiceDashboard from '@/components/invoice/InvoiceDashboard'

export default async function StaffInvoicePage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'STAFF') redirect('/dashboard')

  return <InvoiceDashboard role="STAFF" />
}
