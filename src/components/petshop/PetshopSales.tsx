"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useInventory from '@/hooks/useInventory'
import useInvoice from '@/hooks/useInvoice'
import useService from '@/hooks/useService'
import { invoiceSchema } from '@/lib/schemas'
import { toast } from '@/components/shared/Toast'

type InvoiceFormValues = {
  customerId: string
  hewanId?: string
}

type InvoiceItemLine = {
  inventoryId?: string
  serviceId?: string
  namaItem: string
  quantity: number
  unitPrice: number
}

export default function PetshopSales({ role }: { role: 'ADMIN' | 'STAFF' }) {
  const [customers, setCustomers] = useState<any[]>([])
  const [hewans, setHewans] = useState<any[]>([])
  const [items, setItems] = useState<InvoiceItemLine[]>([{ namaItem: '', quantity: 1, unitPrice: 0 }])
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema.pick({ customerId: true, hewanId: true })),
    defaultValues: { customerId: '', hewanId: '' },
  })

  const customerId = watch('customerId')
  const inventoryQuery = useInventory({ all: true })
  const serviceQuery = useService()
  const { create } = useInvoice()
  const inventoryItems = (inventoryQuery.query.data as { data: any[] } | undefined)?.data || []
  const serviceItems = (serviceQuery.query.data as { data: any[] } | undefined)?.data || []

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

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [items])

  const handleAddItem = () => {
    setItems((prev) => [...prev, { namaItem: '', quantity: 1, unitPrice: 0 }])
  }

  const handleItemChange = (index: number, field: keyof InvoiceItemLine, value: string | number) => {
    setItems((prev) => prev.map((item, idx) => idx === index ? ({
      ...item,
      [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) : value,
    }) : item))
  }

  const handleInventorySelect = (index: number, inventoryId: string) => {
    const inventory = inventoryItems.find((item) => item.id === inventoryId)
    setItems((prev) => prev.map((item, idx) => idx === index ? ({
      ...item,
      inventoryId: inventory?.id,
      serviceId: undefined,
      namaItem: inventory?.namaItem || item.namaItem,
      unitPrice: inventory?.harga ?? item.unitPrice,
    }) : item))
  }

  const handleServiceSelect = (index: number, serviceId: string) => {
    const service = serviceItems.find((item) => item.id === serviceId)
    setItems((prev) => prev.map((item, idx) => idx === index ? ({
      ...item,
      serviceId: service?.id,
      inventoryId: undefined,
      namaItem: service?.nama || item.namaItem,
      unitPrice: service?.harga ?? item.unitPrice,
    }) : item))
  }

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleSubmitInvoice = async (values: InvoiceFormValues) => {
    try {
      const payload = { ...values, items }
      const parsed = invoiceSchema.parse(payload)
      await create.mutateAsync(parsed)
      reset({ customerId: '', hewanId: '' })
      setItems([{ namaItem: '', quantity: 1, unitPrice: 0 }])
      setStatusMessage('Invoice petshop berhasil dibuat sebagai draft.')
    } catch (err: any) {
      toast(err.message || 'Gagal membuat invoice')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-teal-700">POS Klinik dan Penjualan Petshop</h2>
        <p className="mt-1 text-sm text-slate-500">Buat invoice untuk layanan dan produk, lengkap dengan pilihan layanan klinik dan stok inventory.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Form Kasir</h3>
          <form onSubmit={handleSubmit(handleSubmitInvoice)} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Pelanggan</label>
                <select {...register('customerId')} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5">
                  <option value="">Pilih pelanggan</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
                {errors.customerId && <p className="mt-1 text-xs text-red-600">{errors.customerId.message}</p>}
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
              {items.map((item, index) => {
                const selectedInventory = inventoryItems.find((inventory) => inventory.id === item.inventoryId)
                const selectedService = serviceItems.find((service) => service.id === item.serviceId)
                return (
                  <div key={index} className="rounded-2xl border border-slate-200 p-4">
                    <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Pilih Produk</label>
                        <select value={item.inventoryId || ''} onChange={(event) => handleInventorySelect(index, event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5">
                          <option value="">Pilih item inventory</option>
                          {inventoryItems.map((inventory) => (
                            <option key={inventory.id} value={inventory.id}>
                              {inventory.namaItem} (stok {inventory.stok})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Pilih Layanan</label>
                        <select value={item.serviceId || ''} onChange={(event) => handleServiceSelect(index, event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5">
                          <option value="">Pilih layanan klinik</option>
                          {serviceItems.map((service) => (
                            <option key={service.id} value={service.id}>{service.nama} - Rp {service.harga.toLocaleString('id-ID')}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_1fr]">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Nama Item / Layanan</label>
                        <input value={item.namaItem} onChange={(e) => handleItemChange(index, 'namaItem', e.target.value)} placeholder="Nama item atau layanan" className="mt-1 w-full rounded-xl border border-slate-200 p-2.5" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Qty</label>
                        <input type="number" min={1} value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Harga Satuan</label>
                        <input type="number" min={0} value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5" />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm text-slate-500">{selectedInventory ? `Stok tersedia: ${selectedInventory.stok} ${selectedInventory.satuan}` : selectedService ? `Layanan: ${selectedService.kategori ?? 'Umum'}` : 'Masukkan detail manual atau pilih item.'}</div>
                      <button type="button" onClick={() => handleRemoveItem(index)} className="rounded-xl bg-red-600 px-3 py-2 text-white">Hapus</button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-slate-500">Total transaksi</div>
                <div className="text-2xl font-semibold">Rp {subtotal.toLocaleString('id-ID')}</div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={handleAddItem} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Tambah Baris</button>
                <button type="submit" className="rounded-xl bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">Buat Invoice</button>
              </div>
            </div>
          </form>
          {statusMessage && <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">{statusMessage}</div>}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Stok Real-time</h3>
            <p className="mt-1 text-sm text-slate-500">Pantau stok produk saat membuat invoice.</p>
            <div className="mt-4 space-y-3">
              {inventoryQuery.query.isLoading && <div>Loading...</div>}
              {!inventoryQuery.query.isLoading && inventoryItems.length === 0 && <div className="text-sm text-slate-500">Tidak ada barang di inventory.</div>}
              {inventoryItems.slice(0, 8).map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                  <div>
                    <div className="font-medium">{item.namaItem}</div>
                    <div className="text-sm text-slate-500">{item.kategori}</div>
                  </div>
                  <div className="text-sm text-slate-700">{item.stok} {item.satuan}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Layanan Klinik</h3>
            <p className="mt-1 text-sm text-slate-500">Pilih layanan klinik untuk ditambahkan ke invoice.</p>
            <div className="mt-4 space-y-2">
              {serviceQuery.query.isLoading && <div>Loading layanan...</div>}
              {!serviceQuery.query.isLoading && serviceItems.length === 0 && <div className="text-sm text-slate-500">Belum ada layanan terdaftar.</div>}
              {serviceItems.slice(0, 6).map((service) => (
                <div key={service.id} className="rounded-2xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold">{service.nama}</div>
                      <div className="text-sm text-slate-500">{service.kategori || 'Umum'}</div>
                    </div>
                    <div className="text-xs rounded-full bg-slate-100 px-3 py-1 text-slate-700">Rp {service.harga.toLocaleString('id-ID')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
