import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/simple-rate-limit'

const ZOOM_LEVEL = 17
const GEO_ENDPOINT = 'https://geocode-maps.yandex.ru/1.x/'

function buildSearchUrls(query: string) {
  const encoded = encodeURIComponent(query)
  return {
    shareHref: `https://yandex.ru/maps/?mode=search&z=${ZOOM_LEVEL}&text=${encoded}`,
    widgetSrc: `https://yandex.ru/map-widget/v1/?mode=search&z=${ZOOM_LEVEL}&text=${encoded}`,
    resolvedAddress: query,
  }
}

function extractDirectUri(feature: unknown): string | undefined {
  if (!feature || typeof feature !== 'object') return undefined
  const asRecord = feature as Record<string, unknown>
  const meta = asRecord.metaDataProperty as Record<string, unknown> | undefined
  const geocoderMeta = meta?.GeocoderMetaData as Record<string, unknown> | undefined
  const address = geocoderMeta?.Address as Record<string, unknown> | undefined

  const additionalData = address?.additionalData
  if (Array.isArray(additionalData)) {
    for (const item of additionalData) {
      if (item && typeof item === 'object') {
        const value = (item as { value?: unknown }).value
        if (typeof value === 'string' && value.startsWith('https://yandex.ru/maps/')) {
          return value
        }
      }
    }
  }

  const uri = address?.uri
  if (typeof uri === 'string' && uri.startsWith('https://yandex.ru/maps/')) {
    return uri
  }

  return undefined
}

function extractResolvedText(feature: unknown): string | undefined {
  if (!feature || typeof feature !== 'object') return undefined
  const asRecord = feature as Record<string, unknown>
  const meta = asRecord.metaDataProperty as Record<string, unknown> | undefined
  const geocoderMeta = meta?.GeocoderMetaData as Record<string, unknown> | undefined
  const text = geocoderMeta?.text
  return typeof text === 'string' ? text : undefined
}

export async function GET(request: NextRequest) {
  const queryParam = request.nextUrl.searchParams.get('query')
  const query = typeof queryParam === 'string' ? queryParam.trim() : ''

  if (!query) {
    return NextResponse.json({ error: 'Параметр "query" обязателен' }, { status: 400 })
  }

  const forwardedFor = request.headers.get('x-forwarded-for')
  const forwardedIp = forwardedFor ? forwardedFor.split(',').map(part => part.trim()).find(Boolean) : undefined
  const realIp = request.headers.get('x-real-ip')?.trim()
  const cfIp = request.headers.get('cf-connecting-ip')?.trim()
  const clientIP = forwardedIp || realIp || cfIp || 'unknown'

  const limiterKey = `geocode_${clientIP}`
  const limiter = await rateLimit(limiterKey)
  if (!limiter.success) {
    return NextResponse.json(
      { error: 'Слишком много запросов. Попробуйте позже.' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Remaining': '0',
        },
      },
    )
  }

  let result = buildSearchUrls(query)

  try {
    const encoded = encodeURIComponent(query)
    const response = await fetch(`${GEO_ENDPOINT}?format=json&lang=ru_RU&results=1&geocode=${encoded}`, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'mastus-site/1.0 (+https://laddex.ru)',
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      const payload = await response.json()
      const collection = payload?.response?.GeoObjectCollection
      const feature = collection?.featureMember?.[0]?.GeoObject
      const pos: unknown = feature?.Point?.pos

      if (typeof pos === 'string') {
        const [lonRaw, latRaw] = pos.split(' ').map((part) => part.trim()).filter(Boolean)
        if (lonRaw && latRaw) {
          const llParam = encodeURIComponent(`${lonRaw},${latRaw}`)
          const shareBase = `https://yandex.ru/maps/?ll=${llParam}&mode=whatshere&whatshere%5Bpoint%5D=${llParam}&whatshere%5Bzoom%5D=${ZOOM_LEVEL}&z=${ZOOM_LEVEL}`
          const widgetSrc = `https://yandex.ru/map-widget/v1/?ll=${llParam}&mode=whatshere&whatshere%5Bpoint%5D=${llParam}&whatshere%5Bzoom%5D=${ZOOM_LEVEL}&z=${ZOOM_LEVEL}`

          const resolvedAddress = extractResolvedText(feature) ?? query
          const directUri = extractDirectUri(feature)
          const shareHref = directUri ?? `${shareBase}&text=${encodeURIComponent(resolvedAddress)}`

          result = {
            shareHref,
            widgetSrc,
            resolvedAddress,
          }
        }
      }
    }
  } catch (error) {
    console.error('[geocode] Ошибка при обращении к Yandex Geocode API:', error)
  }

  return NextResponse.json(
    { data: result },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=60',
        'X-RateLimit-Remaining': limiter.remaining.toString(),
      },
    },
  )
}
