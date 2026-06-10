"use client"
import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'
import {
  Activity,
  BarChart,
  CalendarDays,
  CreditCard,
  HeartPulse,
  Home,
  Package,
  PawPrint,
  ShoppingBag,
  Stethoscope,
  Users,
  X,
} from 'lucide-react'

type NavLink = {
  label: string
  href: string
  icon: React.ReactNode
}

const NAV_LINKS: Record<string, NavLink[]> = {
  ADMIN: [
    { label: 'Dashboard', href: '/dashboard/admin', icon: <Home size={18} /> },
    { label: 'Appointment', href: '/dashboard/admin/appointment', icon: <CalendarDays size={18} /> },
    { label: 'Jadwal Dokter', href: '/dashboard/admin/jadwal-dokter', icon: <Stethoscope size={18} /> },
    { label: 'Users', href: '/dashboard/admin/users', icon: <Users size={18} /> },
    { label: 'Inventory', href: '/dashboard/admin/inventory', icon: <Package size={18} /> },
    { label: 'Petshop', href: '/dashboard/admin/petshop', icon: <ShoppingBag size={18} /> },
    { label: 'Invoice', href: '/dashboard/admin/invoice', icon: <CreditCard size={18} /> },
    { label: 'Reports', href: '/dashboard/admin/reports', icon: <BarChart size={18} /> },
  ],
  STAFF: [
    { label: 'Dashboard', href: '/dashboard/staff', icon: <Home size={18} /> },
    { label: 'Appointment', href: '/dashboard/staff/appointment', icon: <CalendarDays size={18} /> },
    { label: 'Inventory', href: '/dashboard/staff/inventory', icon: <Package size={18} /> },
    { label: 'Petshop', href: '/dashboard/staff/petshop', icon: <ShoppingBag size={18} /> },
    { label: 'Invoice', href: '/dashboard/staff/invoice', icon: <CreditCard size={18} /> },
  ],
  DOKTER: [
    { label: 'Dashboard', href: '/dashboard/dokter', icon: <Home size={18} /> },
    { label: 'Antrian', href: '/dashboard/dokter/antrian', icon: <Activity size={18} /> },
    { label: 'Rekam Medis', href: '/dashboard/dokter/rekam-medis', icon: <HeartPulse size={18} /> },
    { label: 'Monitoring', href: '/dashboard/dokter/monitoring', icon: <CalendarDays size={18} /> },
    { label: 'Riwayat', href: '/dashboard/dokter/riwayat', icon: <Users size={18} /> },
  ],
  CLIENT: [
    { label: 'Dashboard', href: '/dashboard/client', icon: <Home size={18} /> },
    { label: 'Appointment', href: '/dashboard/client/appointment', icon: <CalendarDays size={18} /> },
    { label: 'Monitoring', href: '/dashboard/client/monitoring', icon: <HeartPulse size={18} /> },
    { label: 'Riwayat', href: '/dashboard/client/riwayat', icon: <Users size={18} /> },
    { label: 'Hewan Saya', href: '/dashboard/client/hewan', icon: <PawPrint size={18} /> },
    { label: 'Profil', href: '/dashboard/client/profil', icon: <Users size={18} /> },
  ],
}

export default function Sidebar({ role, isOpen, onClose }: { role: string; isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const links = NAV_LINKS[role] || NAV_LINKS.CLIENT

  return (
    <>
      <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:border-slate-200 md:bg-slate-100 md:px-4 md:py-6">
        <div className="mb-8 flex items-center justify-between rounded-3xl bg-white px-4 py-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-teal-700">Klinik Hewan</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Panel Admin</h2>
          </div>
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-white hover:text-teal-700'
                }`}
              >
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${isActive ? 'bg-teal-500/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-700'}`}>
                  {link.icon}
                </span>
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto rounded-3xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <p className="font-semibold text-slate-900">Dashboard Klinik</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">Akses cepat, navigasi jelas, dan informasi utama selalu tersedia.</p>
        </div>
      </aside>

      <div className={`fixed inset-0 z-40 md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
        <aside className="relative h-full w-80 overflow-y-auto bg-white p-5 shadow-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-teal-700">Klinik Hewan</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Menu</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>
          <nav className="space-y-2">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-teal-600 text-white' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">{link.icon}</span>
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </aside>
      </div>
    </>
  )
}
