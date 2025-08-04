// Серверный Redis клиент - только для API роутов
import { createClient } from 'redis'

class RedisClient {
  private static instance: RedisClient
  private client: ReturnType<typeof createClient> | null = null
  private isConnected = false
  private connecting = false

  private constructor() {}

  static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient()
    }
    return RedisClient.instance
  }

  async connect(): Promise<void> {
    // Проверяем, что мы на сервере
    if (typeof window !== 'undefined') {
      throw new Error('Redis client can only be used on the server side')
    }

    if (this.isConnected && this.client?.isReady) {
      return
    }

    if (this.connecting) {
      // Ждем текущее подключение
      let attempts = 0
      while (this.connecting && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }
      return
    }

    this.connecting = true

    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000
        }
      })

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err)
        this.isConnected = false
      })

      this.client.on('connect', () => {
        console.log('Redis connected')
        this.isConnected = true
      })

      this.client.on('disconnect', () => {
        console.log('Redis disconnected')
        this.isConnected = false
      })

      await this.client.connect()
    } catch (error) {
      console.error('Failed to connect to Redis:', error)
      this.isConnected = false
    } finally {
      this.connecting = false
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit()
      this.isConnected = false
    }
  }

  getClient() {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected')
    }
    return this.client
  }

  isReady(): boolean {
    return this.isConnected && this.client?.isReady === true
  }
}

// Функция для безопасного получения Redis клиента
export async function getRedisClient(): Promise<RedisClient | null> {
  // Проверяем, что мы на сервере
  if (typeof window !== 'undefined') {
    return null
  }

  try {
    const client = RedisClient.getInstance()
    await client.connect()
    return client
  } catch (error) {
    console.warn('Redis not available:', error)
    return null
  }
}

// Singleton instance (только для сервера)
const redisClientInstance = typeof window === 'undefined' 
  ? RedisClient.getInstance()
  : null

export { redisClientInstance as redisClient }
export default redisClientInstance
