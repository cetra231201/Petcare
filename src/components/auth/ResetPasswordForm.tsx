"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@/components/shared/Toast'

const schema = z.object({ token: z.string().min(1), password: z.string().min(6) })
type FormData = z.infer<typeof schema>

export default function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const token = searchParams.get('token') || ''
  const { register, handleSubmit } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { token } })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Gagal reset password')
      toast('Password berhasil direset. Silakan login kembali.')
      router.push('/login')
    } catch (err: any) {
      toast(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-teal-700 mb-4">Atur Ulang Password</h2>
        <p className="text-sm text-slate-600 mb-4">Masukkan token yang Anda terima dan password baru Anda.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Token</label>
            <input className="mt-1 block w-full border rounded p-2" {...register('token')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password Baru</label>
            <input type="password" className="mt-1 block w-full border rounded p-2" {...register('password')} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2 bg-teal-600 text-white rounded disabled:opacity-50">
            {loading ? 'Memproses...' : 'Reset Password'}
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-500">
          <Link href="/login" className="text-teal-600 hover:underline">Kembali ke Login</Link>
        </div>
      </div>
    </div>
  )
}
