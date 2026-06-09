import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = {
    admin: await bcrypt.hash('Admin123!', 10),
    staff: await bcrypt.hash('Staff123!', 10),
    dokter: await bcrypt.hash('Dokter123!', 10),
    client: await bcrypt.hash('Pelanggan123!', 10),
  }

  const admin = await prisma.user.upsert({
    where: { id: 'seed-admin' },
    update: { name: 'Admin Klinik', email: 'admin@klinik.com', password: password.admin, role: 'ADMIN', phone: '081234567890' },
    create: { id: 'seed-admin', name: 'Admin Klinik', email: 'admin@klinik.com', password: password.admin, role: 'ADMIN', phone: '081234567890' },
  })

  const staff = await prisma.user.upsert({
    where: { id: 'seed-staff' },
    update: { name: 'Staff Klinik', email: 'staff@klinik.com', password: password.staff, role: 'STAFF', phone: '081555555555' },
    create: { id: 'seed-staff', name: 'Staff Klinik', email: 'staff@klinik.com', password: password.staff, role: 'STAFF', phone: '081555555555' },
  })

  const dokter1 = await prisma.user.upsert({
    where: { id: 'seed-dokter-1' },
    update: { name: 'Dr. Budi', email: 'dokter1@klinik.com', password: password.dokter, role: 'DOKTER', phone: '081111111111' },
    create: { id: 'seed-dokter-1', name: 'Dr. Budi', email: 'dokter1@klinik.com', password: password.dokter, role: 'DOKTER', phone: '081111111111' },
  })

  const dokter2 = await prisma.user.upsert({
    where: { id: 'seed-dokter-2' },
    update: { name: 'Dr. Siti', email: 'dokter2@klinik.com', password: password.dokter, role: 'DOKTER', phone: '082222222222' },
    create: { id: 'seed-dokter-2', name: 'Dr. Siti', email: 'dokter2@klinik.com', password: password.dokter, role: 'DOKTER', phone: '082222222222' },
  })

  const pelanggan1 = await prisma.user.upsert({
    where: { id: 'seed-pelanggan-1' },
    update: { name: 'Andi', email: 'pelanggan1@klinik.com', password: password.client, role: 'CLIENT', phone: '083333333333' },
    create: { id: 'seed-pelanggan-1', name: 'Andi', email: 'pelanggan1@klinik.com', password: password.client, role: 'CLIENT', phone: '083333333333' },
  })

  const pelanggan2 = await prisma.user.upsert({
    where: { id: 'seed-pelanggan-2' },
    update: { name: 'Bina', email: 'pelanggan2@klinik.com', password: password.client, role: 'CLIENT', phone: '083444444444' },
    create: { id: 'seed-pelanggan-2', name: 'Bina', email: 'pelanggan2@klinik.com', password: password.client, role: 'CLIENT', phone: '083444444444' },
  })

  const pelanggan3 = await prisma.user.upsert({
    where: { id: 'seed-pelanggan-3' },
    update: { name: 'Cici', email: 'pelanggan3@klinik.com', password: password.client, role: 'CLIENT', phone: '083555555555' },
    create: { id: 'seed-pelanggan-3', name: 'Cici', email: 'pelanggan3@klinik.com', password: password.client, role: 'CLIENT', phone: '083555555555' },
  })

  const hewan1 = await prisma.hewan.upsert({
    where: { id: 'seed-hewan-1' },
    update: { nama: 'Milo', jenis: 'ANJING', ras: 'Labrador', tanggalLahir: new Date('2020-06-01'), beratBadan: 25.5, pelangganId: pelanggan1.id },
    create: { id: 'seed-hewan-1', nama: 'Milo', jenis: 'ANJING', ras: 'Labrador', tanggalLahir: new Date('2020-06-01'), beratBadan: 25.5, pelangganId: pelanggan1.id },
  })

  const hewan2 = await prisma.hewan.upsert({
    where: { id: 'seed-hewan-2' },
    update: { nama: 'Kitty', jenis: 'KUCING', ras: 'Persia', tanggalLahir: new Date('2021-03-10'), beratBadan: 4.2, pelangganId: pelanggan2.id },
    create: { id: 'seed-hewan-2', nama: 'Kitty', jenis: 'KUCING', ras: 'Persia', tanggalLahir: new Date('2021-03-10'), beratBadan: 4.2, pelangganId: pelanggan2.id },
  })

  await prisma.appointment.upsert({
    where: { id: 'seed-appointment-1' },
    update: {
      pelangganId: pelanggan1.id,
      hewanId: hewan1.id,
      dokterId: dokter1.id,
      tanggal: new Date('2026-06-09T00:00:00.000Z'),
      waktu: '09:00',
      jenis: 'PEMERIKSAAN',
      keluhan: 'Batuk dan bersin',
    },
    create: {
      id: 'seed-appointment-1',
      pelangganId: pelanggan1.id,
      hewanId: hewan1.id,
      dokterId: dokter1.id,
      tanggal: new Date('2026-06-09T00:00:00.000Z'),
      waktu: '09:00',
      jenis: 'PEMERIKSAAN',
      keluhan: 'Batuk dan bersin',
    },
  })

  await prisma.appointment.upsert({
    where: { id: 'seed-appointment-2' },
    update: {
      pelangganId: pelanggan2.id,
      hewanId: hewan2.id,
      dokterId: dokter2.id,
      tanggal: new Date('2026-06-09T00:00:00.000Z'),
      waktu: '11:00',
      jenis: 'VAKSINASI',
      keluhan: 'Vaksin tahunan',
    },
    create: {
      id: 'seed-appointment-2',
      pelangganId: pelanggan2.id,
      hewanId: hewan2.id,
      dokterId: dokter2.id,
      tanggal: new Date('2026-06-09T00:00:00.000Z'),
      waktu: '11:00',
      jenis: 'VAKSINASI',
      keluhan: 'Vaksin tahunan',
    },
  })

  await prisma.jadwalDokter.upsert({
    where: { id: 'seed-jadwal-1' },
    update: { dokterId: dokter1.id, hari: 'SENIN', jamMulai: '08:00', jamSelesai: '12:00', isAktif: true },
    create: { id: 'seed-jadwal-1', dokterId: dokter1.id, hari: 'SENIN', jamMulai: '08:00', jamSelesai: '12:00', isAktif: true },
  })

  await prisma.jadwalDokter.upsert({
    where: { id: 'seed-jadwal-2' },
    update: { dokterId: dokter2.id, hari: 'SELASA', jamMulai: '13:00', jamSelesai: '17:00', isAktif: true },
    create: { id: 'seed-jadwal-2', dokterId: dokter2.id, hari: 'SELASA', jamMulai: '13:00', jamSelesai: '17:00', isAktif: true },
  })

  await prisma.inventory.upsert({
    where: { id: 'seed-inventory-1' },
    update: { namaItem: 'Paracetamol', kategori: 'OBAT', stok: 100, satuan: 'tablet', harga: 5000, stokMinimal: 10 },
    create: { id: 'seed-inventory-1', namaItem: 'Paracetamol', kategori: 'OBAT', stok: 100, satuan: 'tablet', harga: 5000, stokMinimal: 10 },
  })

  const inventory1 = await prisma.inventory.upsert({
    where: { id: 'seed-inventory-1' },
    update: { namaItem: 'Paracetamol', kategori: 'OBAT', stok: 100, satuan: 'tablet', harga: 5000, stokMinimal: 10 },
    create: { id: 'seed-inventory-1', namaItem: 'Paracetamol', kategori: 'OBAT', stok: 100, satuan: 'tablet', harga: 5000, stokMinimal: 10 },
  })

  await prisma.inventory.upsert({
    where: { id: 'seed-inventory-2' },
    update: { namaItem: 'Sarung Tangan', kategori: 'KONSUMABLE', stok: 200, satuan: 'pcs', harga: 2000, stokMinimal: 20 },
    create: { id: 'seed-inventory-2', namaItem: 'Sarung Tangan', kategori: 'KONSUMABLE', stok: 200, satuan: 'pcs', harga: 2000, stokMinimal: 20 },
  })

  await prisma.invoice.upsert({
    where: { id: 'seed-invoice-1' },
    update: {
      customerId: pelanggan1.id,
      hewanId: hewan1.id,
      total: 25000,
      status: 'DRAFT',
      items: {
        deleteMany: {},
        create: [
          { inventoryId: inventory1.id, namaItem: 'Paracetamol', quantity: 5, unitPrice: 5000, subTotal: 25000 },
        ],
      },
    },
    create: {
      id: 'seed-invoice-1',
      invoiceNumber: 'INV-0001',
      customerId: pelanggan1.id,
      hewanId: hewan1.id,
      total: 25000,
      status: 'DRAFT',
      items: {
        create: [
          { inventoryId: inventory1.id, namaItem: 'Paracetamol', quantity: 5, unitPrice: 5000, subTotal: 25000 },
        ],
      },
    },
  })

  await prisma.artikel.upsert({
    where: { id: 'seed-artikel-1' },
    update: {
      judul: 'Cara Merawat Kucing Anggora',
      slug: 'cara-merawat-kucing-anggora',
      konten: 'Konten contoh artikel tentang perawatan kucing Anggora.',
      isPublished: true,
    },
    create: {
      id: 'seed-artikel-1',
      judul: 'Cara Merawat Kucing Anggora',
      slug: 'cara-merawat-kucing-anggora',
      konten: 'Konten contoh artikel tentang perawatan kucing Anggora.',
      isPublished: true,
    },
  })

  await prisma.kontenLanding.upsert({
    where: { id: 'seed-landing-hero-tagline' },
    update: { section: 'hero', key: 'tagline', value: 'Kesehatan Hewan Peliharaan Anda, Prioritas Kami' },
    create: { id: 'seed-landing-hero-tagline', section: 'hero', key: 'tagline', value: 'Kesehatan Hewan Peliharaan Anda, Prioritas Kami' },
  })

  console.log({ admin: admin.email, dokter1: dokter1.email, pelanggan1: pelanggan1.email })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
