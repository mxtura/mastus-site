'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Eye, Mail, Phone, Building, Calendar, Trash2, MessageSquare } from 'lucide-react'
import { FilterPanel } from '@/components/ui/FilterPanel'
import { messageFilterConfigs, MessageFilters, initialMessageFilters } from '@/components/filters/message-filter-config'
import { applyMessageFilters, ContactMessage } from '@/components/filters/filter-utils'

const statusLabels = {
  NEW: 'Новое',
  PROCESSING: 'В обработке',
  COMPLETED: 'Обработано',
  ARCHIVED: 'Архив'
}

const statusColors = {
  NEW: 'bg-red-100 text-red-800',
  PROCESSING: 'bg-yellow-100 text-yellow-800', 
  COMPLETED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-800'
}

const subjectLabels = {
  PRICE: 'Запрос цены',
  ORDER: 'Размещение заказа',
  DELIVERY: 'Доставка',
  TECHNICAL: 'Техническая консультация',
  OTHER: 'Другое'
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [replySubject, setReplySubject] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  
  // Состояние фильтров
  const [filters, setFilters] = useState<MessageFilters>(initialMessageFilters)
  const [showFilters, setShowFilters] = useState(false)

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

  // Функция фильтрации сообщений
  const applyFilters = useCallback((messagesToFilter: ContactMessage[]) => {
    const filtered = applyMessageFilters(messagesToFilter, filters);
    setFilteredMessages(filtered);
  }, [filters])

  // Применяем фильтры при изменении сообщений или фильтров
  useEffect(() => {
    applyFilters(messages)
  }, [messages, filters, applyFilters])

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message)
    setViewDialogOpen(true)
    
    // Отмечаем как прочитанное, если статус NEW
    if (message.status === 'NEW') {
      try {
        await fetch(`/api/messages/${message.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'PROCESSING' })
        })
        
        // Обновляем локальное состояние
        setMessages(prev => prev.map(m => 
          m.id === message.id ? { ...m, status: 'PROCESSING' } : m
        ))
      } catch (error) {
        console.error('Ошибка обновления статуса:', error)
      }
    }
  }

  const handleStatusChange = async (messageId: string, newStatus: ContactMessage['status']) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, status: newStatus } : m
        ))
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(prev => prev ? { ...prev, status: newStatus } : null)
        }
      }
    } catch (error) {
      console.error('Ошибка изменения статуса:', error)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это сообщение?')) return

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessages(prev => prev.filter(m => m.id !== messageId))
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null)
          setViewDialogOpen(false)
          setReplyDialogOpen(false)
        }
      }
    } catch (error) {
      console.error('Ошибка удаления сообщения:', error)
    }
  }

  const handleReply = (message: ContactMessage) => {
    setSelectedMessage(message)
    setReplySubject(message.subject ? subjectLabels[message.subject as keyof typeof subjectLabels] || message.subject : 'Ответ на ваше обращение')
    setReplyMessage('')
    setReplyDialogOpen(true)
    setViewDialogOpen(false)
  }

  const sendReply = async () => {
    if (!selectedMessage || !replySubject.trim() || !replyMessage.trim()) return

    setIsReplying(true)
    try {
      const response = await fetch(`/api/messages/${selectedMessage.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replySubject: replySubject.trim(),
          replyMessage: replyMessage.trim()
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert('Ответ отправлен успешно!')
        setReplyDialogOpen(false)
        setReplySubject('')
        setReplyMessage('')
        
        // Обновляем статус сообщения
        setMessages(prev => prev.map(m => 
          m.id === selectedMessage.id ? { ...m, status: 'COMPLETED' } : m
        ))
        if (selectedMessage) {
          setSelectedMessage(prev => prev ? { ...prev, status: 'COMPLETED' } : null)
        }
      } else {
        alert('Ошибка отправки ответа: ' + result.error)
      }
    } catch (error) {
      console.error('Ошибка отправки ответа:', error)
      alert('Ошибка отправки ответа')
    } finally {
      setIsReplying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка сообщений...</p>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Сообщения клиентов</h1>
        <p className="text-gray-600 mt-2">Управляйте обращениями от клиентов</p>
      </div>

      {/* Панель фильтров */}
      <FilterPanel
        title="Фильтры сообщений"
        filters={filters}
        onFiltersChange={setFilters}
        filterConfigs={messageFilterConfigs}
        resultsCount={filteredMessages.length}
        totalCount={messages.length}
        showFilters={showFilters}
  onToggleFilters={() => setShowFilters(!showFilters)}
  className="mb-6"
      />

      <div className="space-y-4">
        {filteredMessages.map((message) => (
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
                    {message.subject ? subjectLabels[message.subject as keyof typeof subjectLabels] || message.subject : 'Без темы'}
                  </CardDescription>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
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
                  <p className="text-sm whitespace-pre-wrap">{message.message.slice(0, 200)}{message.message.length > 200 ? '...' : ''}</p>
                </div>

                <div className="flex gap-2 justify-between items-center">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewMessage(message)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Просмотреть
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReply(message)}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Ответить
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <select 
                      value={message.status} 
                      onChange={(e) => handleStatusChange(message.id, e.target.value as ContactMessage['status'])}
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="NEW">Новое</option>
                      <option value="PROCESSING">В обработке</option>
                      <option value="COMPLETED">Обработано</option>
                      <option value="ARCHIVED">Архив</option>
                    </select>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDeleteMessage(message.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
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

      {/* Диалог просмотра сообщения */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Сообщение от {selectedMessage?.name}</DialogTitle>
            <DialogDescription>
              {selectedMessage && new Date(selectedMessage.createdAt).toLocaleString('ru-RU')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Email:</strong><br />
                  <a href={`mailto:${selectedMessage.email}`} className="text-blue-600">
                    {selectedMessage.email}
                  </a>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <strong>Телефон:</strong><br />
                    <a href={`tel:${selectedMessage.phone}`} className="text-blue-600">
                      {selectedMessage.phone}
                    </a>
                  </div>
                )}
                {selectedMessage.company && (
                  <div>
                    <strong>Компания:</strong><br />
                    {selectedMessage.company}
                  </div>
                )}
                {selectedMessage.subject && (
                  <div>
                    <strong>Тема:</strong><br />
                    {subjectLabels[selectedMessage.subject as keyof typeof subjectLabels] || selectedMessage.subject}
                  </div>
                )}
              </div>
              
              <div>
                <strong>Сообщение:</strong>
                <div className="mt-2 p-4 bg-gray-50 rounded border">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleReply(selectedMessage)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ответить
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setViewDialogOpen(false)}
                >
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог ответа на сообщение */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ответить пользователю {selectedMessage?.name}</DialogTitle>
            <DialogDescription>
              Отправка ответа на email: {selectedMessage?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="replySubject" className="block text-sm font-medium mb-2">
                Тема письма
              </label>
              <Input
                id="replySubject"
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                placeholder="Тема ответа"
              />
            </div>
            
            <div>
              <label htmlFor="replyMessage" className="block text-sm font-medium mb-2">
                Сообщение
              </label>
              <Textarea
                id="replyMessage"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Введите ваш ответ..."
                rows={8}
              />
            </div>
            
            {selectedMessage && (
              <div className="text-sm bg-gray-50 p-3 rounded">
                <strong>Исходное сообщение:</strong>
                <p className="mt-1 text-gray-600">{selectedMessage.message.slice(0, 300)}{selectedMessage.message.length > 300 ? '...' : ''}</p>
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={sendReply} 
                disabled={isReplying || !replySubject.trim() || !replyMessage.trim()}
              >
                {isReplying ? 'Отправка...' : 'Отправить ответ'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setReplyDialogOpen(false)}
                disabled={isReplying}
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
