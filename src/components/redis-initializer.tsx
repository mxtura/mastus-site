'use client'

import { useEffect } from 'react'

// Компонент для инициализации Redis подключения
export default function RedisInitializer() {
  useEffect(() => {
    // Инициализируем Redis подключение при загрузке приложения
    const initRedis = async () => {
      try {
        const { default: redisClient } = await import('@/lib/redis')
        await redisClient.connect()
        console.log('Redis initialized successfully')
      } catch (error) {
        console.warn('Redis initialization failed, will use in-memory fallback:', error)
      }
    }

    initRedis()
  }, [])

  return null // Этот компонент ничего не рендерит
}
