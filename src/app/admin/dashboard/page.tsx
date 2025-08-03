'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, MessageSquare, Clock } from 'lucide-react'

interface Stats {
  totalProducts: number
  totalMessages: number
  newMessages: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalMessages: 0,
    newMessages: 0
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
    }
  }, [session, status, router])

  // Загружаем статистику
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Загружаем статистику продуктов и сообщений
        const [productsRes, messagesRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/messages')
        ])

        if (productsRes.ok && messagesRes.ok) {
          const products = await productsRes.json()
          const messages = await messagesRes.json()
          
          setStats({
            totalProducts: products.length,
            totalMessages: messages.length,
            newMessages: messages.filter((m: { status: string }) => m.status === 'NEW').length
          })
        }
      } catch (error) {
        console.error('Ошибка загрузки статистики:', error)
      }
    }

    if (session?.user.role === 'ADMIN') {
      fetchStats()
    }
  }, [session])

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-gray-600">
          Добро пожаловать, {session.user.email}
        </p>
      </div>

      {/* Статистические карточки */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего продуктов</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Активных продуктов в каталоге
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего сообщений</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              Обращений от клиентов
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Новые сообщения</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.newMessages}</div>
            <p className="text-xs text-muted-foreground">
              Требуют обработки
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Управление продукцией</CardTitle>
            <CardDescription>
              Добавление, редактирование и управление каталогом продуктов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/products"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Package className="w-4 h-4 mr-2" />
              Перейти к продуктам
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Обращения клиентов</CardTitle>
            <CardDescription>
              Просмотр и обработка сообщений от потенциальных клиентов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/messages"
              className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Просмотреть сообщения
              {stats.newMessages > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {stats.newMessages}
                </span>
              )}
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
