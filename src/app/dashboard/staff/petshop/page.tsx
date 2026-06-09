import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import PetshopSales from '@/components/petshop/PetshopSales'

export default async function StaffPetshopPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'STAFF') redirect('/dashboard')

  return <PetshopSales role="STAFF" />
}
