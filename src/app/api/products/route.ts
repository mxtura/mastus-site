import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/simple-rate-limit'

// Получение всех продуктов (публичный доступ)
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    const rateLimitResult = await rateLimit(`products_get_${clientIP}`)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Слишком много запросов. Попробуйте позже.' }, 
        { status: 429 }
      )
    }

    const products = await prisma.product.findMany({
      where: { isActive: true }, // Показываем только активные продукты
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        images: true,
        advantages: true,
        applications: true,
        size: true,
        thickness: true,
        weight: true,
        load: true,
        material: true,
        color: true,
        createdAt: true,
        // Не показываем внутренние поля
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(products, {
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
      }
    })
  } catch (error) {
    console.error('Ошибка получения продуктов:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    )
  }
}

// Создание продукта (только админы)
export async function POST(request: NextRequest) {
  try {
    // Проверка аутентификации и авторизации
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' }, 
        { status: 403 }
      )
    }

    // Rate limiting для админов
    const rateLimitResult = await rateLimit(`products_post_${session.user.id}`)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Слишком много запросов' }, 
        { status: 429 }
      )
    }

    const data = await request.json()
    
    // Валидация входных данных
    if (!data.name || typeof data.name !== 'string' || data.name.length > 255) {
      return NextResponse.json(
        { error: 'Некорректное название продукта' }, 
        { status: 400 }
      )
    }

    if (data.description && data.description.length > 2000) {
      return NextResponse.json(
        { error: 'Описание слишком длинное' }, 
        { status: 400 }
      )
    }

    const allowedCategories = ['MECHANICAL', 'ELECTRICAL', 'HYDRAULIC', 'PNEUMATIC', 'SPARE_PARTS', 'TOOLS', 'OTHER']
    if (!allowedCategories.includes(data.category)) {
      return NextResponse.json(
        { error: 'Некорректная категория' }, 
        { status: 400 }
      )
    }
    
    const product = await prisma.product.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        price: data.price ? parseFloat(data.price) : null,
        category: data.category,
        images: Array.isArray(data.images) ? data.images : [],
        isActive: data.isActive ?? true
      }
    })
    
    // Логирование действий админа
    console.log(`Admin ${session.user.email} created product: ${product.name}`)
    
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Ошибка создания продукта:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    )
  }
}
