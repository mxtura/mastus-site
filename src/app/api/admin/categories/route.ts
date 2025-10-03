import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function ensureCode(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const code = v.trim().toUpperCase()
  if (!/^[A-Z0-9_\-]{2,40}$/.test(code)) return null
  return code
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories = await (prisma as any).category.findMany({
      orderBy: { nameRu: 'asc' },
      include: {
        params: {
          include: { parameter: true }
        }
      }
    })
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json({ error: 'Ошибка загрузки категорий' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }
  try {
    const body = await request.json()
    const code = ensureCode(body.code)
    const nameRu = typeof body.nameRu === 'string' ? body.nameRu.trim() : ''
    const description = typeof body.description === 'string' ? body.description.trim() : null
    if (!code) return NextResponse.json({ error: 'Некорректный код' }, { status: 400 })
    if (!nameRu) return NextResponse.json({ error: 'Укажите русское имя' }, { status: 400 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created = await (prisma as any).category.create({ data: { code, nameRu, description } })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    const err = e as { code?: string }
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Код уже используется' }, { status: 409 })
    return NextResponse.json({ error: 'Ошибка создания категории' }, { status: 500 })
  }
}
