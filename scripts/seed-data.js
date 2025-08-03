const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedProducts() {
  const products = [
    {
      name: 'Гидравлический пресс ГП-100',
      description: 'Мощный гидравлический пресс для промышленного использования. Максимальное усилие 100 тонн.',
      price: 450000,
      category: 'HYDRAULIC',
      specifications: {
        maxForce: '100 тонн',
        workingHeight: '1500 мм',
        tableSize: '800x600 мм',
        power: '7.5 кВт'
      },
      isAvailable: true
    },
    {
      name: 'Электродвигатель АИР-132М4',
      description: 'Асинхронный трехфазный электродвигатель серии АИР. Надежность и долговечность.',
      price: 28500,
      category: 'ELECTRICAL',
      specifications: {
        power: '11 кВт',
        voltage: '380В',
        frequency: '50 Гц',
        speed: '1500 об/мин'
      },
      isAvailable: true
    },
    {
      name: 'Пневматический цилиндр ПЦ-200',
      description: 'Двустороннего действия с магнитными датчиками положения поршня.',
      price: 12400,
      category: 'PNEUMATIC',
      specifications: {
        bore: '200 мм',
        stroke: '500 мм',
        pressure: '0.6 МПа',
        medium: 'сжатый воздух'
      },
      isAvailable: true
    },
    {
      name: 'Подшипник качения 6312',
      description: 'Радиальный шариковый подшипник для средних нагрузок.',
      price: 850,
      category: 'SPARE_PARTS',
      specifications: {
        innerDiameter: '60 мм',
        outerDiameter: '130 мм',
        width: '31 мм',
        load: '2000 кг'
      },
      isAvailable: true
    },
    {
      name: 'Токарный станок ТС-16К20',
      description: 'Универсальный токарно-винторезный станок для обработки различных деталей.',
      price: null, // По запросу
      category: 'MECHANICAL',
      specifications: {
        swingOverBed: '400 мм',
        distanceBetweenCenters: '1000 мм',
        spindleSpeed: '12.5-2000 об/мин',
        power: '11 кВт'
      },
      isAvailable: true
    }
  ]

  for (const product of products) {
    await prisma.product.create({ data: product })
    console.log(`Создан продукт: ${product.name}`)
  }
}

async function seedMessages() {
  const messages = [
    {
      name: 'Иван Петров',
      email: 'ivan.petrov@example.com',
      phone: '+7 (495) 123-45-67',
      company: 'ООО "ТехМаш"',
      subject: 'Запрос цены на гидравлический пресс',
      message: 'Добрый день! Интересует стоимость и сроки поставки гидравлического пресса усилием 100 тонн. Нужна подробная техническая документация.',
      status: 'NEW'
    },
    {
      name: 'Мария Сидорова',
      email: 'maria@metalworks.ru',
      phone: '+7 (812) 987-65-43',
      company: 'Металлобработка СПб',
      subject: 'Техническая консультация',
      message: 'Нужна помощь в подборе электродвигателя для промышленного вентилятора. Мощность 15 кВт, 1500 об/мин.',
      status: 'READ'
    },
    {
      name: 'Алексей Козлов',
      email: 'a.kozlov@autoparts.com',
      phone: '+7 (343) 555-12-34',
      company: null,
      subject: 'Поставка подшипников',
      message: 'Требуется регулярная поставка подшипников качения различных типоразмеров. Интересуют оптовые цены.',
      status: 'REPLIED'
    }
  ]

  for (const message of messages) {
    await prisma.contactMessage.create({ data: message })
    console.log(`Создано сообщение от: ${message.name}`)
  }
}

async function main() {
  console.log('Начинаем заполнение тестовыми данными...')
  
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
