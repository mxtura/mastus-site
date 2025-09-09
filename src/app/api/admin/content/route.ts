import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidateTag } from 'next/cache'
import { rateLimit } from '@/lib/simple-rate-limit'
import type { Prisma } from '@prisma/client'

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
    const page = await prisma.contentPage.findUnique({ where: { page: type as ContentType } })
    return NextResponse.json(page)
  } catch {
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
  const jsonData = safeData as Prisma.InputJsonValue
  const saved = await prisma.contentPage.upsert({
    where: { page: body.type as ContentType },
    update: { data: jsonData },
    create: { page: body.type as ContentType, data: jsonData }
  })
  try { revalidateTag('content:'+body.type) } catch {}
  return NextResponse.json(saved)
}
