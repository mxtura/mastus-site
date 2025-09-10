import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }
  try {
    const body = await request.json()
    const nameRu = typeof body.nameRu === 'string' ? body.nameRu.trim() : ''
    const codeRaw = typeof body.code === 'string' ? body.code.trim() : undefined
    if (!nameRu) return NextResponse.json({ error: 'Укажите русское имя' }, { status: 400 })
    let code: string | undefined
    if (codeRaw !== undefined) {
      const up = codeRaw.toUpperCase()
      if (!/^[A-Z0-9_\-]{2,40}$/.test(up)) return NextResponse.json({ error: 'Некорректный код' }, { status: 400 })
      code = up
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await (prisma as any).parameter.update({ where: { id }, data: { nameRu, ...(code ? { code } : {}) } })
    return NextResponse.json(updated)
  } catch (e) {
    const err = e as { code?: string }
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Код уже используется' }, { status: 409 })
    return NextResponse.json({ error: 'Ошибка обновления параметра' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).parameter.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Ошибка удаления параметра' }, { status: 500 })
  }
}
