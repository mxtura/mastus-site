// Тестовая утилита для проверки rate limiting
import { rateLimit } from './rate-limit'

export async function testRateLimit() {
  console.log('🧪 Тестирование rate limiting...')
  
  const testId = 'test_user_123'
  const results = []
  
  // Делаем 5 быстрых запросов
  for (let i = 1; i <= 5; i++) {
    const result = await rateLimit(testId)
    results.push({
      request: i,
      success: result.success,
      remaining: result.remaining
    })
    console.log(`Запрос ${i}: success=${result.success}, remaining=${result.remaining}`)
  }
  
  return results
}

// Функция для очистки Redis данных (для тестирования)
export async function clearRateLimitData(identifier: string) {
  try {
    const { default: redisClient } = await import('./redis')
    if (redisClient && redisClient.isReady()) {
      const client = redisClient.getClient()
      await client.del(`rate_limit:${identifier}`)
      console.log(`✅ Очищены данные rate limiting для ${identifier}`)
    }
  } catch (error) {
    console.log('⚠️ Не удалось очистить Redis, используется in-memory fallback', error)
  }
}
