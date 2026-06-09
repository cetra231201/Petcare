import { z } from 'zod'

export const hewanSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  jenis: z.enum(['KUCING','ANJING','BURUNG','KELINCI','LAINNYA']),
  ras: z.string().optional(),
  tanggalLahir: z.string().optional(),
  beratBadan: z.preprocess((v) => (v ? Number(v) : undefined), z.number().optional()),
  foto: z.string().optional(),
  catatanKhusus: z.string().optional(),
  pelangganId: z.string().optional(),
})

export const appointmentSchema = z.object({
  pelangganId: z.string().optional(),
  hewanId: z.string().min(1, 'Pilih hewan'),
  dokterId: z.string().min(1, 'Pilih dokter'),
  tanggal: z.string().min(1, 'Tanggal wajib'),
  waktu: z.string().min(1, 'Waktu wajib'),
  jenis: z.enum(['PEMERIKSAAN','VAKSINASI','BEDAH','GROOMING','DENTAL','RAWAT_INAP','TELEMEDICINE','HOME_VISIT']),
  keluhan: z.string().optional(),
})

export const inventorySchema = z.object({
  namaItem: z.string().min(1, 'Nama item wajib diisi'),
  kategori: z.enum(['OBAT', 'ALAT', 'KONSUMABLE']),
  stok: z.coerce.number().int().min(0, 'Stok tidak boleh negatif'),
  satuan: z.string().min(1, 'Satuan wajib diisi'),
  harga: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
  stokMinimal: z.coerce.number().int().min(0, 'Stok minimal tidak boleh negatif'),
})

export const invoiceItemSchema = z.object({
  inventoryId: z.string().optional(),
  namaItem: z.string().min(1, 'Nama item wajib diisi'),
  quantity: z.coerce.number().int().min(1, 'Jumlah harus minimal 1'),
  unitPrice: z.coerce.number().min(0, 'Harga satuan tidak boleh negatif'),
})

export const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer wajib dipilih'),
  hewanId: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'Tambahkan setidaknya satu item'),
})

export const inventoryAdjustmentSchema = z.object({
  inventoryId: z.string().min(1, 'Pilih item inventory'),
  adjustment: z.coerce.number().int().min(-1000000, 'Nilai penyesuaian tidak valid').max(1000000, 'Nilai penyesuaian tidak valid'),
  note: z.string().optional(),
})

export const adminUserSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  role: z.enum(['CLIENT', 'STAFF', 'DOKTER', 'ADMIN']),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

export type HewanInput = z.infer<typeof hewanSchema>
export type AppointmentInput = z.infer<typeof appointmentSchema>
export type InventoryInput = z.infer<typeof inventorySchema>
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>
export type InvoiceInput = z.infer<typeof invoiceSchema>
export type AdminUserInput = z.infer<typeof adminUserSchema>
