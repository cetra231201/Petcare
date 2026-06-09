import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/shared/DashboardShell'

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'STAFF') redirect('/dashboard')

  return <DashboardShell role="STAFF">{children}</DashboardShell>
}
