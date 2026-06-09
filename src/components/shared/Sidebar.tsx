"use client"
import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'

const NAV_LINKS: Record<string, { label: string; href: string }[]> = {
  ADMIN: [
    { label: 'Dashboard', href: '/dashboard/admin' },
    { label: 'Appointment', href: '/dashboard/admin/appointment' },
    { label: 'Jadwal Dokter', href: '/dashboard/admin/jadwal-dokter' },
    { label: 'Users', href: '/dashboard/admin/users' },
    { label: 'Inventory', href: '/dashboard/admin/inventory' },
    { label: 'Petshop', href: '/dashboard/admin/petshop' },
    { label: 'Invoice', href: '/dashboard/admin/invoice' },
    { label: 'Reports', href: '/dashboard/admin/reports' },
  ],
  STAFF: [
    { label: 'Dashboard', href: '/dashboard/staff' },
    { label: 'Appointment', href: '/dashboard/staff/appointment' },
    { label: 'Inventory', href: '/dashboard/staff/inventory' },
    { label: 'Petshop', href: '/dashboard/staff/petshop' },
    { label: 'Invoice', href: '/dashboard/staff/invoice' },
  ],
  DOKTER: [
    { label: 'Dashboard', href: '/dashboard/dokter' },
    { label: 'Antrian', href: '/dashboard/dokter/antrian' },
    { label: 'Rekam Medis', href: '/dashboard/dokter/rekam-medis' },
    { label: 'Monitoring', href: '/dashboard/dokter/monitoring' },
    { label: 'Riwayat', href: '/dashboard/dokter/riwayat' },
  ],
  CLIENT: [
    { label: 'Dashboard', href: '/dashboard/pelanggan' },
    { label: 'Appointment', href: '/dashboard/pelanggan/appointment' },
    { label: 'Monitoring', href: '/dashboard/pelanggan/monitoring' },
    { label: 'Riwayat', href: '/dashboard/pelanggan/riwayat' },
    { label: 'Hewan Saya', href: '/dashboard/pelanggan/hewan' },
    { label: 'Profil', href: '/dashboard/pelanggan/profil' },
  ],
}

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const links = NAV_LINKS[role] || NAV_LINKS.CLIENT

  return (
    <aside className="w-64 bg-white border-r p-4 hidden md:block">
      <div className="mb-6 text-xl font-semibold text-teal-700">Klinik Hewan</div>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${pathname === link.href || pathname.startsWith(`${link.href}/`) ? 'bg-teal-600 text-white' : 'hover:bg-teal-50 text-slate-700'}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8 pt-6 border-t text-sm text-slate-500">Silakan pilih menu di atas untuk mengelola klinik.</div>
    </aside>
  )
}
