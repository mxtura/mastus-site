'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, MessageSquare, Clock, ArrowRight } from 'lucide-react'

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
    <div className="space-y-8">
      {/* Заголовок */}
      <Card className="border-neutral-200 bg-white/80 shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-neutral-900 header">Дашборд</h1>
            <CardDescription className="text-sm text-neutral-600 mt-2">
              Добро пожаловать, {session.user.login}
            </CardDescription>
          </div>
          <Badge variant="tertiary" className="rounded-none px-3 py-1 text-[11px] uppercase tracking-wide">
            Роль: администратор
          </Badge>
        </CardHeader>
      </Card>

      {/* Статистические карточки */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-neutral-200 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Всего продуктов</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-500">
              <Package className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-semibold text-neutral-900">{stats.totalProducts}</div>
            <p className="text-xs text-neutral-500">Активные позиции в каталоге</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Всего сообщений</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-500">
              <MessageSquare className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-semibold text-neutral-900">{stats.totalMessages}</div>
            <p className="text-xs text-neutral-500">Обращения за всё время</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Новые сообщения</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-500">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-semibold text-[var(--primary)]">{stats.newMessages}</div>
            <p className="text-xs text-neutral-500">Ожидают обработки</p>
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-neutral-200 bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-neutral-900">Управление продукцией</CardTitle>
            <CardDescription className="text-sm text-neutral-600">
              Добавление, редактирование и управление каталогом продуктов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full justify-between gap-3 rounded-none border border-neutral-300 bg-neutral-900 text-white hover:bg-neutral-800">
              <Link href="/admin/products">
                <span className="inline-flex items-center gap-2">
                  <Package className="size-4" />
                  Перейти к продуктам
                </span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-neutral-900">Обращения клиентов</CardTitle>
            <CardDescription className="text-sm text-neutral-600">
              Просмотр и обработка сообщений от потенциальных клиентов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-between gap-3 rounded-none border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100">
              <Link href="/admin/messages">
                <span className="inline-flex items-center gap-2">
                  <MessageSquare className="size-4" />
                  Просмотреть сообщения
                </span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            {stats.newMessages > 0 && (
              <div className="flex items-center justify-between rounded-none border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                <span>Непрочитанных сообщений</span>
                <Badge variant="tertiary" className="rounded-none px-2 py-1 text-[11px]">
                  {stats.newMessages}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
