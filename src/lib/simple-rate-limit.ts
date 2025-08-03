// Простой rate limiting только в памяти для избежания Redis на клиенте
interface RateLimitEntry {
  count: number
  resetTime: number
}

const requests = new Map<string, RateLimitEntry>()

const MAX_REQUESTS = 100 // максимальное количество запросов
const WINDOW_SIZE = 60 * 1000 // окно в 1 минуту

export async function rateLimit(identifier: string): Promise<{ success: boolean; remaining: number }> {
  const now = Date.now()
  const entry = requests.get(identifier)

  if (!entry) {
    // Первый запрос от этого идентификатора
    requests.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_SIZE
    })
    return { success: true, remaining: MAX_REQUESTS - 1 }
  }

  if (now > entry.resetTime) {
    // Окно сброшено
    requests.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_SIZE
    })
    return { success: true, remaining: MAX_REQUESTS - 1 }
  }

  if (entry.count >= MAX_REQUESTS) {
    // Превышен лимит
    return { success: false, remaining: 0 }
  }

  // Увеличиваем счетчик
  entry.count++
  requests.set(identifier, entry)
  
  return { success: true, remaining: MAX_REQUESTS - entry.count }
}

// Очистка старых записей каждую минуту
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of requests.entries()) {
    if (now > entry.resetTime) {
      requests.delete(key)
    }
  }
}, WINDOW_SIZE)

export { MAX_REQUESTS, WINDOW_SIZE }
