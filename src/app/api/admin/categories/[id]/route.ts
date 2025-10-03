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
    const nameRu = typeof body.nameRu === 'string' ? body.nameRu.trim() : undefined
    const description =
      typeof body.description === 'string'
        ? body.description.trim()
        : body.description === null
        ? null
        : undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await (prisma as any).category.update({
      where: { id },
      data: {
        ...(nameRu !== undefined ? { nameRu } : {}),
        ...(description !== undefined ? { description } : {}),
      },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Ошибка обновления категории' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }
  try {
    // 1) Проверим, нет ли связанных продуктов
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productsCount = await (prisma as any).product.count({ where: { categoryId: id } })
    if (productsCount > 0) {
      return NextResponse.json({ error: 'Невозможно удалить: есть связанные товары' }, { status: 409 })
    }

    // 2) Удалим привязки параметров категории (CategoryParam)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).categoryParam.deleteMany({ where: { categoryId: id } })

    // 3) Удалим саму категорию
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    // Скорее всего, есть связанные продукты
    return NextResponse.json({ error: 'Невозможно удалить: есть связанные товары' }, { status: 409 })
  }
}
