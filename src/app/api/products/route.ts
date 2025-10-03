import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/simple-rate-limit'
import { SKU_REGEX } from '@/lib/validators'

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = await (prisma as any).product.findMany({
      where: { isActive: true }, // Показываем только активные продукты
      select: {
        id: true,
        name: true,
        description: true,
  sku: true,
        price: true,
  attributes: true,
        images: true,
        advantages: true,
        applications: true,
        createdAt: true,
        category: {
          select: {
            code: true,
            nameRu: true,
            params: {
              where: { visible: true },
              select: {
                parameter: {
                  select: {
                    code: true,
                    nameRu: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' }
    })

    // Совместимость: возвращаем category как код + добавляем categoryNameRu
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = products.map((p: any) => ({
      ...p,
      images: Array.isArray(p.images) ? p.images : (p.images ? Object.values(p.images) : []),
      advantages: Array.isArray(p.advantages) ? p.advantages : [],
      applications: Array.isArray(p.applications) ? p.applications : [],
      category: p.category.code,
      categoryNameRu: p.category.nameRu,
      attributeLabels: Array.isArray(p.category.params)
        ? Object.fromEntries(
            p.category.params
              .filter((param: { parameter?: { code?: string; nameRu?: string } }) =>
                Boolean(param?.parameter?.code),
              )
              .map((param: { parameter: { code: string; nameRu: string } }) => [
                param.parameter.code,
                param.parameter.nameRu,
              ]),
          )
        : {},
    }))

    return NextResponse.json(payload, {
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

    // SKU (артикул) обязателен, уникален и ограничен по длине
    if (typeof data.sku !== 'string') {
      return NextResponse.json({ error: 'Артикул обязателен' }, { status: 400 })
    }
    const sku = data.sku.trim()
    if (!sku) {
      return NextResponse.json({ error: 'Артикул обязателен' }, { status: 400 })
    }
    if (sku.length > 64) {
      return NextResponse.json({ error: 'Артикул слишком длинный (макс. 64)' }, { status: 400 })
    }
    if (!SKU_REGEX.test(sku)) {
      return NextResponse.json({ error: 'Артикул может содержать только латиницу, цифры и символы _ - . ~' }, { status: 400 })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (prisma as any).product.findUnique({ where: { sku } })
    if (existing) {
      return NextResponse.json({ error: 'Артикул уже используется' }, { status: 409 })
    }

    // Найдём категорию по коду
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const category = await (prisma as any).category.findUnique({ where: { code: data.category } })
    if (!category) {
      return NextResponse.json({ error: 'Категория не найдена' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product = await (prisma as any).product.create({
      data: {
        name: data.name.trim(),
    description: data.description?.trim() || null,
    sku,
        price: data.price ? parseFloat(data.price) : null,
  categoryId: category.id,
        images: Array.isArray(data.images) ? data.images.slice(0,20) : [],
        isActive: data.isActive ?? true,
        advantages: Array.isArray(data.advantages) ? data.advantages.slice(0,25).map((a:string)=>a.toString().slice(0,240)) : [],
  applications: Array.isArray(data.applications) ? data.applications.slice(0,25).map((a:string)=>a.toString().slice(0,240)) : [],
  attributes: data.attributes && typeof data.attributes === 'object' ? data.attributes : undefined,
      }
    })
    
    // Логирование действий админа
  console.log(`Admin ${session.user.login} created product: ${product.name}`)
    
  return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Ошибка создания продукта:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    )
  }
}
