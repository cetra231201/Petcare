'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDoctors } from '@/hooks/useDoctors'
import { toast } from '@/components/shared/Toast'

type Jadwal = {
  id: string
  hari: string
  jamMulai: string
  jamSelesai: string
  isAktif: boolean
  dokter?: { name?: string }
}

type Doctor = { id: string; name: string }

export default function AdminJadwalManager() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ dokterId: '', hari: '', jamMulai: '', jamSelesai: '', isAktif: true })
  const { data: doctorData, isLoading: isDoctorsLoading } = useDoctors()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminJadwal'],
    queryFn: async () => {
      const res = await fetch('/api/jadwal')
      if (!res.ok) throw new Error('Gagal memuat jadwal')
      return res.json()
    },
  })

  const createSchedule = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/jadwal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Gagal menambahkan jadwal')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminJadwal'] })
      setForm({ dokterId: '', hari: '', jamMulai: '', jamSelesai: '', isAktif: true })
      toast('Jadwal dokter berhasil ditambahkan')
    },
  })

  const toggleSchedule = useMutation({
    mutationFn: async ({ id, isAktif }: { id: string; isAktif: boolean }) => {
      const res = await fetch(`/api/jadwal/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAktif }),
      })
      if (!res.ok) throw new Error('Gagal memperbarui jadwal')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminJadwal'] }),
  })

  const deleteSchedule = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/jadwal/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus jadwal')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminJadwal'] }),
  })

  if (isLoading || isDoctorsLoading) return <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 text-slate-500">Memuat jadwal dokter...</div>
  if (isError) return <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 text-slate-500">Terjadi kesalahan memuat jadwal.</div>

  const schedules: Jadwal[] = data?.data || []
  const doctors: Doctor[] = doctorData || []
  const canSubmit = form.dokterId && form.hari && form.jamMulai && form.jamSelesai

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">Tambah Jadwal Dokter</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <select
            value={form.dokterId}
            onChange={(e) => setForm((prev) => ({ ...prev, dokterId: e.target.value }))}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <option value="">Pilih dokter</option>
            {doctors.map((dokter) => (
              <option key={dokter.id} value={dokter.id}>{dokter.name}</option>
            ))}
          </select>
          <input
            value={form.hari}
            onChange={(e) => setForm((prev) => ({ ...prev, hari: e.target.value }))}
            placeholder="Hari"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
          />
          <input
            type="time"
            value={form.jamMulai}
            onChange={(e) => setForm((prev) => ({ ...prev, jamMulai: e.target.value }))}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
          />
          <input
            type="time"
            value={form.jamSelesai}
            onChange={(e) => setForm((prev) => ({ ...prev, jamSelesai: e.target.value }))}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
          />
        </div>
        <div className="mt-4 flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isAktif}
              onChange={(e) => setForm((prev) => ({ ...prev, isAktif: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-teal-600"
            />
            Aktifkan jadwal
          </label>
          <button
            type="button"
            disabled={!canSubmit || createSchedule.isPending}
            onClick={() => createSchedule.mutate()}
            className="rounded-lg bg-teal-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {createSchedule.isPending ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">Belum ada jadwal dokter.</div>
      ) : (
        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{schedule.dokter?.name || 'Dokter tidak ditemukan'}</div>
                  <div className="text-sm text-slate-600">{schedule.hari} • {schedule.jamMulai} - {schedule.jamSelesai}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSchedule.mutate({ id: schedule.id, isAktif: !schedule.isAktif })}
                    className="rounded-lg bg-teal-600 px-4 py-2 text-white"
                  >
                    {schedule.isAktif ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSchedule.mutate(schedule.id)}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-white"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
