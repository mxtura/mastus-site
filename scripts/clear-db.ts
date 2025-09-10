import { PrismaClient } from '@prisma/client'

// Safety guard: require explicit confirmation via env var
if (!process.env.FORCE_DB_CLEAR) {
  console.error('\n[ОТМЕНЕНО] Не установлена переменная окружения FORCE_DB_CLEAR=1. Очистка БД не выполнена.')
  console.error('Чтобы очистить БД, запустите команду с FORCE_DB_CLEAR=1 перед командой.')
  console.error('Пример (PowerShell):')
  console.error('  $env:FORCE_DB_CLEAR=1; npm run db:clear')
  process.exit(1)
}

const prisma = new PrismaClient()

async function clearDb() {
  console.log('--- НАЧИНАЕМ ОЧИСТКУ БАЗЫ ДАННЫХ ---')
  console.time('db:clear')

  // Порядок важен при наличии внешних ключей. Сейчас FK нет, но оставим логику.
  // Если решите оставить некоторых пользователей (например SUPER_ADMIN), скорректируйте where.

  const results = await prisma.$transaction([
    prisma.contactMessage.deleteMany(),
    prisma.product.deleteMany(),
    prisma.user.deleteMany(), // при необходимости сохраните аккаунт(ы) через where: { email: { notIn: [...] } }
  ])

  console.log('Удалено записей (ContactMessage, Product, User):', results.map(r => r.count).join(', '))

  console.timeEnd('db:clear')
  console.log('--- ОЧИСТКА ЗАВЕРШЕНА ---')
}

clearDb()
  .catch(e => {
    console.error('Ошибка при очистке БД:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
