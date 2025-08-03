'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Mail, Phone, Building } from 'lucide-react'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  subject: string | null
  message: string
  status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED'
  createdAt: string
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }

    fetchMessages()
  }, [session, status, router])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  const statusLabels = {
    NEW: 'Новое',
    READ: 'Прочитано',
    REPLIED: 'Отвечено',
    ARCHIVED: 'Архивировано'
  }

  const statusColors = {
    NEW: 'bg-red-100 text-red-800',
    READ: 'bg-blue-100 text-blue-800',
    REPLIED: 'bg-green-100 text-green-800',
    ARCHIVED: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Сообщения клиентов</h1>
        <p className="text-gray-600 mt-2">Управляйте обращениями от клиентов</p>
      </div>

      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{message.name}</CardTitle>
                    <Badge className={statusColors[message.status]}>
                      {statusLabels[message.status]}
                    </Badge>
                  </div>
                  <CardDescription>
                    {message.subject || 'Без темы'}
                  </CardDescription>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(message.createdAt).toLocaleString('ru-RU')}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${message.email}`} className="text-blue-600 hover:underline">
                      {message.email}
                    </a>
                  </div>
                  {message.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${message.phone}`} className="text-blue-600 hover:underline">
                        {message.phone}
                      </a>
                    </div>
                  )}
                  {message.company && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>{message.company}</span>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Просмотреть
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Ответить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {messages.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Сообщений не найдено</p>
          <p className="text-gray-400 mt-2">Пока что никто не отправлял сообщения</p>
        </div>
      )}
    </div>
  )
}
