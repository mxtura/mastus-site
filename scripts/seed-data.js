const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedProducts() {
  const products = [
    {
      name: 'Люк чугунный тяжелый класса D400',
      description: 'Люк канализационный чугунный для проезжей части дорог с интенсивным движением.',
      price: 4500,
      category: 'MANHOLES',
      size: '600x600 мм',
      thickness: '40 мм',
      weight: '42 кг',
      load: '40 тонн',
      material: 'чугун СЧ20',
      color: 'черный',
      advantages: ['Высокая прочность', 'Устойчивость к коррозии', 'Долговечность'],
      applications: ['Проезжая часть', 'Автомагистрали', 'Промышленные зоны'],
      isAvailable: true
    },
    {
      name: 'Люк композитный легкий класса A15',
      description: 'Легкий композитный люк для пешеходных зон и тротуаров.',
      price: 2800,
      category: 'MANHOLES',
      size: '500x500 мм',
      thickness: '30 мм',
      weight: '15 кг',
      load: '1.5 тонны',
      material: 'композитный материал',
      color: 'серый',
      advantages: ['Легкий вес', 'Не подвержен коррозии', 'Экономичность'],
      applications: ['Тротуары', 'Пешеходные зоны', 'Частные территории'],
      isAvailable: true
    },
    {
      name: 'Опорное кольцо бетонное КС-15-9',
      description: 'Железобетонное опорное кольцо для канализационных колодцев.',
      price: 1200,
      category: 'SUPPORT_RINGS',
      size: 'диаметр 1500 мм',
      thickness: '120 мм',
      weight: '680 кг',
      load: '25 тонн',
      material: 'железобетон В25',
      color: 'серый',
      advantages: ['Высокая несущая способность', 'Морозостойкость', 'Стандартные размеры'],
      applications: ['Канализационные колодцы', 'Водопроводные сети', 'Ливневая канализация'],
      isAvailable: true
    },
    {
      name: 'Опорное кольцо полимерное КП-10-6',
      description: 'Легкое полимерное опорное кольцо с высокой химической стойкостью.',
      price: 2100,
      category: 'SUPPORT_RINGS',
      size: 'диаметр 1000 мм',
      thickness: '80 мм',
      weight: '45 кг',
      load: '15 тонн',
      material: 'полимер ПВХ',
      color: 'оранжевый',
      advantages: ['Легкий вес', 'Химическая стойкость', 'Простота монтажа'],
      applications: ['Промышленные сети', 'Химические предприятия', 'Агрессивные среды'],
      isAvailable: true
    },
    {
      name: 'Люк чугунный квадратный 800x800',
      description: 'Усиленный чугунный люк квадратной формы для особо тяжелых условий эксплуатации.',
      price: null, // По запросу
      category: 'MANHOLES',
      size: '800x800 мм',
      thickness: '50 мм',
      weight: '85 кг',
      load: '90 тонн',
      material: 'чугун СЧ25',
      color: 'черный',
      advantages: ['Максимальная прочность', 'Антивандальные свойства', 'Увеличенный размер'],
      applications: ['Аэропорты', 'Портовые территории', 'Складские комплексы'],
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
