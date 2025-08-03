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

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Ошибка получения продуктов:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    )
  }
}
