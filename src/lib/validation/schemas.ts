import { z } from 'zod'

export const userRoleSchema = z.enum(['ADMIN', 'STAFF', 'DOKTER', 'CLIENT'])

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const userCreateSchema = z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid').transform((value) => value.toLowerCase()),
  role: userRoleSchema,
  password: passwordSchema,
  phone: z.string().optional(),
  avatar: z.string().optional(),
})

export const userUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().email('Email tidak valid').transform((value) => value.toLowerCase()).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  role: userRoleSchema.optional(),
  password: passwordSchema.optional(),
})

export const appointmentJenisSchema = z.enum([
  'PEMERIKSAAN',
  'VAKSINASI',
  'BEDAH',
  'GROOMING',
  'DENTAL',
  'RAWAT_INAP',
  'TELEMEDICINE',
  'HOME_VISIT',
])

export const appointmentTimeSchema = z.string()
  .min(1, 'Waktu wajib diisi')
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format waktu harus HH:mm')

export const appointmentDateSchema = z.preprocess((value) => {
  if (typeof value === 'string' || value instanceof Date) {
    return new Date(value)
  }
  return undefined
}, z.date().refine((date) => date > new Date(), {
  message: 'Tanggal harus berada di masa depan',
}))

export const appointmentCreateSchema = z.object({
  pelangganId: z.string().optional(),
  hewanId: z.string().min(1, 'Hewan wajib dipilih'),
  dokterId: z.string().min(1, 'Dokter wajib dipilih'),
  tanggal: appointmentDateSchema,
  waktu: appointmentTimeSchema,
  jenis: appointmentJenisSchema,
  keluhan: z.string().optional(),
})

export const appointmentUpdateSchema = z.object({
  dokterId: z.string().nullable().optional(),
  status: z.enum(['MENUNGGU', 'DIKONFIRMASI', 'SELESAI', 'DIBATALKAN']).optional(),
  catatanAdmin: z.string().optional(),
})

export const inventoryKategoriSchema = z.enum(['OBAT', 'ALAT', 'KONSUMABLE'])

export const inventoryCreateSchema = z.object({
  namaItem: z.string().min(1, 'Nama item wajib diisi'),
  kategori: inventoryKategoriSchema,
  stok: z.coerce.number().int().min(0, 'Stok tidak boleh negatif'),
  satuan: z.string().min(1, 'Satuan wajib diisi'),
  harga: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
  stokMinimal: z.coerce.number().int().min(0, 'Stok minimal tidak boleh negatif'),
  categoryId: z.string().optional(),
})

export const inventoryUpdateSchema = z.object({
  namaItem: z.string().min(1).optional(),
  kategori: inventoryKategoriSchema.optional(),
  stok: z.coerce.number().int().min(0).optional(),
  satuan: z.string().min(1).optional(),
  harga: z.coerce.number().min(0).optional(),
  stokMinimal: z.coerce.number().int().min(0).optional(),
  categoryId: z.string().optional(),
})

export const inventoryMovementTypeSchema = z.enum(['SALE', 'MANUAL_ADJUSTMENT', 'RESTOCK', 'RETURN'])

export const inventoryAdjustmentSchema = z.object({
  adjustment: z.coerce.number().int().min(-1000000, 'Adjustmen tidak valid').max(1000000, 'Adjustmen tidak valid'),
  type: inventoryMovementTypeSchema.optional().default('MANUAL_ADJUSTMENT'),
  note: z.string().optional(),
})

export const invoiceItemSchema = z.object({
  inventoryId: z.string().optional(),
  namaItem: z.string().min(1, 'Nama item wajib diisi'),
  quantity: z.coerce.number().int().min(1, 'Jumlah harus minimal 1'),
  unitPrice: z.coerce.number().min(0, 'Harga satuan tidak boleh negatif'),
})

export const invoiceCreateSchema = z.object({
  customerId: z.string().min(1, 'Customer wajib dipilih'),
  hewanId: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'Tambahkan setidaknya satu item'),
  total: z.coerce.number().min(0).optional(),
}).superRefine((data, ctx) => {
  const computedTotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  if (data.total !== undefined && data.total !== computedTotal) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Total tidak sesuai dengan jumlah item',
      path: ['total'],
    })
  }
})

export const invoiceUpdateSchema = z.object({
  customerId: z.string().min(1).optional(),
  hewanId: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PRINTED', 'PAID', 'VOID']).optional(),
  items: z.array(invoiceItemSchema).optional(),
  total: z.coerce.number().min(0).optional(),
})

export const rekamMedisCreateSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment harus dipilih'),
  hewanId: z.string().min(1, 'Hewan harus dipilih'),
  dokterId: z.string().min(1, 'Dokter harus dipilih'),
  tanggalPeriksa: z.preprocess((value) => {
    if (typeof value === 'string' || value instanceof Date) {
      return new Date(value)
    }
    return undefined
  }, z.date()),
  keluhan: z.string().optional(),
  diagnosis: z.string().min(1, 'Diagnosis wajib diisi'),
  tindakan: z.string().min(1, 'Tindakan wajib diisi'),
  resep: z.string().optional(),
  obat: z.string().optional(),
  perawatan: z.string().optional(),
  dosis: z.string().optional(),
  catatanPerawatan: z.string().optional(),
  catatanDokter: z.string().optional(),
  lampiran: z.array(z.string()).optional(),
})

export const rekamMedisUpdateSchema = z.object({
  keluhan: z.string().min(1).optional(),
  diagnosis: z.string().min(1).optional(),
  tindakan: z.string().min(1).optional(),
  resep: z.string().min(1).optional(),
  obat: z.string().min(1).optional(),
  perawatan: z.string().min(1).optional(),
  dosis: z.string().min(1).optional(),
  catatanPerawatan: z.string().optional(),
  catatanDokter: z.string().optional(),
  lampiran: z.array(z.string()).optional(),
})

export const notificationBroadcastSchema = z.object({
  judul: z.string().min(1, 'Judul wajib diisi'),
  isi: z.string().min(1, 'Isi notifikasi wajib diisi'),
  tipe: z.enum(['INFO', 'PERINGATAN', 'SUKSES']),
})

export const notificationUpdateSchema = z.object({
  isRead: z.boolean(),
})

export const artikelUpdateSchema = z.object({
  judul: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  konten: z.string().min(1).optional(),
  thumbnail: z.string().url().optional(),
  isPublished: z.boolean().optional(),
})
