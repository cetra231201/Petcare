'use client'

import React from 'react'

type StatusType = 'MENUNGGU' | 'DIKONFIRMASI' | 'SELESAI' | 'DIBATALKAN' | 'PENDING' | 'PAID' | 'VOID'

interface StatusBadgeProps {
  status: StatusType | string
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<string, { color: string; label: string; bgColor: string }> = {
  MENUNGGU: { color: 'text-amber-700', label: 'Menunggu', bgColor: 'bg-amber-50' },
  DIKONFIRMASI: { color: 'text-sky-700', label: 'Dikonfirmasi', bgColor: 'bg-sky-50' },
  SELESAI: { color: 'text-emerald-700', label: 'Selesai', bgColor: 'bg-emerald-50' },
  DIBATALKAN: { color: 'text-rose-700', label: 'Dibatalkan', bgColor: 'bg-rose-50' },
  PENDING: { color: 'text-amber-700', label: 'Pending', bgColor: 'bg-amber-50' },
  PAID: { color: 'text-emerald-700', label: 'Paid', bgColor: 'bg-emerald-50' },
  VOID: { color: 'text-slate-600', label: 'Void', bgColor: 'bg-slate-100' },
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.MENUNGGU
  const sizeClass = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  }[size]

  return (
    <span
      className={`inline-block rounded-full font-semibold ${sizeClass} ${config.bgColor} ${config.color}`}
    >
      {config.label}
    </span>
  )
}

export function getStatusLabel(status: string): string {
  return statusConfig[status]?.label || status
}
