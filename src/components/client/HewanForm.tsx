'use client'

import React from 'react'
import { useForm, FieldError, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { hewanSchema, type HewanInput } from '@/lib/schemas'
import type { HewanCreateInput, HewanUpdateInput } from '@/types'

type HewanFormData = HewanCreateInput | HewanUpdateInput

interface HewanFormProps {
  onSubmit: (data: HewanFormData) => void | Promise<void>
  defaultValues?: HewanFormData
}

function getErrorMessage(error: FieldError | undefined): string {
  return typeof error?.message === 'string' ? error.message : ''
}

export default function HewanForm({ onSubmit, defaultValues }: HewanFormProps): React.ReactElement {
  const normalizedDefaultValues = defaultValues
    ? {
        ...defaultValues,
        ras: defaultValues.ras ?? undefined,
        tanggalLahir:
          defaultValues.tanggalLahir instanceof Date
            ? defaultValues.tanggalLahir.toISOString().split('T')[0]
            : defaultValues.tanggalLahir ?? undefined,
        beratBadan: defaultValues.beratBadan ?? undefined,
        foto: defaultValues.foto ?? undefined,
        catatanKhusus: defaultValues.catatanKhusus ?? undefined,
      }
    : undefined

  const { register, handleSubmit, formState: { errors } } = useForm<HewanInput>({
    defaultValues: normalizedDefaultValues as Partial<HewanInput> | undefined,
    resolver: zodResolver(hewanSchema) as Resolver<HewanInput>,
  })

  const handleFormSubmit = (values: any) => {
    onSubmit(values as HewanFormData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm">Nama</label>
        <input {...register('nama')} className="w-full border p-2 rounded" />
        {errors.nama && <p className="text-xs text-red-600">{getErrorMessage(errors.nama)}</p>}
      </div>
      <div>
        <label className="block text-sm">Jenis</label>
        <select {...register('jenis')} className="w-full border p-2 rounded">
          <option value="KUCING">Kucing</option>
          <option value="ANJING">Anjing</option>
          <option value="BURUNG">Burung</option>
          <option value="KELINCI">Kelinci</option>
          <option value="LAINNYA">Lainnya</option>
        </select>
        {errors.jenis && <p className="text-xs text-red-600">{getErrorMessage(errors.jenis)}</p>}
      </div>
      <div>
        <label className="block text-sm">Ras</label>
        <input {...register('ras')} className="w-full border p-2 rounded" />
        {errors.ras && <p className="text-xs text-red-600">{getErrorMessage(errors.ras)}</p>}
      </div>
      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded">
          Simpan
        </button>
      </div>
    </form>
  )
}
