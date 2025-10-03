'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useMemo, type ComponentType } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Eye, Mail, Phone, Building, Calendar, Trash2, MessageSquare, ArchiveRestore, Archive } from 'lucide-react'
import { FilterPanel } from '@/components/ui/FilterPanel'
import { messageFilterConfigs, MessageFilters, initialMessageFilters, MESSAGE_STATUS_OPTIONS } from '@/components/filters/message-filter-config'
import { applyMessageFilters, ContactMessage } from '@/components/filters/filter-utils'
import type { MDEditorProps } from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MarkdownEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
) as ComponentType<MDEditorProps>

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

const NON_ARCHIVED_STATUS_VALUES = MESSAGE_STATUS_OPTIONS
  .filter(option => option.value !== 'ARCHIVED')
  .map(option => option.value)

const ARCHIVED_STATUS_VALUES = MESSAGE_STATUS_OPTIONS
  .filter(option => option.value === 'ARCHIVED')
  .map(option => option.value)

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
  const [viewArchived, setViewArchived] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }

    fetchMessages()
  }, [session, status, router])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (replyDialogOpen || viewDialogOpen) return

    const body = document.body
    const html = document.documentElement

    body.style.removeProperty('overflow')
    body.style.removeProperty('padding-right')
    body.style.removeProperty('position')
    body.style.removeProperty('touch-action')
    body.style.removeProperty('overscroll-behavior')
    html.style.removeProperty('overflow')
    html.style.removeProperty('padding-right')

    if (body.hasAttribute('data-scroll-lock')) {
      body.removeAttribute('data-scroll-lock')
    }
    if (html.hasAttribute('data-scroll-lock')) {
      html.removeAttribute('data-scroll-lock')
    }
  }, [replyDialogOpen, viewDialogOpen])

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
    const filteredBase = applyMessageFilters(messagesToFilter, filters);
    // Разделяем архив/неархив (дополнительная страховка)
    const filtered = filteredBase.filter(m => viewArchived ? m.status === 'ARCHIVED' : m.status !== 'ARCHIVED')
    setFilteredMessages(filtered);
  }, [filters, viewArchived])

  useEffect(() => {
    setFilters(prev => {
      const allowedStatuses = viewArchived ? ARCHIVED_STATUS_VALUES : NON_ARCHIVED_STATUS_VALUES;
      const currentStatuses = Array.isArray(prev.status) ? prev.status.filter(status => allowedStatuses.includes(status)) : [];
      const nextStatuses = currentStatuses.length > 0 ? currentStatuses : allowedStatuses;
      const prevStatuses = Array.isArray(prev.status) ? prev.status : [];
      const isSame = prevStatuses.length === nextStatuses.length && nextStatuses.every(status => prevStatuses.includes(status));
      if (isSame) {
        return prev;
      }
      return { ...prev, status: nextStatuses };
    });
  }, [viewArchived])

  const dynamicFilterConfigs = useMemo(() => {
    return messageFilterConfigs.map(config => {
      if (config.key === 'status') {
        const options = viewArchived
          ? MESSAGE_STATUS_OPTIONS.filter(option => option.value === 'ARCHIVED')
          : MESSAGE_STATUS_OPTIONS.filter(option => option.value !== 'ARCHIVED')
        return {
          ...config,
          options,
          defaultValue: options.map(option => option.value)
        }
      }
      return config
    })
  }, [viewArchived])

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

  const archiveMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ARCHIVED' })
      })
      if (response.ok) {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'ARCHIVED' } : m))
      }
    } catch (e) { console.error(e) }
  }

  const unarchiveMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'NEW' })
      })
      if (response.ok) {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'NEW' } : m))
      }
    } catch (e) { console.error(e) }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Удалить навсегда? (только архивные можно удалять)')) return

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
        filterConfigs={dynamicFilterConfigs}
        resultsCount={filteredMessages.length}
        totalCount={messages.length}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        className="mb-6"
      />

      {/* Переключатель Архив/Неархив */}
      <div className="mb-4 flex items-center justify-between">
        <div className="inline-flex border border-gray-200">
          <button
            className={`px-3 py-2 text-sm ${!viewArchived ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setViewArchived(false)}
          >Неархивированные</button>
          <button
            className={`px-3 py-2 text-sm ${viewArchived ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setViewArchived(true)}
          >Архивированные</button>
        </div>

        {viewArchived && filteredMessages.length > 0 && (
          <Button
            variant="destructive"
            onClick={async () => {
              if (!confirm('Удалить ВСЕ архивные сообщения?')) return
              const res = await fetch('/api/messages?mode=purgeArchived', { method: 'DELETE' })
              if (res.ok) {
                setMessages(prev => prev.filter(m => m.status !== 'ARCHIVED'))
              }
            }}
          >Удалить все архивные</Button>
        )}
      </div>

      {/* Сетка квадратов 3 колонки */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMessages.map((message) => (
          <Card key={message.id} className="hover:shadow-lg transition-shadow aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg">{message.name}</CardTitle>
                <CardDescription>
                  {message.subject ? subjectLabels[message.subject as keyof typeof subjectLabels] || message.subject : 'Без темы'}
                </CardDescription>
                <div className="text-sm text-gray-600 mt-2 font-medium flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(message.createdAt).toLocaleString('ru-RU')}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1">
                <div className="space-y-1 text-sm">
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
              </div>

              <div className="bg-gray-50 p-3 rounded border mt-3 h-20 overflow-hidden">
                <p className="text-sm whitespace-pre-wrap">{message.message.slice(0, 90)}{message.message.length > 70 ? '...' : ''}</p>
              </div>

              <div className="flex items-center pt-3">
                <div className="shrink-0">
                  <Button size="sm" variant="outline" onClick={() => handleViewMessage(message)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Просмотр
                  </Button>
                </div>
                <div className="flex-1 flex justify-center">
                  <Badge className={statusColors[message.status]}>
                    {statusLabels[message.status]}
                  </Badge>
                </div>
                <div className="shrink-0 inline-flex items-center gap-2">
                  {message.status === 'ARCHIVED' ? (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => unarchiveMessage(message.id)}>
                        <ArchiveRestore className="w-4 h-4 mr-1" /> Вернуть
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteMessage(message.id)}
                        title="Удалить сообщение"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => archiveMessage(message.id)}>
                      <Archive className="w-4 h-4 mr-1" /> Архив
                    </Button>
                  )}
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
            
            <div className="space-y-2" data-color-mode="light">
              <label htmlFor="replyMessage" className="block text-sm font-medium">
                Сообщение
              </label>
              <div className="border border-neutral-200">
                <MarkdownEditor
                  value={replyMessage}
                  height={280}
                  textareaProps={{ id: 'replyMessage', placeholder: 'Введите ваш ответ...' }}
                  onChange={(value: string | undefined) => setReplyMessage(value ?? '')}
                  preview="live"
                />
              </div>
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
