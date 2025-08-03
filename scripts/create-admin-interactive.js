const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

function questionHidden(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt)
    process.stdin.setRawMode(true)
    process.stdin.resume()
    
    let password = ''
    process.stdin.on('data', function(char) {
      char = char + ''
      
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false)
          process.stdin.pause()
          console.log()
          resolve(password)
          break
        case '\u0003':
          process.exit()
          break
        default:
          password += char
          process.stdout.write('*')
          break
      }
    })
  })
}

async function main() {
  console.log('=== Создание администратора ===\n')
  
  // Проверяем, есть ли уже администратор
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (existingAdmin) {
    console.log('❌ Администратор уже существует:', existingAdmin.email)
    const overwrite = await question('Создать нового администратора? (y/N): ')
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Отменено.')
      return
    }
  }

  // Получаем данные для нового администратора
  const email = await question('Email администратора: ')
  if (!email || !email.includes('@')) {
    throw new Error('Некорректный email')
  }

  const name = await question('Имя администратора: ') || 'Администратор'
  
  const password = await questionHidden('Пароль администратора: ')
  if (!password || password.length < 6) {
    throw new Error('Пароль должен содержать минимум 6 символов')
  }

  const confirmPassword = await questionHidden('Подтвердите пароль: ')
  if (password !== confirmPassword) {
    throw new Error('Пароли не совпадают')
  }

  console.log('\n=== Создание администратора ===')
  console.log('Email:', email)
  console.log('Имя:', name)
  
  const confirm = await question('Создать администратора? (Y/n): ')
  if (confirm.toLowerCase() === 'n') {
    console.log('Отменено.')
    return
  }

  // Хэшируем пароль
  console.log('Хэширование пароля...')
  const hashedPassword = await bcrypt.hash(password, 12)

  // Удаляем старого админа если создаем нового
  if (existingAdmin) {
    await prisma.user.delete({
      where: { id: existingAdmin.id }
    })
    console.log('Старый администратор удален.')
  }

  // Создаем администратора
  console.log('Создание администратора...')
  const admin = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log('\n✅ Администратор успешно создан!')
  console.log('Email:', admin.email)
  console.log('Имя:', admin.name)
  console.log('\nТеперь вы можете войти в админку по адресу: admin.mxbox.fun')
}

main()
  .catch((e) => {
    console.error('\n❌ Ошибка:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    rl.close()
  })
