import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import PetshopSales from '@/components/petshop/PetshopSales'

export default async function AdminPetshopPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dashboard')

  return <PetshopSales role="ADMIN" />
}
