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

    const allowedCategories = ['MANHOLES', 'SUPPORT_RINGS', 'LADDERS']
    if (data.category && !allowedCategories.includes(data.category)) {
      return NextResponse.json({ error: 'Некорректная категория' }, { status: 400 })
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: data.name?.trim(),
        description: data.description?.trim(),
        price: data.price !== undefined && data.price !== null && data.price !== '' ? parseFloat(data.price) : null,
        category: data.category,
        isActive: data.isActive,
        images: Array.isArray(data.images) ? data.images.slice(0,20) : undefined,
        size: data.size?.toString().slice(0,120),
        thickness: data.thickness?.toString().slice(0,120),
        weight: data.weight?.toString().slice(0,120),
        load: data.load?.toString().slice(0,120),
        material: data.material?.toString().slice(0,160),
        color: data.color?.toString().slice(0,120),
        advantages: Array.isArray(data.advantages) ? data.advantages.slice(0,25).map((a:string)=>a.toString().slice(0,240)) : undefined,
        applications: Array.isArray(data.applications) ? data.applications.slice(0,25).map((a:string)=>a.toString().slice(0,240)) : undefined,
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
