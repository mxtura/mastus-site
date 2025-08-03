const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Проверка подключения к базе данных...')
    
    // Простой запрос для проверки подключения
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Подключение к базе данных успешно')
    
    // Проверяем таблицы
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    console.log('\n📋 Таблицы в базе данных:')
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`)
    })
    
    // Проверяем администраторов
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    })
    
    console.log(`\n👤 Количество администраторов: ${adminCount}`)
    
    if (adminCount === 0) {
      console.log('⚠️  Администратор не найден. Запустите скрипт создания администратора.')
    }
    
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error.message)
    process.exit(1)
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
