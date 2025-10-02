import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = await (prisma as any).user.findUnique({
    where: { id: session.user.id },
    select: { login: true, email: true }
  })

  return NextResponse.json({
    login: user?.login || '',
    email: user?.email || ''
  })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }

  const body = await req.json().catch(() => null) as { login?: string; email?: string; password?: string } | null
  if (!body) return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 })

  const data: { login?: string; email?: string | null; password?: string } = {}

  if (typeof body.login === 'string') {
    const trimmedLogin = body.login.trim()
    if (trimmedLogin.length >= 3 && /^[a-zA-Z0-9._-]+$/.test(trimmedLogin)) {
      data.login = trimmedLogin
    }
  }

  if (typeof body.email === 'string') {
    const trimmedEmail = body.email.trim()
    if (trimmedEmail === '' || trimmedEmail.includes('@')) {
      data.email = trimmedEmail === '' ? null : trimmedEmail
    }
  }

  if (typeof body.password === 'string' && body.password.length >= 6) {
    data.password = await bcrypt.hash(body.password, 10)
  }

  if (!data.login && data.email === undefined && !data.password) {
    return NextResponse.json({ error: 'Нечего обновлять' }, { status: 400 })
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await (prisma as any).user.update({
      where: { id: session.user.id },
      data,
      select: { login: true, email: true }
    })
    return NextResponse.json({ login: updated.login, email: updated.email || '' })
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && (error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Логин или email уже используется' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Не удалось обновить' }, { status: 500 })
  }
}
