import 'server-only'
import { prisma } from './prisma'
import { unstable_cache } from 'next/cache'

export type ContentPageType = 'HOME' | 'CONTACTS' | 'ABOUT'

// Typed shapes
export interface HomeContent { heroTitle: string; heroSubtitle: string }
export interface ContactsContent {
  intro: string
  requisites: {
    companyName: string
    inn: string
    kpp: string
    ogrn: string
    bankName: string
    bik: string
    settlementAccount: string
    correspondentAccount: string
    legalAddress: string
  }
  phoneTel: string
  emailInfo: string
  emailSales: string
  addressCityRegion: string
  addressStreet: string
  whatsappNumber: string
  telegramUsername: string
  workingHours: Array<{ label: string; time: string }>
}
export interface AboutContent { intro: string; companyText: string; factoryImages: string[] }

// Defaults
const defaultHome: HomeContent = { heroTitle: 'Laddex', heroSubtitle: '' }
const defaultContacts: ContactsContent = {
  intro: '',
  requisites: {
    companyName: '', inn: '', kpp: '', ogrn: '', bankName: '', bik: '', settlementAccount: '', correspondentAccount: '', legalAddress: ''
  },
  phoneTel: '', emailInfo: '', emailSales: '', addressCityRegion: '', addressStreet: '', whatsappNumber: '', telegramUsername: '', workingHours: []
}
const defaultAbout: AboutContent = { intro: '', companyText: '', factoryImages: [] }

async function raw(page: ContentPageType): Promise<unknown> {
  const row = await prisma.contentPage.findUnique({ where: { page }, select: { data: true } })
  return row?.data ?? null
}

function sanitizeWorkingHours(value: unknown) {
  if (!Array.isArray(value)) return [] as Array<{ label: string; time: string }>

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

function sanitizeStringArray(value: unknown): string[] {
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

function normalize(page: ContentPageType, data: unknown) {
  const obj = (data && typeof data === 'object') ? data as Record<string, unknown> : {}
  if (page === 'HOME') return { ...defaultHome, ...obj } as HomeContent
  if (page === 'CONTACTS') {
    const workingHours = sanitizeWorkingHours((obj as { workingHours?: unknown }).workingHours)
    return { ...defaultContacts, ...obj, workingHours } as ContactsContent
  }
  if (page === 'ABOUT') {
    const factoryImages = sanitizeStringArray((obj as { factoryImages?: unknown }).factoryImages)
    return { ...defaultAbout, ...obj, factoryImages } as AboutContent
  }
  return obj
}

export const getContent = (page: ContentPageType) =>
  unstable_cache(async () => normalize(page, await raw(page)), ['content:'+page], { tags: ['content:'+page], revalidate: 300 })()

export async function getAllContent() {
  const [home, contacts, about] = await Promise.all([
    getContent('HOME'), getContent('CONTACTS'), getContent('ABOUT')
  ])
  return { home, contacts, about }
}
