import React from 'react'
import { Document, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer'
import type { Appointment, Hewan, User } from '@/types'

type AppointmentReportItem = Omit<Appointment, 'hewan' | 'pelanggan' | 'dokter'> & {
  hewan?: { nama?: string | null }
  pelanggan?: { name?: string | null }
  dokter?: { name?: string | null } | null
}

export const generateHewanCardDocument = (hewan: Hewan, owner: User) => {
  const styles = StyleSheet.create({
    page: { padding: 28, backgroundColor: '#f8fafc', fontFamily: 'Helvetica' },
    brand: { fontSize: 12, color: '#0f766e', letterSpacing: 1, marginBottom: 6 },
    header: { fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 },
    subheader: { fontSize: 10, color: '#475569', marginBottom: 18 },
    card: { padding: 14, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#dbeafe', marginBottom: 10 },
    label: { fontSize: 9, color: '#64748b', marginBottom: 3 },
    value: { fontSize: 12, color: '#0f172a', fontWeight: 600 },
    footer: { position: 'absolute', bottom: 20, left: 28, right: 28, fontSize: 9, color: '#94a3b8', textAlign: 'center' },
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>KLINIK HEWAN</Text>
        <Text style={styles.header}>Kartu Digital Hewan</Text>
        <Text style={styles.subheader}>Ringkasan identitas hewan peliharaan dan pemilik terdaftar.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Nama Hewan</Text>
          <Text style={styles.value}>{hewan.nama}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Jenis dan Ras</Text>
          <Text style={styles.value}>{hewan.jenis} {hewan.ras ? `• ${hewan.ras}` : ''}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Tanggal Lahir</Text>
          <Text style={styles.value}>{hewan.tanggalLahir ? new Date(hewan.tanggalLahir).toLocaleDateString('id-ID') : '-'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Berat Badan</Text>
          <Text style={styles.value}>{hewan.beratBadan ?? '-'} kg</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Pemilik</Text>
          <Text style={styles.value}>{owner?.name ?? '-'}</Text>
        </View>

        <Text style={styles.footer}>Dokumen ini dihasilkan otomatis oleh sistem klinik dan berlaku sebagai salinan digital internal.</Text>
      </Page>
    </Document>
  )
}

export const generateRekamMedisDocument = (rekam: {
  keluhan?: string | null
  diagnosis?: string | null
  tindakan?: string | null
  resep?: string | null
  obat?: string | null
  perawatan?: string | null
  dosis?: string | null
  catatanPerawatan?: string | null
  catatanDokter?: string | null
}) => {
  const styles = StyleSheet.create({
    page: { padding: 28, backgroundColor: '#f8fafc', fontFamily: 'Helvetica' },
    brand: { fontSize: 12, color: '#0f766e', letterSpacing: 1, marginBottom: 6 },
    header: { fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 },
    subheader: { fontSize: 10, color: '#475569', marginBottom: 18 },
    section: { padding: 14, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
    label: { fontSize: 9, color: '#64748b', marginBottom: 3 },
    value: { fontSize: 12, color: '#0f172a', fontWeight: 600 },
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>KLINIK HEWAN</Text>
        <Text style={styles.header}>Rekam Medis</Text>
        <Text style={styles.subheader}>Catatan pemeriksaan, diagnosis, dan tindak lanjut pasien.</Text>
        <View style={styles.section}><Text style={styles.label}>Keluhan</Text><Text style={styles.value}>{rekam.keluhan || '-'}</Text></View>
        <View style={styles.section}><Text style={styles.label}>Diagnosis</Text><Text style={styles.value}>{rekam.diagnosis || '-'}</Text></View>
        <View style={styles.section}><Text style={styles.label}>Tindakan</Text><Text style={styles.value}>{rekam.tindakan || '-'}</Text></View>
        <View style={styles.section}><Text style={styles.label}>Obat</Text><Text style={styles.value}>{rekam.obat || '-'}</Text></View>
        <View style={styles.section}><Text style={styles.label}>Perawatan</Text><Text style={styles.value}>{rekam.perawatan || '-'}</Text></View>
        <View style={styles.section}><Text style={styles.label}>Dosis</Text><Text style={styles.value}>{rekam.dosis || '-'}</Text></View>
        <View style={styles.section}><Text style={styles.label}>Catatan Treatment</Text><Text style={styles.value}>{rekam.catatanPerawatan || '-'}</Text></View>
        <View style={styles.section}><Text style={styles.label}>Resep</Text><Text style={styles.value}>{rekam.resep || '-'}</Text></View>
      </Page>
    </Document>
  )
}

export const generateAppointmentsPdfDocument = (appointments: AppointmentReportItem[]) => {
  const styles = StyleSheet.create({
    page: { padding: 28, backgroundColor: '#f8fafc', fontFamily: 'Helvetica' },
    brand: { fontSize: 12, color: '#0f766e', letterSpacing: 1, marginBottom: 6 },
    header: { fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 },
    subheader: { fontSize: 10, color: '#475569', marginBottom: 18 },
    section: { marginBottom: 10, padding: 14, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0' },
    item: { fontSize: 11, color: '#0f172a', marginBottom: 4 },
    label: { color: '#64748b' },
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>KLINIK HEWAN</Text>
        <Text style={styles.header}>Laporan Janji Temu</Text>
        <Text style={styles.subheader}>Rekap daftar janji temu yang dapat dibagikan ke manajemen atau dicetak sebagai arsip.</Text>
        {appointments.map((appt, index) => {
          const tanggal = appt.tanggal ? new Date(appt.tanggal).toLocaleDateString('id-ID') : '-'
          return (
            <View key={appt.id || index} style={styles.section}>
              <Text style={styles.item}><Text style={styles.label}>No:</Text> {index + 1}</Text>
              <Text style={styles.item}><Text style={styles.label}>Tanggal:</Text> {tanggal}</Text>
              <Text style={styles.item}><Text style={styles.label}>Waktu:</Text> {appt.waktu}</Text>
              <Text style={styles.item}><Text style={styles.label}>Jenis:</Text> {appt.jenis}</Text>
              <Text style={styles.item}><Text style={styles.label}>Hewan:</Text> {appt.hewan?.nama || '-'}</Text>
              <Text style={styles.item}><Text style={styles.label}>Pemilik:</Text> {appt.pelanggan?.name || '-'}</Text>
              <Text style={styles.item}><Text style={styles.label}>Dokter:</Text> {appt.dokter?.name || '-'}</Text>
            </View>
          )
        })}
      </Page>
    </Document>
  )
}

export async function createPdfBufferFromDocument(docElement: React.ReactElement) {
  try {
    const doc = pdf(docElement)
    // Note: In @react-pdf/renderer v4, pdf() returns an object with toBuffer() method
    // This is the correct approach (renderToBuffer was deprecated in v4)
    const buffer = await doc.toBuffer()
    return buffer
  } catch (error) {
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}
