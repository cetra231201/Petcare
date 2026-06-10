/**
 * Centralized TypeScript types derived from Prisma schema
 * All shared types should be defined here to maintain consistency across the codebase
 */

import type { Prisma } from '@prisma/client'

// Re-export enums from Prisma
export type {
  Role,
  Jenis,
  NafsuMakan,
  Aktivitas,
  JenisLayanan,
  AppointmentStatus,
  Hari,
  Kategori,
  InventoryMovementType,
  NotifikasiTipe,
  InvoiceStatus,
} from '@prisma/client'

// User Types
export type User = Prisma.UserGetPayload<{}>
export type UserWithoutPassword = Omit<User, 'password'>

export interface UserCreateInput {
  name: string
  email: string
  password: string
  role?: 'ADMIN' | 'STAFF' | 'DOKTER' | 'CLIENT'
  phone?: string | null
  avatar?: string | null
}

export interface UserUpdateInput {
  name?: string
  email?: string
  password?: string
  role?: 'ADMIN' | 'STAFF' | 'DOKTER' | 'CLIENT'
  phone?: string | null
  avatar?: string | null
}

export interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  role?: string
  avatar?: string | null
}

// Hewan (Pet) Types
export type Hewan = Prisma.HewanGetPayload<{}>

export interface HewanCreateInput {
  nama: string
  jenis: 'KUCING' | 'ANJING' | 'BURUNG' | 'KELINCI' | 'LAINNYA'
  ras?: string | null
  tanggalLahir?: Date | null
  beratBadan?: number | null
  foto?: string | null
  catatanKhusus?: string | null
  pelangganId?: string
}

export interface HewanUpdateInput {
  nama?: string
  jenis?: 'KUCING' | 'ANJING' | 'BURUNG' | 'KELINCI' | 'LAINNYA'
  ras?: string | null
  tanggalLahir?: Date | null
  beratBadan?: number | null
  foto?: string | null
  catatanKhusus?: string | null
}

// Appointment Types
export type Appointment = Prisma.AppointmentGetPayload<{}>

export interface AppointmentCreateInput {
  pelangganId?: string
  hewanId: string
  dokterId?: string | null
  tanggal: Date
  waktu: string
  jenis: 'PEMERIKSAAN' | 'VAKSINASI' | 'BEDAH' | 'GROOMING' | 'DENTAL' | 'RAWAT_INAP' | 'TELEMEDICINE' | 'HOME_VISIT'
  keluhan?: string | null
}

export interface AppointmentUpdateInput {
  dokterId?: string | null
  tanggal?: Date
  waktu?: string
  jenis?: 'PEMERIKSAAN' | 'VAKSINASI' | 'BEDAH' | 'GROOMING' | 'DENTAL' | 'RAWAT_INAP' | 'TELEMEDICINE' | 'HOME_VISIT'
  keluhan?: string | null
  status?: 'MENUNGGU' | 'DIKONFIRMASI' | 'SELESAI' | 'DIBATALKAN'
  catatanAdmin?: string | null
}

// RekamMedis (Medical Records) Types
export type RekamMedis = Prisma.RekamMedisGetPayload<{}>

export interface RekamMedisCreateInput {
  appointmentId: string
  hewanId: string
  dokterId: string
  tanggalPeriksa: Date
  keluhan?: string | null
  diagnosis?: string | null
  tindakan?: string | null
  resep?: string | null
  obat?: string | null
  perawatan?: string | null
  dosis?: string | null
  catatanPerawatan?: string | null
  catatanDokter?: string | null
  lampiran?: string[]
}

export interface RekamMedisUpdateInput {
  keluhan?: string | null
  diagnosis?: string | null
  tindakan?: string | null
  resep?: string | null
  obat?: string | null
  perawatan?: string | null
  dosis?: string | null
  catatanPerawatan?: string | null
  catatanDokter?: string | null
  lampiran?: string[]
}

// TreatmentProgress Types
export type TreatmentProgress = Prisma.TreatmentProgressGetPayload<{}>

export interface TreatmentProgressCreateInput {
  rekamMedisId: string
  tanggal?: Date
  kondisi: string
  progress: string
  catatan?: string | null
}

