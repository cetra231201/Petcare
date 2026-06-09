"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { invoiceSchema } from '@/lib/schemas'
import useInvoice from '@/hooks/useInvoice'
import { toast } from '@/components/shared/Toast'

const STATUS_LABELS: Record<string, string> = {
  '': 'Semua',
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Menunggu Persetujuan',
  APPROVED: 'Disetujui',
  PRINTED: 'Dicetak',
  PAID: 'Lunas',
  VOID: 'Void',
}

type InvoiceFormValues = {
  customerId: string
  hewanId?: string
}

type InvoiceItem = {
  inventoryId?: string
  namaItem: string
  quantity: number
  unitPrice: number
}

export default function InvoiceDashboard({ role }: { role: 'ADMIN' | 'STAFF' }) {
  const [customers, setCustomers] = useState<any[]>([])
  const [hewans, setHewans] = useState<any[]>([])
  const [items, setItems] = useState<InvoiceItem[]>([{ namaItem: '', quantity: 1, unitPrice: 0 }])
  const [statusFilter, setStatusFilter] = useState('')
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema.pick({ customerId: true, hewanId: true })),
    defaultValues: { customerId: '', hewanId: '' },
  })

  const customerId = watch('customerId')
  const { query, create, update, approve, printInvoice, voidInvoice } = useInvoice(statusFilter || undefined)
  const invoices = (query.data as { data: any[] } | undefined)?.data || []

  useEffect(() => {
    fetch('/api/users?role=CLIENT')
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => setCustomers(data.data || []))
      .catch(() => toast('Gagal memuat pelanggan'))
  }, [])

  useEffect(() => {
    if (!customerId) {
      setHewans([])
      return
    }
    fetch(`/api/hewan?pelangganId=${customerId}`)
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => setHewans(data.data || []))
      .catch(() => setHewans([]))
  }, [customerId])

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  }, [items])

  const handleAddItem = () => {
    setItems((prev) => [...prev, { namaItem: '', quantity: 1, unitPrice: 0 }])
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => prev.map((item, idx) => idx === index ? { ...item, [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) : value } : item))
  }

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleCreate = async (values: InvoiceFormValues) => {
    try {
      const payload = { ...values, items }
      const parsed = invoiceSchema.parse(payload)
      await create.mutateAsync(parsed)
      reset({ customerId: '', hewanId: '' })
      setItems([{ namaItem: '', quantity: 1, unitPrice: 0 }])
      toast('Invoice dibuat sebagai draft')
    } catch (err: any) {
      toast(err?.message || 'Gagal membuat invoice')
    }
  }

  const handleSubmitForApproval = async (invoiceId: string) => {
    try {
      await update.mutateAsync({ id: invoiceId, data: { status: 'PENDING_APPROVAL' } })
      toast('Invoice dikirim ke persetujuan')
    } catch (err: any) {
      toast(err?.message || 'Gagal mengirim invoice')
    }
  }

  const handleApprove = async (invoiceId: string) => {
    try {
      await approve.mutateAsync(invoiceId)
      toast('Invoice disetujui')
    } catch (err: any) {
      toast(err?.message || 'Gagal approve invoice')
    }
  }

  const handlePrint = async (invoiceId: string) => {
    try {
      await printInvoice.mutateAsync(invoiceId)
      toast('Invoice dicetak dan data dikunci')
    } catch (err: any) {
      toast(err?.message || 'Gagal print invoice')
    }
  }

  const handleVoid = async (invoiceId: string) => {
    const reason = prompt('Masukkan alasan void untuk invoice ini:')?.trim()
    if (!reason) {
      toast('Void dibatalkan karena alasan kosong')
      return
    }

    try {
      await voidInvoice.mutateAsync({ id: invoiceId, voidReason: reason })
      toast('Invoice divoid')
    } catch (err: any) {
      toast(err?.message || 'Gagal void invoice')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-teal-700">Invoice</h2>
        <p className="mt-1 text-sm text-slate-500">Buat dan kelola invoice. Data dikunci setelah dicetak.</p>
      </div>

      {(role === 'STAFF' || role === 'ADMIN') && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Buat Invoice Baru</h3>
          <p className="mt-1 text-sm text-slate-500">Invoice yang dibuat akan berstatus draft, lalu dapat dikirim ke approval.</p>
          <form onSubmit={handleSubmit(handleCreate)} className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Pelanggan</label>
                <select {...register('customerId')} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5">
                  <option value="">Pilih pelanggan</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
                {errors.customerId && <p className="mt-1 text-xs text-red-600">{errors.customerId?.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Hewan (opsional)</label>
                <select {...register('hewanId')} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5">
                  <option value="">Tanpa hewan</option>
                  {hewans.map((hewan) => (
                    <option key={hewan.id} value={hewan.id}>{hewan.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 p-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <input
                        value={item.namaItem}
                        onChange={(e) => handleItemChange(index, 'namaItem', e.target.value)}
                        placeholder="Nama item"
                        className="w-full rounded-xl border border-slate-200 p-2.5"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={item.quantity}
                        min={1}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        placeholder="Jumlah"
                        className="w-full rounded-xl border border-slate-200 p-2.5"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={item.unitPrice}
                        min={0}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        placeholder="Harga satuan"
                        className="w-full rounded-xl border border-slate-200 p-2.5"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => handleRemoveItem(index)} className="rounded-xl bg-red-600 px-3 py-2 text-sm text-white">Hapus</button>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={handleAddItem} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Tambah item</button>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-slate-500">Subtotal</div>
                <div className="text-xl font-semibold">Rp {subtotal.toLocaleString('id-ID')}</div>
              </div>
              <button type="submit" disabled={create.isLoading} className="rounded-xl bg-teal-600 px-4 py-2 text-white transition hover:bg-teal-700 disabled:opacity-50">Buat Draft Invoice</button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Daftar Invoice</h3>
            <p className="mt-1 text-sm text-slate-500">Filter berdasarkan status dan lakukan approval / print.</p>
          </div>
          <div className="space-x-2">
            <label className="text-sm text-slate-600">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 p-2.5">
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {query.isLoading && <div>Loading...</div>}
          {!query.isLoading && invoices.length === 0 && <div className="text-sm text-slate-500">Tidak ada invoice ditemukan.</div>}
          {invoices.map((invoice) => (
            <div key={invoice.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-start">
                <div className="space-y-1">
                  <div className="text-sm text-slate-500">{invoice.invoiceNumber}</div>
                  <div className="text-lg font-semibold">{invoice.customer?.name || 'Pelanggan tidak diketahui'}</div>
                  <div className="text-sm text-slate-600">Total: Rp {invoice.total.toLocaleString('id-ID')}</div>
                  <div className="text-sm text-slate-600">Status: {STATUS_LABELS[invoice.status] || invoice.status}</div>
                  {invoice.approvedAt && <div className="text-sm text-slate-600">Disetujui oleh {invoice.approvedBy?.name || 'Admin'} pada {new Date(invoice.approvedAt).toLocaleString('id-ID')}</div>}
                  {invoice.printedAt && <div className="text-sm text-slate-600">Dicetak oleh {invoice.printedBy?.name || 'Admin'} pada {new Date(invoice.printedAt).toLocaleString('id-ID')}</div>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {invoice.status === 'DRAFT' && role === 'STAFF' && (
                    <button onClick={() => handleSubmitForApproval(invoice.id)} className="rounded-xl bg-blue-600 px-3 py-2 text-sm text-white">Kirim Approval</button>
                  )}
                  {role === 'ADMIN' && (invoice.status === 'DRAFT' || invoice.status === 'PENDING_APPROVAL') && (
                    <button onClick={() => handleApprove(invoice.id)} className="rounded-xl bg-teal-600 px-3 py-2 text-sm text-white">Approve</button>
                  )}
                  {invoice.status === 'APPROVED' && (
                    <button onClick={() => handlePrint(invoice.id)} className="rounded-xl bg-indigo-600 px-3 py-2 text-sm text-white">Print</button>
                  )}
                  {role === 'ADMIN' && invoice.status !== 'VOID' && invoice.status !== 'PAID' && (
                    <button onClick={() => handleVoid(invoice.id)} className="rounded-xl bg-red-600 px-3 py-2 text-sm text-white">Void</button>
                  )}
                </div>
              </div>
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-sm font-semibold text-slate-700">Item Invoice</div>
                <div className="mt-3 grid gap-3 text-sm text-slate-700 md:grid-cols-[2fr_1fr_1fr_1fr]">
                  <div className="font-semibold">Nama Item</div>
                  <div className="font-semibold">Jumlah</div>
                  <div className="font-semibold">Harga / satuan</div>
                  <div className="font-semibold">Subtotal</div>
                </div>
                {invoice.items.map((item: any) => (
                  <div key={item.id} className="mt-2 grid gap-3 text-sm text-slate-700 md:grid-cols-[2fr_1fr_1fr_1fr]">
                    <div>{item.namaItem}</div>
                    <div>{item.quantity}</div>
                    <div>Rp {item.unitPrice.toLocaleString('id-ID')}</div>
                    <div>Rp {item.subTotal.toLocaleString('id-ID')}</div>
                  </div>
                ))}
              </div>
              {invoice.voidReason && <div className="mt-3 text-sm text-red-600">Alasan void: {invoice.voidReason}</div>}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
