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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true }
  })

  return NextResponse.json({ email: user?.email || '' })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }

  const body = await req.json().catch(() => null) as { email?: string; password?: string } | null
  if (!body) return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 })

  const data: { email?: string; password?: string } = {}
  if (typeof body.email === 'string' && body.email.includes('@')) data.email = body.email.trim()
  if (typeof body.password === 'string' && body.password.length >= 6) {
    data.password = await bcrypt.hash(body.password, 10)
  }

  if (!data.email && !data.password) {
    return NextResponse.json({ error: 'Нечего обновлять' }, { status: 400 })
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { email: true }
    })
    return NextResponse.json({ email: updated.email })
  } catch {
    return NextResponse.json({ error: 'Не удалось обновить' }, { status: 500 })
  }
}
