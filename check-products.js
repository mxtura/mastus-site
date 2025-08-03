const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    const products = await prisma.product.findMany();
    console.log('=== ПРОДУКТЫ В БАЗЕ ДАННЫХ ===');
    console.log(`Всего продуктов: ${products.length}`);
    console.log('');
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Категория: ${product.category}`);
      console.log(`   Цена: ${product.price} ₽`);
      console.log(`   Активен: ${product.isActive ? 'Да' : 'Нет'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Ошибка при получении продуктов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
