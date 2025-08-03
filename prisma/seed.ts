import { PrismaClient, ProductCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Создаем админского пользователя
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mastus.ru' },
    update: {},
    create: {
      email: 'admin@mastus.ru',
      password: hashedPassword,
      name: 'Администратор МАСТУС',
      role: 'ADMIN'
    }
  })

  console.log('Created admin user:', admin)
  
  // Создаем тестовые продукты
  const products = [
    {
      name: 'Люк полимер-песчаный тип Т (25т)',
      description: 'Полимер-песчаный люк для тяжелых нагрузок. Применяется на автомобильных дорогах и в местах с интенсивным движением транспорта.',
      category: 'MANHOLES' as ProductCategory,
      size: '700x700 мм',
      thickness: '80 мм',
      weight: '45 кг',
      load: '25 тонн',
      material: 'Полимер-песчаная смесь',
      color: 'Черный, коричневый, зеленый',
      advantages: [
        'Высокая прочность и долговечность',
        'Устойчивость к химической коррозии',
        'Морозостойкость до -50°C',
        'Не подвержен краже',
        'Не скользит при намокании'
      ],
      applications: [
        'Автомобильные дороги',
        'Парковочные зоны',
        'Промышленные территории',
        'Городские магистрали'
      ],
      price: 3500.00,
      images: [
        '/images/products/manhole-t25-1.jpg',
        '/images/products/manhole-t25-2.jpg'
      ],
      isActive: true
    },
    {
      name: 'Люк полимер-песчаный тип А (12,5т)',
      description: 'Полимер-песчаный люк для средних нагрузок. Идеально подходит для пешеходных зон и дворовых территорий.',
      category: 'MANHOLES' as ProductCategory,
      size: '600x600 мм',
      thickness: '60 мм',
      weight: '35 кг',
      load: '12,5 тонн',
      material: 'Полимер-песчаная смесь',
      color: 'Черный, коричневый, зеленый',
      advantages: [
        'Оптимальное соотношение цена-качество',
        'Легкий вес для удобства монтажа',
        'Устойчивость к ультрафиолету',
        'Экологически безопасен',
        'Бесшумность при проезде'
      ],
      applications: [
        'Пешеходные зоны',
        'Дворовые территории',
        'Парки и скверы',
        'Тротуары'
      ],
      price: 2800.00,
      images: [
        '/images/products/manhole-a12-1.jpg',
        '/images/products/manhole-a12-2.jpg'
      ],
      isActive: true
    },
    {
      name: 'Люк полимер-песчаный тип С (4т)',
      description: 'Легкий полимер-песчаный люк для газонов и зеленых зон. Применяется в местах с минимальными нагрузками.',
      category: 'MANHOLES' as ProductCategory,
      size: '500x500 мм',
      thickness: '40 мм',
      weight: '20 кг',
      load: '4 тонны',
      material: 'Полимер-песчаная смесь',
      color: 'Зеленый, черный',
      advantages: [
        'Минимальный вес',
        'Возможность окраски в любой цвет',
        'Устойчивость к перепадам температур',
        'Простота установки',
        'Низкая стоимость'
      ],
      applications: [
        'Газоны и клумбы',
        'Зеленые зоны',
        'Частные территории',
        'Садово-парковые зоны'
      ],
      price: 1800.00,
      images: [
        '/images/products/manhole-c4-1.jpg',
        '/images/products/manhole-c4-2.jpg'
      ],
      isActive: true
    },
    {
      name: 'Кольцо опорное полимер-песчаное КО-1',
      description: 'Опорное кольцо для установки люков. Обеспечивает надежную фиксацию и равномерное распределение нагрузки.',
      category: 'SUPPORT_RINGS' as ProductCategory,
      size: 'Ø700 мм, высота 100 мм',
      thickness: '50 мм',
      weight: '25 кг',
      load: '25 тонн',
      material: 'Полимер-песчаная смесь',
      color: 'Черный, серый',
      advantages: [
        'Точная геометрия',
        'Устойчивость к деформации',
        'Простота монтажа',
        'Долговечность',
        'Совместимость со всеми типами люков'
      ],
      applications: [
        'Установка тяжелых люков',
        'Автомобильные дороги',
        'Промышленные объекты',
        'Городская инфраструктура'
      ],
      price: 1200.00,
      images: [
        '/images/products/ring-ko1-1.jpg',
        '/images/products/ring-ko1-2.jpg'
      ],
      isActive: true
    },
    {
      name: 'Кольцо опорное полимер-песчаное КО-2',  
      description: 'Опорное кольцо средней нагрузки для установки люков типа А. Обеспечивает стабильность конструкции.',
      category: 'SUPPORT_RINGS' as ProductCategory,
      size: 'Ø600 мм, высота 80 мм',
      thickness: '40 мм',
      weight: '18 кг',
      load: '12,5 тонн',
      material: 'Полимер-песчаная смесь',
      color: 'Черный, серый',
      advantages: [
        'Оптимальные размеры',
        'Устойчивость к нагрузкам',
        'Коррозионная стойкость',
        'Морозостойкость',
        'Экономичность'
      ],
      applications: [
        'Установка средних люков',
        'Дворовые территории',
        'Пешеходные зоны',
        'Парковые зоны'
      ],
      price: 900.00,
      images: [
        '/images/products/ring-ko2-1.jpg',
        '/images/products/ring-ko2-2.jpg'
      ],
      isActive: true
    }
  ]

  // Очищаем существующие продукты и добавляем новые
  await prisma.product.deleteMany({})
  
  for (const product of products) {
    await prisma.product.create({
      data: product
    })
    console.log(`Created product: ${product.name}`)
  }

  console.log('Created test products')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
