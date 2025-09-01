import { PrismaClient, ProductCategory, ContactSubject, MessageStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

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

  const products: Array<Parameters<typeof prisma.product.create>[0]['data']> = [
    {
      name: 'Люки дачные',
      description: 'Дачные люки: легкие, устойчивые к коррозии, подходят для частных участков и садовых зон.',
      category: ProductCategory.MANHOLES,
      images: ['/images/1000018986.png'],
      advantages: [
        'Легкий монтаж',
        'Долговечный материал',
        'Не подвержен коррозии'
      ],
      applications: [
        'Частные участки',
        'Садово-огородные зоны'
      ],
      isActive: true
    },
    {
      name: 'Люки ГТС',
      description: 'Люки для городских телекоммуникационных сетей и инженерной инфраструктуры.',
      category: ProductCategory.MANHOLES,
      images: ['/images/1000018987.png'],
      advantages: [
        'Прочность под городские нагрузки',
        'Антивандальное исполнение',
        'Устойчивость к химическому воздействию'
      ],
      applications: [
        'Городские кабельные колодцы',
        'Инженерные сети'
      ],
      isActive: true
    },
    {
      name: 'Люк лёгкий 30кН',
      description: 'Легкий люк для зон с минимальными нагрузками: газоны, пешеходные участки.',
      category: ProductCategory.MANHOLES,
      images: ['/images/1000018988.png'],
      load: '30 кН',
      advantages: [
        'Низкий вес',
        'Экономичность',
        'Простой монтаж'
      ],
      applications: [
        'Газоны',
        'Пешеходные зоны'
      ],
      isActive: true
    },
    {
      name: 'Люк тяжёлый 150-250кН',
      description: 'Тяжёлый люк для автомобильных дорог и промышленных площадок с повышенными нагрузками.',
      category: ProductCategory.MANHOLES,
      images: ['/images/1000018990.png'],
      load: '150-250 кН',
      advantages: [
        'Высокая несущая способность',
        'Ударопрочность',
        'Долгий срок службы'
      ],
      applications: [
        'Автомобильные дороги',
        'Промышленные территории'
      ],
      isActive: true
    },
    {
      name: 'Люк средний 70кН',
      description: 'Средний люк для зон со смешанной нагрузкой: парковки, дворовые территории.',
      category: ProductCategory.MANHOLES,
      images: ['/images/1000018993.png'],
      load: '70 кН',
      advantages: [
        'Баланс цена/прочность',
        'Надежная конструкция',
        'Износостойкость'
      ],
      applications: [
        'Парковки',
        'Дворовые территории'
      ],
      isActive: true
    },
    {
      name: 'Аллюминиевая трехсекционная универсальная лестница',
      description: 'Трехсекционная универсальная алюминиевая лестница для профессионального и бытового применения.',
      category: ProductCategory.LADDERS,
      images: ['/images/IMG_5841.png'],
      advantages: [
        'Три режима использования',
        'Прочный алюминиевый сплав',
        'Компактное хранение'
      ],
      applications: [
        'Строительно-монтажные работы',
        'Склад',
        'Домашнее использование'
      ],
      isActive: true
    },
    {
      name: 'Аллюминиевая двухсекционная универсальная лестница',
      description: 'Двухсекционная универсальная алюминиевая лестница с надежными фиксаторами.',
      category: ProductCategory.LADDERS,
      images: ['/images/IMG_5844.png'],
      advantages: [
        'Два режима (приставная / стремянка)',
        'Легкость и прочность',
        'Противоскользящие элементы'
      ],
      applications: [
        'Ремонт',
        'Отделочные работы',
        'Бытовые задачи'
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
  const messages: Array<Parameters<typeof prisma.contactMessage.create>[0]['data']> = [
    {
      name: 'Иван Петров',
      email: 'ivan.petrov@example.com',
      phone: '+7 (495) 123-45-67',
      company: 'ООО "ТехМаш"',
      subject: ContactSubject.PRICE,
      message: 'Добрый день! Интересует стоимость и сроки поставки люков полимер-песчаных тип Т. Нужна подробная техническая документация и расчет для 50 штук.',
      status: MessageStatus.NEW
    },
    {
      name: 'Мария Сидорова',
      email: 'maria@metalworks.ru',
      phone: '+7 (812) 987-65-43',
      company: 'Металлообработка СПб',
      subject: ContactSubject.TECHNICAL,
      message: 'Нужна техническая консультация по подбору опорных колец для реконструкции канализационной сети. Диаметр колодцев 700-1000 мм.',
      status: MessageStatus.PROCESSING
    },
    {
      name: 'Алексей Козлов',
      email: 'a.kozlov@stroy.com',
      phone: '+7 (343) 555-12-34',
      company: 'СтройДор',
      subject: ContactSubject.ORDER,
      message: 'Требуется регулярная поставка люков различных типов для дорожного строительства. Интересуют оптовые цены и условия поставки.',
      status: MessageStatus.COMPLETED
    },
    {
      name: 'Елена Волкова',
      email: 'e.volkova@gorod.ru',
      phone: '+7 (495) 777-88-99',
      company: 'Управление городского хозяйства',
      subject: ContactSubject.DELIVERY,
      message: 'Уточните, пожалуйста, возможные сроки доставки в регионы и стоимость транспортировки для крупных партий.',
      status: MessageStatus.NEW
    }
  ]

  for (const msg of messages) {
    await prisma.contactMessage.create({ data: msg })
    console.log(`Создано сообщение от: ${msg.name}`)
  }
}

async function main() {
  console.log('Начинаем заполнение тестовыми данными...')
  await seedAdmin()
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
