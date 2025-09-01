import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/simple-rate-limit'

type ContentType = 'HOME' | 'CONTACTS' | 'ABOUT'
function isValidType(t: unknown): t is ContentType {
  return t === 'HOME' || t === 'CONTACTS' || t === 'ABOUT'
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') as string | null
  if (!type || !isValidType(type)) {
    return NextResponse.json({ error: 'Некорректный тип' }, { status: 400 })
  }
  const rl = await rateLimit(`admin_content_get_${session.user.id}`)
  if (!rl.success) return NextResponse.json({ error: 'Слишком много запросов' }, { status: 429 })
  try {
  const rows = await prisma.$queryRaw<Array<{ id: string; page: string; data: unknown }>>`SELECT id, page, data FROM "ContentPage" WHERE page = ${type as ContentType}::"ContentPageType" LIMIT 1`
    const page = rows && rows.length ? rows[0] : null
    return NextResponse.json(page)
  } catch {
    // Возможно, таблица ещё не создана (нет миграции)
    return NextResponse.json(null)
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }
  const rl = await rateLimit(`admin_content_put_${session.user.id}`)
  if (!rl.success) return NextResponse.json({ error: 'Слишком много запросов' }, { status: 429 })

  const body = await req.json().catch(() => null) as { type?: unknown, data?: unknown } | null
  if (!body || !isValidType(body.type)) {
    return NextResponse.json({ error: 'Некорректный тип' }, { status: 400 })
  }
  const safeData: unknown = body.data ?? {}
  // Upsert via raw SQL (Postgres)
  function genId(): string {
    const g = globalThis as unknown as { crypto?: { randomUUID?: () => string } }
    if (g.crypto && typeof g.crypto.randomUUID === 'function') return g.crypto.randomUUID()
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`
  }
  const newId = genId()
  const saved = await prisma.$queryRaw<Array<{ id: string; page: string; data: unknown }>>`
    INSERT INTO "ContentPage" (id, page, data, "updatedAt")
  VALUES (${newId}, ${body.type as ContentType}::"ContentPageType", ${safeData}::jsonb, NOW())
  ON CONFLICT (page) DO UPDATE SET data = ${safeData}::jsonb, "updatedAt" = NOW()
    RETURNING id, page, data
  `
  return NextResponse.json(saved && saved[0] ? saved[0] : null)
}
