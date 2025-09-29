import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/simple-rate-limit'

// Полный доступ к продуктам (только админы)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' }, 
        { status: 403 }
      )
    }

    // Rate limiting для админов
    const rateLimitResult = await rateLimit(`admin_products_${session.user.id}`)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Слишком много запросов' }, 
        { status: 429 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = await (prisma as any).product.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
  sku: true,
        price: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        images: true,
  attributes: true,
        advantages: true,
        applications: true,
        category: { select: { code: true, nameRu: true } },
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = products.map((p: any) => ({
      ...p,
      images: Array.isArray(p.images) ? p.images : (p.images ? Object.values(p.images) : []),
      advantages: Array.isArray(p.advantages) ? p.advantages : [],
      applications: Array.isArray(p.applications) ? p.applications : [],
      category: p.category.code,
      categoryNameRu: p.category.nameRu,
    }))
    
    return NextResponse.json(payload)
  } catch (error) {
    console.error('Ошибка получения продуктов:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    )
  }
}
