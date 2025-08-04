const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedAdmin() {
  console.log('Создаем администратора...')
  
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

  console.log('Создан администратор:', admin.email)
}

async function seedProducts() {
  console.log('Очищаем существующие продукты...')
  await prisma.product.deleteMany({})
  
  const products = [
    {
      name: 'Люк полимер-песчаный тип Т (25т)',
      description: 'Полимер-песчаный люк для тяжелых нагрузок. Применяется на автомобильных дорогах и в местах с интенсивным движением транспорта.',
      category: 'MANHOLES',
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
      category: 'MANHOLES',
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
      category: 'MANHOLES',
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
      category: 'SUPPORT_RINGS',
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
      category: 'SUPPORT_RINGS',
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

  for (const product of products) {
    await prisma.product.create({ data: product })
    console.log(`Создан продукт: ${product.name}`)
  }
}

async function seedMessages() {
  console.log('Создаем тестовые сообщения...')
  
  const messages = [
    {
      name: 'Иван Петров',
      email: 'ivan.petrov@example.com',
      phone: '+7 (495) 123-45-67',
      company: 'ООО "ТехМаш"',
      subject: 'PRICE',
      message: 'Добрый день! Интересует стоимость и сроки поставки люков полимер-песчаных тип Т. Нужна подробная техническая документация и расчет для 50 штук.',
      status: 'NEW'
    },
    {
      name: 'Мария Сидорова',
      email: 'maria@metalworks.ru',
      phone: '+7 (812) 987-65-43',
      company: 'Металлообработка СПб',
      subject: 'TECHNICAL',
      message: 'Нужна техническая консультация по подбору опорных колец для реконструкции канализационной сети. Диаметр колодцев 700-1000 мм.',
      status: 'PROCESSING'
    },
    {
      name: 'Алексей Козлов',
      email: 'a.kozlov@stroy.com',
      phone: '+7 (343) 555-12-34',
      company: 'СтройДор',
      subject: 'ORDER',
      message: 'Требуется регулярная поставка люков различных типов для дорожного строительства. Интересуют оптовые цены и условия поставки.',
      status: 'COMPLETED'
    },
    {
      name: 'Елена Волкова',
      email: 'e.volkova@gorod.ru',
      phone: '+7 (495) 777-88-99',
      company: 'Управление городского хозяйства',
      subject: 'DELIVERY',
      message: 'Уточните, пожалуйста, возможные сроки доставки в регионы и стоимость транспортировки для крупных партий.',
      status: 'NEW'
    }
  ]

  for (const message of messages) {
    await prisma.contactMessage.create({ data: message })
    console.log(`Создано сообщение от: ${message.name}`)
  }
}

async function main() {
  console.log('Начинаем заполнение тестовыми данными...')
  
  // await seedAdmin()
  await seedProducts()
  await seedMessages()
  
  console.log('Тестовые данные успешно добавлены!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
