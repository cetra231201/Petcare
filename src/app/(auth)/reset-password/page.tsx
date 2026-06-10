"use client"

import React, { Suspense } from 'react'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-teal-50">Memuat...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
