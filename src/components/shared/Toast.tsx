"use client"
import React from 'react'
import { Toaster, toast as sonnerToast } from 'sonner'

export const toast = Object.assign(
  (message: string) => sonnerToast(message),
  {
    success: (message: string) => sonnerToast.success(message),
    error: (message: string) => sonnerToast.error(message),
    warning: (message: string) => sonnerToast.warning(message),
    info: (message: string) => sonnerToast.info(message),
    loading: (message: string) => sonnerToast.loading(message),
  },
)

export default function ToastContainer() {
  return <Toaster position="top-right" richColors closeButton />
}
