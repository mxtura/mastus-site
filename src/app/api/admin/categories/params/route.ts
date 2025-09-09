import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Assign parameter to category or update flags
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }
  try {
    const body = await request.json()
    const categoryId = typeof body.categoryId === 'string' ? body.categoryId : ''
    const parameterId = typeof body.parameterId === 'string' ? body.parameterId : ''
    const visible = typeof body.visible === 'boolean' ? body.visible : true
    const required = typeof body.required === 'boolean' ? body.required : false
    if (!categoryId || !parameterId) return NextResponse.json({ error: 'categoryId и parameterId обязательны' }, { status: 400 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const up = await (prisma as any).categoryParam.upsert({
      where: { categoryId_parameterId: { categoryId, parameterId } },
      create: { categoryId, parameterId, visible, required },
      update: { visible, required }
    })
    return NextResponse.json(up, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Ошибка назначения параметра' }, { status: 500 })
  }
}

// Remove parameter from category
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId') || ''
    const parameterId = searchParams.get('parameterId') || ''
    if (!categoryId || !parameterId) return NextResponse.json({ error: 'categoryId и parameterId обязательны' }, { status: 400 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).categoryParam.delete({ where: { categoryId_parameterId: { categoryId, parameterId } } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Ошибка удаления параметра' }, { status: 500 })
  }
}
