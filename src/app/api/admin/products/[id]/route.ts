import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/simple-rate-limit'

async function ensureAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return null
  }
  return session
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await ensureAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const rateResult = await rateLimit(`admin_product_patch_${session.user.id}`)
    if (!rateResult.success) {
      return NextResponse.json({ error: 'Слишком много запросов' }, { status: 429 })
    }

    const data = await request.json()

    // если передана категория — найдём её id по коду
    let categoryIdToSet: string | undefined = undefined
    if (data.category) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cat = await (prisma as any).category.findUnique({ where: { code: data.category } })
      if (!cat) {
        return NextResponse.json({ error: 'Категория не найдена' }, { status: 400 })
      }
      categoryIdToSet = cat.id
    }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await (prisma as any).product.update({
      where: { id },
      data: {
        name: data.name?.trim(),
        description: data.description?.trim(),
        price: data.price !== undefined && data.price !== null && data.price !== '' ? parseFloat(data.price) : null,
        ...(categoryIdToSet ? { categoryId: categoryIdToSet } : {}),
        isActive: data.isActive,
        images: Array.isArray(data.images) ? data.images.slice(0,20) : undefined,
        advantages: Array.isArray(data.advantages) ? data.advantages.slice(0,25).map((a:string)=>a.toString().slice(0,240)) : undefined,
        applications: Array.isArray(data.applications) ? data.applications.slice(0,25).map((a:string)=>a.toString().slice(0,240)) : undefined,
  // dynamic attributes bag; validate key/value types lightly
  attributes: data.attributes && typeof data.attributes === 'object' ? data.attributes : undefined,
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Ошибка обновления продукта:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await ensureAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }
    const rateResult = await rateLimit(`admin_product_delete_${session.user.id}`)
    if (!rateResult.success) {
      return NextResponse.json({ error: 'Слишком много запросов' }, { status: 429 })
    }

    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка удаления продукта:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