// Invoice Types
export type Invoice = Prisma.InvoiceGetPayload<{}>

export interface InvoiceCreateInput {
  invoiceNumber: string
  customerId: string
  hewanId?: string | null
  status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PRINTED' | 'PAID' | 'VOID'
  items: InvoiceItemCreateInput[]
}

export interface InvoiceUpdateInput {
  status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PRINTED' | 'PAID' | 'VOID'
  voidReason?: string | null
  items?: InvoiceItemCreateInput[]
}

// InvoiceItem Types
export type InvoiceItem = Prisma.InvoiceItemGetPayload<{}>

export interface InvoiceItemCreateInput {
  namaItem: string
  quantity: number
  unitPrice: number
  subTotal: number
  inventoryId?: string | null
  serviceId?: string | null
}

export type Service = Prisma.ServiceGetPayload<{}>

export interface ServiceCreateInput {
  nama: string
  deskripsi?: string | null
  harga: number
  kategori?: string | null
  isActive?: boolean
}

// Inventory Types
export type Inventory = Prisma.InventoryGetPayload<{}>

export interface InventoryCreateInput {
  namaItem: string
  kategori: 'OBAT' | 'ALAT' | 'KONSUMABLE'
  stok: number
  satuan: string
  harga: number
  stokMinimal: number
  categoryId?: string | null
}

export interface InventoryUpdateInput {
  namaItem?: string
  kategori?: 'OBAT' | 'ALAT' | 'KONSUMABLE'
  stok?: number
  satuan?: string
  harga?: number
  stokMinimal?: number
  categoryId?: string | null
}

// InventoryMovement Types
export type InventoryMovement = Prisma.InventoryMovementGetPayload<{}>

export interface InventoryMovementCreateInput {
  inventoryId: string
  userId?: string | null
  type: 'SALE' | 'MANUAL_ADJUSTMENT' | 'RESTOCK' | 'RETURN'
  quantity: number
  beforeStock: number
  afterStock: number
  note?: string | null
}

// Monitoring Harian (Daily Monitoring) Types
export type MonitoringHarian = Prisma.MonitoringHarianGetPayload<{}>

export interface MonitoringHarianCreateInput {
  hewanId: string
  tanggal: Date
  beratBadan?: number | null
  suhu?: number | null
  nafsuMakan: 'BAIK' | 'SEDANG' | 'BURUK'
  aktivitas: 'AKTIF' | 'NORMAL' | 'LESU'
  catatanGejala?: string | null
}

// Notifikasi (Notification) Types
export type Notifikasi = Prisma.NotifikasiGetPayload<{}>

export interface NotifikasiCreateInput {
  userId: string
  judul: string
  isi: string
  tipe: 'INFO' | 'PERINGATAN' | 'SUKSES'
}

// JadwalDokter (Doctor Schedule) Types
export type JadwalDokter = Prisma.JadwalDokterGetPayload<{}>

export interface JadwalDokterCreateInput {
  dokterId: string
  hari: 'SENIN' | 'SELASA' | 'RABU' | 'KAMIS' | 'JUMAT' | 'SABTU' | 'MINGGU'
  jamMulai: string
  jamSelesai: string
  isAktif?: boolean
}

// Pesan (Message) Types
export type Pesan = Prisma.PesanGetPayload<{}>

// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T
  message?: string
  meta?: Record<string, unknown>
  error?: string
}

export interface ApiErrorResponse {
  message: string
  error?: string
  details?: Record<string, unknown>
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages?: number
}

export interface ApiPaginatedResponse<T = unknown> {
  data: T[]
  meta: PaginationMeta
}

// Auth Role Types
export type ApiRole = 'ADMIN' | 'STAFF' | 'DOKTER' | 'CLIENT'

// Auth Token Type (used in API routes)
export interface ApiToken {
  id?: string
  sub?: string
  role?: ApiRole
  name?: string
  email?: string
  avatar?: string
}

// Current User Type
export interface CurrentUser {
  id: string
  role: 'ADMIN' | 'STAFF' | 'DOKTER' | 'CLIENT'
  email: string
}

export interface CurrentUserWithName extends CurrentUser {
  name?: string
  avatar?: string
}
