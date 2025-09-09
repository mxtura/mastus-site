import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list = await (prisma as any).parameter.findMany({ orderBy: { nameRu: 'asc' } })
    return NextResponse.json(list)
  } catch {
    return NextResponse.json({ error: 'Ошибка загрузки параметров' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }
  try {
    const body = await request.json()
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
    const nameRu = typeof body.nameRu === 'string' ? body.nameRu.trim() : ''
    if (!/^[A-Z0-9_\-]{2,40}$/.test(code)) return NextResponse.json({ error: 'Некорректный код' }, { status: 400 })
    if (!nameRu) return NextResponse.json({ error: 'Укажите русское имя' }, { status: 400 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created = await (prisma as any).parameter.create({ data: { code, nameRu } })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    const err = e as { code?: string }
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Код уже используется' }, { status: 409 })
    return NextResponse.json({ error: 'Ошибка создания параметра' }, { status: 500 })
  }
}
