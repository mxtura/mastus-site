// Production-ready rate limiting с Redis и fallback на in-memory
import redisClient from './redis'

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Fallback in-memory storage
const memoryRequests = new Map<string, RateLimitEntry>()
const WINDOW_SIZE = 60 * 1000 // 1 минута
const MAX_REQUESTS = 100 // максимум запросов за окно

export async function rateLimit(identifier: string): Promise<{ success: boolean; remaining: number }> {
  const now = Date.now()
  const windowStart = now - WINDOW_SIZE
  const key = `rate_limit:${identifier}`

  try {
    // Пытаемся использовать Redis
    if (redisClient && redisClient.isReady()) {
      const client = redisClient.getClient()
      
      // Используем Redis sorted sets для sliding window
      const pipeline = client.multi()
      
      // Удаляем старые записи
      pipeline.zRemRangeByScore(key, 0, windowStart)
      
      // Считаем текущие запросы
      pipeline.zCard(key)
      
      // Добавляем новый запрос
      pipeline.zAdd(key, { score: now, value: now.toString() })
      
      // Устанавливаем TTL
      pipeline.expire(key, Math.ceil(WINDOW_SIZE / 1000))
      
      const results = await pipeline.exec()
      // Безопасное извлечение результата zCard
      let currentCount = 0
      if (results && results[1] !== null && results[1] !== undefined) {
        currentCount = Number(results[1]) || 0
      }
      
      if (currentCount >= MAX_REQUESTS) {
        return { success: false, remaining: 0 }
      }
      
      return { success: true, remaining: MAX_REQUESTS - currentCount - 1 }
    }
  } catch (error) {
    console.warn('Redis rate limiting failed, falling back to memory:', error)
  }

  // Fallback к in-memory решению
  return memoryRateLimit(identifier, now)
}

// In-memory fallback
function memoryRateLimit(identifier: string, now: number): { success: boolean; remaining: number } {
  const entry = memoryRequests.get(identifier)

  if (!entry || now > entry.resetTime) {
    // Новое окно или первый запрос
    memoryRequests.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_SIZE
    })
    return { success: true, remaining: MAX_REQUESTS - 1 }
  }

  if (entry.count >= MAX_REQUESTS) {
    return { success: false, remaining: 0 }
  }

  entry.count++
  memoryRequests.set(identifier, entry)
  
  return { success: true, remaining: MAX_REQUESTS - entry.count }
}

// Очистка старых записей для in-memory fallback
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of memoryRequests.entries()) {
    if (now > entry.resetTime) {
      memoryRequests.delete(key)
    }
  }
}, WINDOW_SIZE)

// Export для использования в других местах
export { MAX_REQUESTS, WINDOW_SIZE }
