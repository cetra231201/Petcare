'use client'

import { useEffect, useState } from 'react'
import { toast } from '@/components/shared/Toast'

type UserData = {
  id: string
  name: string
  email: string
  phone?: string
  role: string
}

export default function ProfilEditor() {
  const [user, setUser] = useState<UserData | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/users/me')
      if (!res.ok) return
      const json = await res.json()
      setUser(json.user)
    }
    load()
  }, [])

  async function handleSave() {
    if (!user) return
    setSaving(true)
    const { id, name, email, phone } = user
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone }),
    })
    setSaving(false)
    if (res.ok) {
      toast('Profil berhasil diperbarui')
      return
    }
    const json = await res.json()
    toast(json.message || 'Gagal memperbarui profil')
  }

  if (!user) {
    return <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 text-slate-500">Memuat profil...</div>
  }

  return (
    <div className="mt-6 max-w-xl rounded-2xl bg-white p-5 shadow-sm border border-slate-100 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <div className="text-sm font-medium text-slate-600">Nama</div>
          <input
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
          />
        </label>
        <label className="space-y-2">
          <div className="text-sm font-medium text-slate-600">Email</div>
          <input
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
          />
        </label>
      </div>
      <label className="space-y-2">
        <div className="text-sm font-medium text-slate-600">Telepon</div>
        <input
          type="tel"
          value={user.phone || ''}
          onChange={(e) => setUser({ ...user, phone: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
        />
      </label>
      <div className="flex items-center justify-end gap-3">
        <span className="text-sm text-slate-500">Role: {user.role}</span>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  )
}
