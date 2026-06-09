"use client"
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useUsers from '@/hooks/useUsers'
import { toast } from '@/components/shared/Toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { adminUserSchema, type AdminUserInput } from '@/lib/schemas'

export default function AdminUsersPage() {
  const { query, create, remove } = useUsers()
  const users = (query.data as { data: any[] } | undefined)?.data || []
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AdminUserInput>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: { name: '', email: '', role: 'CLIENT', password: '' },
  })

  const handleCreate = async (values: AdminUserInput) => {
    try {
      await create.mutateAsync(values)
      reset()
      toast('Pengguna dibuat')
    } catch (err: any) {
      toast(err.message || 'Gagal membuat pengguna')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-teal-700">Manajemen Pengguna</h2>
      <div className="mt-4 grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium">Tambah Pengguna</h3>
          <form onSubmit={handleSubmit(handleCreate)} className="space-y-2 mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <input placeholder="Nama" {...register('name')} className="w-full rounded-xl border border-slate-200 p-2.5" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <input placeholder="Email" {...register('email')} className="w-full rounded-xl border border-slate-200 p-2.5" />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <select {...register('role')} className="w-full rounded-xl border border-slate-200 p-2.5">
              <option value="CLIENT">Pelanggan</option>
              <option value="STAFF">Staff</option>
              <option value="DOKTER">Dokter</option>
              <option value="ADMIN">Admin</option>
            </select>
            </div>
            <div>
              <input placeholder="Password" type="password" {...register('password')} className="w-full rounded-xl border border-slate-200 p-2.5" />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>
            <button className="rounded-xl bg-teal-600 px-4 py-2 text-white transition hover:bg-teal-700">Buat</button>
          </form>
        </div>

        <div>
          <h3 className="font-medium">Daftar Pengguna</h3>
          <div className="mt-2 space-y-2">
            {query.isLoading && <div>Loading...</div>}
            {users.map((u: any) => (
              <div key={u.id} className="border p-3 rounded flex justify-between items-center">
                <div>
                  <div className="font-semibold">{u.name} ({u.role})</div>
                  <div className="text-sm text-gray-600">{u.email}</div>
                </div>
                <div>
                  <button onClick={() => setDeleteTarget(u)} className="px-2 py-1 bg-red-600 text-white rounded">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus pengguna"
        message={`Hapus ${deleteTarget?.name || 'pengguna'} dari sistem?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await remove.mutateAsync(deleteTarget.id)
            toast('Pengguna dihapus')
          } catch (e: any) {
            toast(e.message || 'Gagal menghapus')
          } finally {
            setDeleteTarget(null)
          }
        }}
      />
    </div>
  )
}
