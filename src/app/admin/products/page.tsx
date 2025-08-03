'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string | null
  price: number | null
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'MECHANICAL',
    isActive: true
  })

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      } else if (response.status === 403) {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Ошибка загрузки продуктов:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }

    fetchProducts()
  }, [session, status, router, fetchProducts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null
        }),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setFormData({
          name: '',
          description: '',
          price: '',
          category: 'MECHANICAL',
          isActive: true
        })
        fetchProducts()
      }
    } catch (error) {
      console.error('Ошибка создания продукта:', error)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  const categoryLabels = {
    MECHANICAL: 'Механическое оборудование',
    ELECTRICAL: 'Электрооборудование', 
    HYDRAULIC: 'Гидравлическое оборудование',
    PNEUMATIC: 'Пневматическое оборудование',
    SPARE_PARTS: 'Запчасти',
    TOOLS: 'Инструменты',
    OTHER: 'Прочее'
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Управление продукцией</h1>
          <p className="text-gray-600 mt-2">Добавляйте и редактируйте товары в каталоге</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Добавить продукт
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Добавить новый продукт</DialogTitle>
              <DialogDescription>
                Заполните информацию о новом продукте
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Название</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Цена</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="Оставьте пустым для 'по запросу'"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Категория</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit">Добавить</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>
                    {categoryLabels[product.category as keyof typeof categoryLabels]}
                  </CardDescription>
                </div>
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? 'Доступен' : 'Недоступен'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {product.description && (
                  <p className="text-sm text-gray-600">
                    {product.description.length > 100 
                      ? `${product.description.slice(0, 100)}...` 
                      : product.description
                    }
                  </p>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">
                    {product.price ? `${product.price.toLocaleString()} ₽` : 'По запросу'}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500">
                  Создан: {new Date(product.createdAt).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Продукты не найдены</p>
          <p className="text-gray-400 mt-2">Добавьте первый продукт, чтобы начать</p>
        </div>
      )}
    </div>
  )
}
