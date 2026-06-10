'use client'

import React from 'react'
import { useForm, FieldError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { appointmentSchema, type AppointmentInput } from '@/lib/schemas'
import type { User, Hewan, AppointmentCreateInput } from '@/types'

interface AppointmentFormProps {
  onSubmit: (data: AppointmentCreateInput) => void | Promise<void>
  doctors?: User[]
  pets?: Hewan[]
}

function getErrorMessage(error: FieldError | undefined): string {
  return typeof error?.message === 'string' ? error.message : ''
}

export default function AppointmentForm({ onSubmit, doctors, pets }: AppointmentFormProps): React.ReactElement {
  const { register, handleSubmit, formState: { errors } } = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
  })

  const handleFormSubmit = (values: AppointmentInput) => {
    onSubmit({
      ...values,
      tanggal: new Date(values.tanggal),
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm">Pilih Hewan</label>
        <select {...register('hewanId')} className="w-full border p-2 rounded">
          <option value="">Pilih hewan</option>
          {pets?.map((p: Hewan) => (
            <option key={p.id} value={p.id}>
              {p.nama}
            </option>
          ))}
        </select>
        {errors.hewanId && <p className="text-xs text-red-600">{getErrorMessage(errors.hewanId)}</p>}
      </div>
      <div>
        <label className="block text-sm">Pilih Dokter</label>
        <select {...register('dokterId')} className="w-full border p-2 rounded">
          <option value="">Pilih dokter</option>
          {doctors?.map((d: User) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        {errors.dokterId && <p className="text-xs text-red-600">{getErrorMessage(errors.dokterId)}</p>}
      </div>
      <div>
        <label className="block text-sm">Jenis Layanan</label>
        <select {...register('jenis')} className="w-full border p-2 rounded">
          <option value="">Pilih jenis layanan</option>
          <option value="PEMERIKSAAN">Pemeriksaan</option>
          <option value="VAKSINASI">Vaksinasi</option>
          <option value="BEDAH">Bedah</option>
          <option value="GROOMING">Grooming</option>
          <option value="DENTAL">Dental</option>
          <option value="RAWAT_INAP">Rawat Inap</option>
          <option value="TELEMEDICINE">Telemedicine</option>
          <option value="HOME_VISIT">Home Visit</option>
        </select>
        {errors.jenis && <p className="text-xs text-red-600">{getErrorMessage(errors.jenis)}</p>}
      </div>
      <div>
        <label className="block text-sm">Tanggal</label>
        <input type="date" {...register('tanggal')} className="w-full border p-2 rounded" />
        {errors.tanggal && <p className="text-xs text-red-600">{getErrorMessage(errors.tanggal)}</p>}
      </div>
      <div>
        <label className="block text-sm">Waktu</label>
        <input type="time" {...register('waktu')} className="w-full border p-2 rounded" />
        {errors.waktu && <p className="text-xs text-red-600">{getErrorMessage(errors.waktu)}</p>}
      </div>
      <div>
        <label className="block text-sm">Keluhan</label>
        <textarea {...register('keluhan')} className="w-full border p-2 rounded" rows={3} />
      </div>
      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded">
          Buat Janji
        </button>
      </div>
    </form>
  )
}
