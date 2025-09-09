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
    const page = await prisma.contentPage.findUnique({ where: { page: type as ContentType }, select: { data: true } })
    return NextResponse.json({ type, data: page?.data ?? null })
  } catch {
    return NextResponse.json({ type, data: null })
  }
}
