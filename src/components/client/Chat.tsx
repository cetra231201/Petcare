"use client"
import React, { useEffect, useState, useRef } from 'react'
import useSSE from '@/hooks/useSSE'

type Message = {
  id: string
  senderId: string
  receiverId: string
  isi: string
  createdAt: string
}

export default function Chat({ userId, peerId, appointmentId }: { userId?: string; peerId?: string; appointmentId?: string }) {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(userId)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [loadingUser, setLoadingUser] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (currentUserId) return
    async function loadUser() {
      setLoadingUser(true)
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const json = await res.json()
        setCurrentUserId(json.user?.id)
      }
      setLoadingUser(false)
    }
    loadUser()
  }, [currentUserId])

  useEffect(() => {
    async function load() {
      const qs = new URLSearchParams()
      if (appointmentId) qs.set('appointmentId', appointmentId)
      else if (peerId) qs.set('senderId', peerId)
      const res = await fetch('/api/konsultasi?' + qs.toString())
      const json = await res.json()
      setMessages(json.data || [])
      scrollBottom()
    }
    load()
  }, [peerId, appointmentId])

  useSSE(currentUserId, (payload) => {
    if (!peerId || payload.senderId === peerId || payload.receiverId === peerId) {
      setMessages((m) => [...m, payload])
      scrollBottom()
    }
  })

  function scrollBottom() {
    setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 50)
  }

  async function send() {
    if (!text.trim() || !currentUserId) return
    const body = { senderId: currentUserId, receiverId: peerId, appointmentId, isi: text }
    const res = await fetch('/api/konsultasi', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })
    if (res.ok) {
      setText('')
    }
  }

  if (loadingUser) {
    return <div className="rounded-xl bg-white p-4 text-sm text-slate-500">Memuat konsultasi...</div>
  }

  if (!currentUserId) {
    return <div className="rounded-xl bg-white p-4 text-sm text-slate-500">Tidak dapat memuat chat tanpa user yang valid.</div>
  }

  return (
    <div className="border rounded p-2 bg-white max-w-2xl">
      <div ref={listRef} className="h-64 overflow-auto p-2 space-y-2">
        {messages.map((m) => (
          <div key={m.id} className={`p-2 rounded ${m.senderId === currentUserId ? 'bg-teal-50 self-end' : 'bg-gray-100'}`}>
            <div className="text-sm">{m.isi}</div>
            <div className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 border p-2 rounded" placeholder="Tulis pesan..." />
        <button onClick={send} className="px-3 py-2 bg-teal-600 text-white rounded">Kirim</button>
      </div>
    </div>
  )
}
