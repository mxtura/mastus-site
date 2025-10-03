"use client"

import { useEffect, useRef, useState, type ComponentType } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Home, Phone, Building2, type LucideIcon } from 'lucide-react'
import type { MDEditorProps } from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

type ContentType = 'HOME' | 'CONTACTS' | 'ABOUT'

type HomeData = { heroTitle?: string; heroSubtitle?: string }
type ContactsData = {
  intro?: string
  requisites?: {
    companyName?: string
    inn?: string
    kpp?: string
    ogrn?: string
    bankName?: string
    bik?: string
    settlementAccount?: string
    correspondentAccount?: string
    legalAddress?: string
  }
  phoneTel?: string
  emailInfo?: string
  emailSales?: string
  addressCityRegion?: string
  addressStreet?: string
  whatsappNumber?: string
  telegramUsername?: string
  workingHours?: WorkingHourEntry[]
}
type AboutData = { intro?: string; companyText?: string; factoryImages?: string[] }

type WorkingHourEntry = { label?: string; time?: string }

const MAX_FACTORY_IMAGES = 8
const MAX_FACTORY_IMAGE_SIZE = 5 * 1024 * 1024

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
) as unknown as ComponentType<MDEditorProps>

interface MarkdownFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number
}

const MarkdownField = ({ label, value, onChange, placeholder, height = 220 }: MarkdownFieldProps) => (
  <div className="space-y-2" data-color-mode="light">
    <label className="block text-sm font-medium text-neutral-700">{label}</label>
    <div className="rounded-none border border-neutral-200">
      <MDEditor
        value={value}
        height={height}
        preview="edit"
        textareaProps={{ placeholder }}
        onChange={val => onChange(val ?? '')}
      />
    </div>
  </div>
)

const tabsMeta: Record<ContentType, { title: string; description: string; icon: LucideIcon }> = {
  HOME: {
    title: 'Главная страница',
    description: 'Настройка hero-заголовка и подзаголовка, которые встречают посетителей.',
    icon: Home,
  },
  CONTACTS: {
    title: 'Контакты',
    description: 'Актуальные реквизиты, адрес и режим работы для отдела продаж.',
    icon: Phone,
  },
  ABOUT: {
    title: 'О компании',
    description: 'История, описание производства и визуальные материалы для страницы «О нас».',
    icon: Building2,
  },
}

const sanitizeWorkingHours = (value: unknown): Array<{ label: string; time: string }> => {
  if (!Array.isArray(value)) return []
  const result: Array<{ label: string; time: string }> = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    const label = typeof record.label === 'string' ? record.label.trim() : ''
    const time = typeof record.time === 'string' ? record.time.trim() : ''
    if (!label && !time) continue
    result.push({ label, time })
  }
  return result
}

const sanitizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  const result: string[] = []
  for (const item of value) {
    if (typeof item !== 'string') continue
    const trimmed = item.trim()
    if (!trimmed) continue
    result.push(trimmed)
  }
  return result
}

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
    requisites: {
      companyName: '', inn: '', kpp: '', ogrn: '', bankName: '', bik: '', settlementAccount: '', correspondentAccount: '', legalAddress: ''
    },
    phoneTel: '',
    emailInfo: '',
    emailSales: '',
    addressCityRegion: '',
    addressStreet: '',
    whatsappNumber: '',
    telegramUsername: '',
    workingHours: [],
  })
  const [about, setAbout] = useState({ intro: '', companyText: '', factoryImages: [] as string[] })
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [factoryImageUploading, setFactoryImageUploading] = useState(false)
  const activeMeta = tabsMeta[active]
  const ActiveIcon = activeMeta.icon

  const summaryStats = (() => {
    switch (active) {
      case 'HOME': {
        const heroTitleFilled = home.heroTitle.trim().length > 0
        const heroSubtitleFilled = home.heroSubtitle.trim().length > 0
        return [
          {
            label: 'Hero заголовок',
            value: heroTitleFilled ? 'Заполнено' : 'Пусто',
            hint: heroTitleFilled ? `${Math.min(home.heroTitle.trim().length, 120)} символов` : 'Добавьте цепляющую фразу',
          },
          {
            label: 'Подзаголовок',
            value: heroSubtitleFilled ? 'Заполнено' : 'Пусто',
            hint: heroSubtitleFilled ? `${Math.min(home.heroSubtitle.trim().length, 200)} символов` : 'Коротко поясните предложение',
          },
        ]
      }
      case 'CONTACTS': {
        const requisitesFilled = Object.values(contacts.requisites).filter((value) => (value || '').trim() !== '').length
        const channelsFilled = [contacts.phoneTel, contacts.emailInfo, contacts.emailSales, contacts.whatsappNumber, contacts.telegramUsername]
          .filter((value) => (value || '').trim() !== '').length
        return [
          {
            label: 'Реквизиты',
            value: `${requisitesFilled}/9 полей`,
            hint: requisitesFilled === 9 ? 'Полный комплект' : 'Проверьте обязательные значения',
          },
          {
            label: 'Каналы связи',
            value: `${channelsFilled} активных`,
            hint: contacts.workingHours.length ? `${contacts.workingHours.length} строк графика` : 'Добавьте расписание',
          },
        ]
      }
      case 'ABOUT': {
        const introFilled = about.intro.trim().length > 0
        const companyTextFilled = about.companyText.trim().length > 0
        return [
          {
            label: 'Фотографии',
            value: `${about.factoryImages.length}/${MAX_FACTORY_IMAGES}`,
            hint: about.factoryImages.length ? 'Откройте для предпросмотра' : 'Добавьте хотя бы одну фотографию',
          },
          {
            label: 'Тексты',
            value: `${introFilled && companyTextFilled ? 'Готовы' : 'Нужны правки'}`,
            hint: introFilled && companyTextFilled ? 'Можно публиковать' : 'Проверьте вступление и основной блок',
          },
        ]
      }
      default:
        return []
    }
  })()

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
              requisites: {
                companyName: d?.requisites?.companyName || '',
                inn: d?.requisites?.inn || '',
                kpp: d?.requisites?.kpp || '',
                ogrn: d?.requisites?.ogrn || '',
                bankName: d?.requisites?.bankName || '',
                bik: d?.requisites?.bik || '',
                settlementAccount: d?.requisites?.settlementAccount || '',
                correspondentAccount: d?.requisites?.correspondentAccount || '',
                legalAddress: d?.requisites?.legalAddress || '',
              },
              phoneTel: d?.phoneTel || '',
              emailInfo: d?.emailInfo || '',
              emailSales: d?.emailSales || '',
              addressCityRegion: d?.addressCityRegion || '',
              addressStreet: d?.addressStreet || '',
              whatsappNumber: d?.whatsappNumber || '',
              telegramUsername: d?.telegramUsername || '',
              workingHours: sanitizeWorkingHours(d?.workingHours),
            })
          }
          if (rec.page === 'ABOUT') {
            const d = rec.data as AboutData
            setAbout({
              intro: d?.intro || '',
              companyText: d?.companyText || '',
              factoryImages: sanitizeStringArray(d?.factoryImages),
            })
          }
        }))
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  const addWorkingHour = () => {
    setContacts((prev) => ({
      ...prev,
      workingHours: [...prev.workingHours, { label: '', time: '' }],
    }))
  }

  const updateWorkingHour = (index: number, field: 'label' | 'time', value: string) => {
    setContacts((prev) => {
      const next = prev.workingHours.map((entry, idx) => (
        idx === index ? { ...entry, [field]: value } : entry
      ))
      return { ...prev, workingHours: next }
    })
  }

  const removeWorkingHour = (index: number) => {
    setContacts((prev) => ({
      ...prev,
      workingHours: prev.workingHours.filter((_, idx) => idx !== index),
    }))
  }

  const addFactoryImage = () => {
    setAbout((prev) => {
      if (prev.factoryImages.length >= MAX_FACTORY_IMAGES) {
        alert(`Максимум ${MAX_FACTORY_IMAGES} фотографий.`)
        return prev
      }
      return {
        ...prev,
        factoryImages: [...prev.factoryImages, ''],
      }
    })
  }

  const updateFactoryImage = (index: number, value: string) => {
    setAbout((prev) => ({
      ...prev,
      factoryImages: prev.factoryImages.map((src, idx) => (idx === index ? value : src)),
    }))
  }

  const removeFactoryImage = (index: number) => {
    setAbout((prev) => ({
      ...prev,
      factoryImages: prev.factoryImages.filter((_, idx) => idx !== index),
    }))
  }

  const handleFactoryImageUpload = async (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Можно загружать только изображения.')
      return
    }
    if (file.size > MAX_FACTORY_IMAGE_SIZE) {
      alert('Файл слишком большой. Максимальный размер — 5 МБ.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    if (about.factoryImages.length >= MAX_FACTORY_IMAGES) {
      alert(`Максимум ${MAX_FACTORY_IMAGES} фотографий.`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const form = new FormData()
    form.append('file', file)

    setFactoryImageUploading(true)
    try {
  const res = await fetch('/api/admin/upload-file', { method: 'POST', body: form })
      if (!res.ok) {
        if (res.status === 413) {
          alert('Файл отклонён сервером из-за размера. Максимум 5 МБ.')
          return
        }
        let message = 'Не удалось загрузить изображение. Попробуйте ещё раз.'
        try {
          const error = await res.json()
          if (error?.error) message = error.error
        } catch (err) {
          console.error('Не удалось разобрать ошибку загрузки', err)
        }
        throw new Error(message)
      }
      const data = await res.json()
      const url = typeof data?.url === 'string' ? data.url : ''
      if (!url) throw new Error('Missing URL in response')
      setAbout((prev) => {
        if (prev.factoryImages.length >= MAX_FACTORY_IMAGES) return prev
        return {
          ...prev,
          factoryImages: [...prev.factoryImages, url],
        }
      })
    } catch (error) {
      console.error('Ошибка загрузки изображения', error)
      if (error instanceof Error && error.message) {
        alert(error.message)
      } else {
        alert('Не удалось загрузить изображение. Попробуйте ещё раз.')
      }
    } finally {
      setFactoryImageUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const sanitizedWorkingHours = contacts.workingHours
        .map((entry) => ({
          label: (entry.label || '').trim(),
          time: (entry.time || '').trim(),
        }))
        .filter((entry) => entry.label !== '' || entry.time !== '')

      const contactsPayload: Required<ContactsData> = {
        ...contacts,
        workingHours: sanitizedWorkingHours,
      }

      setContacts(contactsPayload)

      const sanitizedFactoryImages = about.factoryImages
        .map((src) => src.trim())
        .filter((src) => src !== '')
        .slice(0, MAX_FACTORY_IMAGES)

      const aboutPayload: AboutData = {
        intro: about.intro,
        companyText: about.companyText,
        factoryImages: sanitizedFactoryImages,
      }

      setAbout({
        intro: aboutPayload.intro || '',
        companyText: aboutPayload.companyText || '',
        factoryImages: sanitizedFactoryImages,
      })

      const payloads: Array<{ type: ContentType; data: HomeData|ContactsData|AboutData }> = [
        { type: 'HOME', data: home },
        { type: 'CONTACTS', data: contactsPayload },
        { type: 'ABOUT', data: aboutPayload },
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
      <div className="border border-neutral-300 bg-neutral-50 shadow-sm">
        <div className="bg-neutral-900 border-b-4 border-[var(--tertiary)] px-6 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center bg-neutral-800 border border-neutral-600">
              <ActiveIcon className="h-6 w-6 text-neutral-200" />
            </span>
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-wide text-white uppercase">Управление контентом</h1>
              <p className="text-xs text-neutral-400 tracking-wide">{activeMeta.description}</p>
            </div>
          </div>
          <Button
            onClick={save}
            disabled={saving}
            className="bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-neutral-600 rounded-none px-5"
            variant="outline"
          >
            {saving ? 'Сохранение…' : 'Сохранить изменения'}
          </Button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {summaryStats.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {summaryStats.map((stat, index) => (
                <div key={index} className="border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">{stat.label}</p>
                  <p className="text-lg font-semibold text-neutral-900">{stat.value}</p>
                  {stat.hint && <p className="text-xs text-neutral-500">{stat.hint}</p>}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {(['HOME','CONTACTS','ABOUT'] as ContentType[]).map((t) => {
              const meta = tabsMeta[t]
              const TabIcon = meta.icon
              const isActive = active === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActive(t)}
                  className={cn(
                    'flex items-center gap-2 border px-4 py-2 text-sm uppercase tracking-wide transition-colors',
                    isActive
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
                  )}
                >
                  <span className="flex h-6 w-6 items-center justify-center border border-neutral-400 bg-neutral-200 text-neutral-700">
                    <TabIcon className="h-3.5 w-3.5" />
                  </span>
                  {meta.title}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {active === 'HOME' && (
        <Card className="rounded-none border border-neutral-300 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">Главная</CardTitle>
              <CardDescription>Hero-блок и подзаголовок на публичной странице.</CardDescription>
            </div>
            <Badge variant="outline" className="rounded-full border-neutral-200 text-xs">Публичный блок</Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm mb-1">Заголовок (Hero)</label>
              <Input value={home.heroTitle} onChange={e=>setHome(v=>({...v, heroTitle: e.target.value}))} placeholder="Laddex" />
            </div>
            <Separator />
            <div>
              <label className="block text-sm mb-1">Подзаголовок (Hero)</label>
              <Input value={home.heroSubtitle} onChange={e=>setHome(v=>({...v, heroSubtitle: e.target.value}))} placeholder="Производство лестниц и изделий" />
            </div>
          </CardContent>
        </Card>
      )}

      {active === 'CONTACTS' && (
        <Card className="rounded-none border border-neutral-300 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">Контакты</CardTitle>
              <CardDescription>Актуальные данные для связи и юридическая информация.</CardDescription>
            </div>
            <Badge variant="outline" className="rounded-full border-neutral-200 text-xs">Публичный блок</Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <MarkdownField
              label="Вступительный текст"
              value={contacts.intro}
              placeholder="Расскажите, как лучше связаться с отделом продаж..."
              onChange={(value) => setContacts((prev) => ({ ...prev, intro: value }))}
            />
            <Separator />
            <div>
              <label className="block text-sm mb-2 font-medium">Реквизиты</label>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1">Наименование компании</label>
                  <Input value={contacts.requisites.companyName} onChange={e=>setContacts(v=>({...v, requisites: {...v.requisites, companyName: e.target.value}}))} />
                </div>
                <div>
                  <label className="block text-xs mb-1">ИНН</label>
                  <Input value={contacts.requisites.inn} onChange={e=>setContacts(v=>({...v, requisites: {...v.requisites, inn: e.target.value}}))} />
                </div>
                <div>
                  <label className="block text-xs mb-1">КПП</label>
                  <Input value={contacts.requisites.kpp} onChange={e=>setContacts(v=>({...v, requisites: {...v.requisites, kpp: e.target.value}}))} />
                </div>
                <div>
                  <label className="block text-xs mb-1">ОГРН</label>
                  <Input value={contacts.requisites.ogrn} onChange={e=>setContacts(v=>({...v, requisites: {...v.requisites, ogrn: e.target.value}}))} />
                </div>
                <div>
                  <label className="block text-xs mb-1">Банк</label>
                  <Input value={contacts.requisites.bankName} onChange={e=>setContacts(v=>({...v, requisites: {...v.requisites, bankName: e.target.value}}))} />
                </div>
                <div>
                  <label className="block text-xs mb-1">БИК</label>
                  <Input value={contacts.requisites.bik} onChange={e=>setContacts(v=>({...v, requisites: {...v.requisites, bik: e.target.value}}))} />
                </div>
                <div>
                  <label className="block text-xs mb-1">Р/с</label>
                  <Input value={contacts.requisites.settlementAccount} onChange={e=>setContacts(v=>({...v, requisites: {...v.requisites, settlementAccount: e.target.value}}))} />
                </div>
                <div>
                  <label className="block text-xs mb-1">К/с</label>
                  <Input value={contacts.requisites.correspondentAccount} onChange={e=>setContacts(v=>({...v, requisites: {...v.requisites, correspondentAccount: e.target.value}}))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs mb-1">Юридический адрес</label>
                  <Input value={contacts.requisites.legalAddress} onChange={e=>setContacts(v=>({...v, requisites: {...v.requisites, legalAddress: e.target.value}}))} />
                </div>
              </div>
            </div>
            <Separator />
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
            <Separator />
            <div>
              <label className="block text-sm mb-2 font-medium">Режим работы</label>
              <div className="space-y-3">
                {contacts.workingHours.length === 0 && (
                  <p className="text-xs text-neutral-500">Добавьте строки, чтобы указать график работы (например, «Понедельник - Пятница» и «9:00 - 18:00»).</p>
                )}
                {contacts.workingHours.map((row, index) => (
                  <div key={index} className="flex flex-col md:flex-row md:items-center gap-2">
                    <Input
                      className="md:flex-1"
                      placeholder="День"
                      value={row.label || ''}
                      onChange={e => updateWorkingHour(index, 'label', e.target.value)}
                    />
                    <Input
                      className="md:flex-1"
                      placeholder="Время"
                      value={row.time || ''}
                      onChange={e => updateWorkingHour(index, 'time', e.target.value)}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => removeWorkingHour(index)}>
                      Удалить
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addWorkingHour}>
                  Добавить строку
                </Button>
              </div>
            </div>
            <Separator />
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
        <Card className="rounded-none border border-neutral-300 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">О компании</CardTitle>
              <CardDescription>История бренда и подборка фотографий производства.</CardDescription>
            </div>
            <Badge variant="outline" className="rounded-full border-neutral-200 text-xs">Публичный блок</Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <MarkdownField
              label="Вступительный абзац"
              value={about.intro}
              placeholder="Коротко опишите компанию и её специализацию."
              onChange={(value) => setAbout((prev) => ({ ...prev, intro: value }))}
            />
            <Separator />
            <MarkdownField
              label="Основной текст о компании"
              value={about.companyText}
              placeholder="Добавьте историю бренда, производственные мощности и ключевые компетенции."
              height={320}
              onChange={(value) => setAbout((prev) => ({ ...prev, companyText: value }))}
            />
            <Separator />
            <div>
              <label className="block text-sm mb-2 font-medium">Фотографии производства</label>
              <div className="space-y-4">
                {about.factoryImages.length === 0 && (
                  <p className="text-xs text-neutral-500">Загрузите фотографии цехов или добавьте ссылки на уже опубликованные изображения.</p>
                )}
                <div className="grid gap-4 justify-items-center sm:grid-cols-2 lg:grid-cols-3">
                  {about.factoryImages.map((src, index) => (
                    <div key={index} className="w-90 rounded-xl border border-neutral-200 bg-white/80 p-3 space-y-2 shadow-sm">
                      <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-neutral-100">
                        {src ? (
                          <Image
                            src={src}
                            alt={`Фото производства ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(min-width: 768px) 320px, 100vw"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-center text-xs text-neutral-500">
                            Предпросмотр появится после указания URL или загрузки файла
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <Input
                          className="md:flex-1"
                          placeholder="https://..."
                          value={src}
                          onChange={e => updateFactoryImage(index, e.target.value)}
                        />
                        <Button type="button" variant="outline" size="sm" onClick={() => removeFactoryImage(index)}>
                          Удалить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={event => handleFactoryImageUpload(event.target.files?.[0] ?? null)}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={factoryImageUploading || about.factoryImages.length >= MAX_FACTORY_IMAGES}
                  >
                    {factoryImageUploading ? 'Загрузка...' : 'Загрузить файл'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFactoryImage}
                    disabled={about.factoryImages.length >= MAX_FACTORY_IMAGES}
                  >
                    Добавить по ссылке
                  </Button>
                </div>
                <p className="text-xs text-neutral-500">Максимум {MAX_FACTORY_IMAGES} фотографий по 5&nbsp;МБ. Допустимые форматы: JPG, PNG, WebP, GIF, SVG, HEIC.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
