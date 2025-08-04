#!/usr/bin/env node

const https = require('https');

async function testProductsAPI() {
  console.log('🔍 Тестируем API продуктов...\n');
  
  const urls = [
    'https://mxbox.fun/api/products',
    'https://admin.mxbox.fun/api/products'
  ];
  
  for (const url of urls) {
    console.log(`📡 Запрос к: ${url}`);
    
    try {
      const response = await makeRequest(url);
      console.log(`✅ Статус: ${response.statusCode}`);
      console.log(`📄 Headers:`, response.headers);
      
      if (response.data) {
        const data = JSON.parse(response.data);
        if (Array.isArray(data)) {
          console.log(`📦 Найдено продуктов: ${data.length}`);
          data.forEach((product, index) => {
            console.log(`   ${index + 1}. ${product.name} (${product.category})`);
          });
        } else {
          console.log(`📄 Ответ:`, data);
        }
      }
    } catch (error) {
      console.log(`❌ Ошибка: ${error.message}`);
    }
    
    console.log('─'.repeat(50));
  }
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        'User-Agent': 'Test-Script/1.0',
        'Accept': 'application/json'
      }
    }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          data: data
        });
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Запуск теста
testProductsAPI().catch(console.error);
