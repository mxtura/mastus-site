import 'server-only'
import { prisma } from './prisma'
import { unstable_cache } from 'next/cache'

export type ContentPageType = 'HOME' | 'CONTACTS' | 'ABOUT'

// Typed shapes
export interface HomeContent { heroTitle: string; heroSubtitle: string }
export interface ContactsContent {
  intro: string
  requisites: string
  phoneTel: string
  emailInfo: string
  emailSales: string
  addressCityRegion: string
  addressStreet: string
  whatsappNumber: string
  telegramUsername: string
}
export interface AboutContent { intro: string; companyText: string }

// Defaults
const defaultHome: HomeContent = { heroTitle: 'Laddex', heroSubtitle: '' }
const defaultContacts: ContactsContent = {
  intro: '', requisites: '', phoneTel: '', emailInfo: '', emailSales: '', addressCityRegion: '', addressStreet: '', whatsappNumber: '', telegramUsername: ''
}
const defaultAbout: AboutContent = { intro: '', companyText: '' }

async function raw(page: ContentPageType): Promise<unknown> {
  const row = await prisma.contentPage.findUnique({ where: { page }, select: { data: true } })
  return row?.data ?? null
}

function normalize(page: ContentPageType, data: unknown) {
  const obj = (data && typeof data === 'object') ? data as Record<string, unknown> : {}
  if (page === 'HOME') return { ...defaultHome, ...obj } as HomeContent
  if (page === 'CONTACTS') return { ...defaultContacts, ...obj } as ContactsContent
  if (page === 'ABOUT') return { ...defaultAbout, ...obj } as AboutContent
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
