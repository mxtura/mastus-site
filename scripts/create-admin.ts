import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { EMAIL_CONFIG } from '../src/lib/constants'

const prisma = new PrismaClient()

async function main() {
  // Проверяем, есть ли уже администратор
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (existingAdmin) {
    console.log('Администратор уже существует:', existingAdmin.email)
    return
  }

  // Создаем администратора
  const email = EMAIL_CONFIG.admin
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  
  const hashedPassword = await bcrypt.hash(password, 12)

  const admin = await prisma.user.create({
    data: {
      email,
      name: 'Администратор',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log('Администратор создан:', admin.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
