"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [login, setLogin] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }
    let ignore = false
    async function load() {
      const res = await fetch('/api/admin/settings')
      if (!res.ok) return
      const data = await res.json()
      if (!ignore) {
        setLogin(data.login || '')
        setEmail(data.email || '')
      }
    }
    load()
    return () => { ignore = true }
  }, [status, session, router])

  const save = async () => {
    setSaving(true)
    try {
      const payload: { login?: string; email?: string; password?: string } = {}
      const trimmedLogin = login.trim()
      if (trimmedLogin) payload.login = trimmedLogin
      const trimmedEmail = email.trim()
      payload.email = trimmedEmail
      if (password) payload.password = password
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const data = await res.json().catch(() => null)
        if (data) {
          setLogin(data.login || trimmedLogin)
          setEmail(data.email || '')
        }
        // If email changed propagate to session so top bar updates instantly
        if ((payload.login && payload.login !== session?.user.login) || (payload.email !== undefined && payload.email !== session?.user.email)) {
          // Force client to refetch session by calling the built-in session endpoint
          try { await fetch('/api/auth/session?update') } catch {}
        }
        setPassword('')
      }
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') return <div className="py-10">Загрузка...</div>
  if (!session || session.user.role !== 'ADMIN') return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold heading">Настройки администратора</h1>
        <Button onClick={save} disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Учетные данные</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Логин администратора</label>
            <Input type="text" value={login} onChange={e=>setLogin(e.target.value)} placeholder="admin" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Email администратора (опционально)</label>
            <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com" />
          </div>
          <div>
            <label className="block text-sm mb-1">Новый пароль (необязательно)</label>
            <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="******" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
