import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/simple-rate-limit'

type ContentType = 'HOME' | 'CONTACTS' | 'ABOUT'
function isValidType(t: unknown): t is ContentType {
  return t === 'HOME' || t === 'CONTACTS' || t === 'ABOUT'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') as string | null
  if (!type || !isValidType(type)) {
    return NextResponse.json({ error: 'Некорректный тип' }, { status: 400 })
  }
  const rl = await rateLimit('public_content_get')
  if (!rl.success) return NextResponse.json({ error: 'Слишком много запросов' }, { status: 429 })

  try {
    // Use raw query to avoid type issues before prisma generate
    const rows = await prisma.$queryRaw<Array<{ data: unknown }>>`SELECT data FROM "ContentPage" WHERE page = ${type as ContentType}::"ContentPageType" LIMIT 1`
    const data = rows && rows.length ? rows[0].data : null
    return NextResponse.json({ type, data })
  } catch {
    // Table may not exist yet if migration not applied
    return NextResponse.json({ type, data: null })
  }
}
