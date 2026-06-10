import { describe, expect, it } from 'vitest'
import {
  appointmentCreateSchema,
  invoiceCreateSchema,
  rekamMedisCreateSchema,
  serviceCreateSchema,
  userCreateSchema,
} from '@/lib/validation/schemas'

describe('validation schemas', () => {
  it('accepts a valid user creation payload', () => {
    const payload = {
      name: 'Rudi',
      email: 'Rudi@example.com',
      role: 'CLIENT',
      password: 'Secret123',
    }

    const result = userCreateSchema.parse(payload)
    expect(result.email).toBe('rudi@example.com')
  })

  it('rejects weak passwords and invalid emails', () => {
    expect(() => userCreateSchema.parse({
      name: 'Rudi',
      email: 'not-an-email',
      role: 'CLIENT',
      password: 'weak',
    })).toThrow()
  })

  it('validates appointment creation schema', () => {
    const payload = {
      hewanId: 'pet123',
      dokterId: 'doc123',
      tanggal: '2026-06-10T09:00:00.000Z',
      waktu: '09:00',
      jenis: 'PEMERIKSAAN',
    }

    const result = appointmentCreateSchema.parse(payload)
    expect(result).toMatchObject({
      hewanId: payload.hewanId,
      dokterId: payload.dokterId,
      waktu: payload.waktu,
      jenis: payload.jenis,
    })
    expect(result.tanggal).toBeInstanceOf(Date)
  })

  it('rejects invoice payloads without items', () => {
    expect(() => invoiceCreateSchema.parse({
      customerId: 'user123',
      items: [],
    })).toThrow()
  })

  it('accepts invoice items with service references', () => {
    const payload = {
      customerId: 'user123',
      items: [
        {
          serviceId: 'service123',
          namaItem: 'Vaksinasi',
          quantity: 1,
          unitPrice: 150000,
        },
      ],
    }

    const result = invoiceCreateSchema.parse(payload)
    expect(result.items[0].serviceId).toBe('service123')
  })

  it('validates service creation payload', () => {
    const payload = {
      nama: 'Konsultasi Dokter',
      harga: 175000,
    }

    const result = serviceCreateSchema.parse(payload)
    expect(result.nama).toBe(payload.nama)
    expect(result.harga).toBe(payload.harga)
  })

  it('validates medical record creation payload', () => {
    const payload = {
      appointmentId: 'appt1',
      hewanId: 'pet1',
      dokterId: 'doc1',
      tanggalPeriksa: '2026-06-10T09:00:00.000Z',
      diagnosis: 'Feline flu',
      tindakan: 'Berikan antibiotik dan observasi',
    }

    const result = rekamMedisCreateSchema.parse(payload)
    expect(result).toMatchObject({
      appointmentId: payload.appointmentId,
      hewanId: payload.hewanId,
      dokterId: payload.dokterId,
      diagnosis: payload.diagnosis,
      tindakan: payload.tindakan,
    })
    expect(result.tanggalPeriksa).toBeInstanceOf(Date)
  })
})
