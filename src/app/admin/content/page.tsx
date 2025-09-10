"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type ContentType = 'HOME' | 'CONTACTS' | 'ABOUT'

type HomeData = { heroTitle?: string; heroSubtitle?: string }
type ContactsData = {
  intro?: string
  requisites?: string
  phoneTel?: string
  emailInfo?: string
  emailSales?: string
  addressCityRegion?: string
  addressStreet?: string
  whatsappNumber?: string
  telegramUsername?: string
}
type AboutData = { intro?: string; companyText?: string }

interface ContentRecord<T = unknown> {
  id?: string
  page: ContentType
  data: T
}

export default function ContentAdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [active, setActive] = useState<ContentType>('HOME')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [home, setHome] = useState({ heroTitle: '', heroSubtitle: '' })
  const [contacts, setContacts] = useState<Required<ContactsData>>({
    intro: '',
    requisites: '',
    phoneTel: '',
    emailInfo: '',
    emailSales: '',
    addressCityRegion: '',
    addressStreet: '',
    whatsappNumber: '',
    telegramUsername: '',
  })
  const [about, setAbout] = useState({ intro: '', companyText: '' })

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }
  }, [status, session, router])

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      try {
        const types: ContentType[] = ['HOME','CONTACTS','ABOUT']
        await Promise.all(types.map(async (t) => {
          const res = await fetch(`/api/admin/content?type=${t}`)
          if (!res.ok) return
          const rec: ContentRecord<HomeData|ContactsData|AboutData> | null = await res.json()
          if (ignore || !rec) return
          if (rec.page === 'HOME') {
            const d = rec.data as HomeData
            setHome({ heroTitle: d?.heroTitle || '', heroSubtitle: d?.heroSubtitle || '' })
          }
          if (rec.page === 'CONTACTS') {
            const d = rec.data as ContactsData
            setContacts({
              intro: d?.intro || '',
              requisites: d?.requisites || '',
              phoneTel: d?.phoneTel || '',
              emailInfo: d?.emailInfo || '',
              emailSales: d?.emailSales || '',
              addressCityRegion: d?.addressCityRegion || '',
              addressStreet: d?.addressStreet || '',
              whatsappNumber: d?.whatsappNumber || '',
              telegramUsername: d?.telegramUsername || '',
            })
          }
          if (rec.page === 'ABOUT') {
            const d = rec.data as AboutData
            setAbout({ intro: d?.intro || '', companyText: d?.companyText || '' })
          }
        }))
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const payloads: Array<{ type: ContentType; data: HomeData|ContactsData|AboutData }> = [
        { type: 'HOME', data: home },
        { type: 'CONTACTS', data: contacts },
        { type: 'ABOUT', data: about },
      ]
      for (const p of payloads) {
        await fetch('/api/admin/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        })
      }
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) return <div className="py-10">Загрузка...</div>
  if (!session || session.user.role !== 'ADMIN') return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold heading">Управление контентом</h1>
        <Button onClick={save} disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить все'}</Button>
      </div>

      <div className="flex gap-2 border-b pb-2">
        {(['HOME','CONTACTS','ABOUT'] as ContentType[]).map(t => (
          <button
            key={t}
            className={`px-3 py-1 text-sm border ${active===t ? 'bg-[var(--primary)] text-white' : 'bg-white'} `}
            onClick={() => setActive(t)}
          >{t}</button>
        ))}
      </div>

      {active === 'HOME' && (
        <Card>
          <CardHeader><CardTitle>Главная</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Заголовок (Hero)</label>
              <Input value={home.heroTitle} onChange={e=>setHome(v=>({...v, heroTitle: e.target.value}))} placeholder="Laddex" />
            </div>
            <div>
              <label className="block text-sm mb-1">Подзаголовок (Hero)</label>
              <Input value={home.heroSubtitle} onChange={e=>setHome(v=>({...v, heroSubtitle: e.target.value}))} placeholder="Производство лестниц и изделий" />
            </div>
          </CardContent>
        </Card>
      )}

      {active === 'CONTACTS' && (
        <Card>
          <CardHeader><CardTitle>Контакты</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Вступительный текст</label>
              <Textarea rows={3} value={contacts.intro} onChange={e=>setContacts(v=>({...v, intro: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm mb-1">Реквизиты (свободный текст)</label>
              <Textarea rows={6} value={contacts.requisites} onChange={e=>setContacts(v=>({...v, requisites: e.target.value}))} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Телефон (tel: без пробелов)</label>
                <Input value={contacts.phoneTel} onChange={e=>setContacts(v=>({...v, phoneTel: e.target.value}))} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Email (info)</label>
                <Input value={contacts.emailInfo} onChange={e=>setContacts(v=>({...v, emailInfo: e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Email (sales)</label>
                <Input value={contacts.emailSales} onChange={e=>setContacts(v=>({...v, emailSales: e.target.value}))} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Адрес — город/регион</label>
                <Input value={contacts.addressCityRegion} onChange={e=>setContacts(v=>({...v, addressCityRegion: e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Адрес — улица</label>
                <Input value={contacts.addressStreet} onChange={e=>setContacts(v=>({...v, addressStreet: e.target.value}))} />
              </div>
            </div>
            {/* Полный адрес формируется на клиенте из двух полей */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">WhatsApp (номер без +)</label>
                <Input value={contacts.whatsappNumber} onChange={e=>setContacts(v=>({...v, whatsappNumber: e.target.value}))} placeholder="70000000000" />
              </div>
              <div>
                <label className="block text-sm mb-1">Telegram (username)</label>
                <Input value={contacts.telegramUsername} onChange={e=>setContacts(v=>({...v, telegramUsername: e.target.value}))} placeholder="@username" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {active === 'ABOUT' && (
        <Card>
          <CardHeader><CardTitle>О компании</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Вступительный абзац</label>
              <Textarea rows={3} value={about.intro} onChange={e=>setAbout(v=>({...v, intro: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm mb-1">Основной текст о компании</label>
              <Textarea rows={10} value={about.companyText} onChange={e=>setAbout(v=>({...v, companyText: e.target.value}))} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
