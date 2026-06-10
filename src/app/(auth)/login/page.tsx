"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { toast } from '@/components/shared/Toast'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    const user = session?.user as any
    if (user?.role) {
      const role = user.role
      const dest = role === 'ADMIN' ? '/dashboard/admin' : role === 'DOKTER' ? '/dashboard/dokter' : role === 'STAFF' ? '/dashboard/staff' : '/dashboard/client'
      router.replace(dest)
    }
  }, [router, session])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const result = await signIn('credentials', { redirect: false, email: data.email, password: data.password })
    setLoading(false)

    if (result?.error) {
      toast(result.error)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-teal-700 mb-4">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input className="mt-1 block w-full border rounded p-2" {...register('email')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" className="mt-1 block w-full border rounded p-2" {...register('password')} />
          </div>
          <div>
            <button disabled={loading} type="submit" className="w-full py-2 bg-teal-600 text-white rounded disabled:opacity-50">
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <Link href="/request-reset" className="text-teal-600 hover:underline">Lupa Password?</Link>
            <Link href="/" className="hover:underline">Kembali ke Beranda</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
