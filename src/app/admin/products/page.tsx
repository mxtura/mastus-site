"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FilterPanel } from '@/components/ui/FilterPanel'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import Image from 'next/image'
import ProductImage from '@/components/ProductImage'
import { adminProductFilterConfigs, AdminProductFilters, initialAdminProductFilters } from '@/components/filters/admin-product-filter-config'
import { applyAdminProductFilters } from '@/components/filters/filter-utils'

interface Product {
  id: string
  name: string
  description: string | null
  price: number | null
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  images: string[]
  size: string | null
  thickness: string | null
  weight: string | null
  load: string | null
  material: string | null
  color: string | null
  advantages: string[]
  applications: string[]
}

const categoryLabels: Record<string,string> = {
  MANHOLES: 'Люки',
  SUPPORT_RINGS: 'Опорные кольца',
  LADDERS: 'Лестницы'
}

const maxImages = 10

export default function ProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [filters, setFilters] = useState<AdminProductFilters>(initialAdminProductFilters)
  const [showFilters, setShowFilters] = useState(true)

  const emptyForm = { name: '', description: '', price: '', category: 'LADDERS', isActive: true, images: '', size: '', thickness: '', weight: '', load: '', material: '', color: '', advantages: '', applications: '' }
  const [formData, setFormData] = useState({ ...emptyForm })

  // Применяем фильтры к продуктам
  const filteredProducts = applyAdminProductFilters(products, filters)

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
    if (!session || session.user.role !== 'ADMIN') { router.push('/admin/login'); return }
    fetchProducts()
  }, [status, session, router, fetchProducts])

  const startCreate = () => { setFormData({ ...emptyForm }); setEditingId(null); setIsDialogOpen(true) }
  const startEdit = (p: Product) => { setFormData({ name: p.name, description: p.description || '', price: p.price?.toString() || '', category: p.category, isActive: p.isActive, images: (p.images||[]).join('\n'), size: p.size||'', thickness: p.thickness||'', weight: p.weight||'', load: p.load||'', material: p.material||'', color: p.color||'', advantages: (p.advantages||[]).join('\n'), applications: (p.applications||[]).join('\n') }); setEditingId(p.id); setIsDialogOpen(true) }
  const handleDelete = async (id: string) => { if (!confirm('Удалить продукт?')) return; try { const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' }); if (res.ok) fetchProducts() } catch(e){ console.error(e) } }

  const handleImageUpload = async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    if (res.ok) {
      const data = await res.json()
      const current = formData.images ? formData.images.split('\n').filter(Boolean) : []
      current.push(data.url)
      setFormData({ ...formData, images: current.join('\n') })
    }
  }
  const removeImage = (url: string) => {
    const current = formData.images.split('\n').filter(Boolean).filter(u=>u!==url)
    setFormData({ ...formData, images: current.join('\n') })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (submitting) return; setSubmitting(true)
    try {
      const payload = { name: formData.name.trim(), description: formData.description.trim() || null, price: formData.price ? parseFloat(formData.price) : null, category: formData.category, isActive: formData.isActive, images: formData.images.split('\n').map(s=>s.trim()).filter(Boolean), size: formData.size||null, thickness: formData.thickness||null, weight: formData.weight||null, load: formData.load||null, material: formData.material||null, color: formData.color||null, advantages: formData.advantages.split('\n').map(s=>s.trim()).filter(Boolean), applications: formData.applications.split('\n').map(s=>s.trim()).filter(Boolean) }
      const res = await fetch(editingId ? `/api/admin/products/${editingId}` : '/api/products', { method: editingId ? 'PATCH':'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      if (res.ok) { setIsDialogOpen(false); setFormData({ ...emptyForm }); setEditingId(null); fetchProducts() }
    } catch(err){ console.error('Ошибка сохранения продукта', err) } finally { setSubmitting(false) }
  }

  if (status === 'loading' || loading) return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>
  if (!session || session.user.role !== 'ADMIN') return null

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Управление продукцией</h1>
          <p className="text-gray-600 mt-2">Добавляйте и редактируйте товары в каталоге</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={startCreate} variant="default">
              <Plus className="w-4 h-4 mr-2" /> {editingId ? 'Редактировать' : 'Добавить продукт'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[760px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Редактировать продукт' : 'Добавить новый продукт'}</DialogTitle>
              <DialogDescription>{editingId ? 'Измените поля и сохраните' : 'Заполните информацию о продукте'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-2">
              <div className="grid gap-5 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Название *</Label>
                  <Input id="name" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea id="description" rows={3} value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Цена</Label>
                    <Input id="price" type="number" step="0.01" value={formData.price} onChange={e=>setFormData({...formData,price:e.target.value})} placeholder="Пусто = по запросу" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Категория *</Label>
                    <Select value={formData.category} onValueChange={v=>setFormData({...formData,category:v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([k,l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="isActive">Статус</Label>
                    <Select value={formData.isActive ? 'active' : 'inactive'} onValueChange={v=>setFormData({...formData,isActive:v==='active'})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Активен</SelectItem>
                        <SelectItem value="inactive">Скрыт</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Изображения</Label>
                    <div className="flex flex-wrap gap-3">
                      {formData.images.split('\n').filter(Boolean).map(src => (
                        <div key={src} className="relative group w-24 h-24 border rounded overflow-hidden bg-gray-50">
                          <Image src={src} alt="img" fill className="object-contain p-1" />
                          <button type="button" onClick={()=>removeImage(src)} className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 opacity-0 group-hover:opacity-100 transition">×</button>
                        </div>
                      ))}
                      {formData.images.split('\n').filter(Boolean).length < maxImages && (
                        <label className="w-24 h-24 border rounded flex flex-col items-center justify-center text-xs cursor-pointer hover:bg-gray-50">
                          <span className="text-primary">+</span>
                          <input type="file" accept="image/*" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) handleImageUpload(f); e.target.value=''; }} />
                        </label>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500">До {maxImages} изображений. Поддержка: jpg, png, webp, gif, svg.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="advantages">Преимущества (строка=пункт)</Label>
                    <Textarea id="advantages" rows={3} value={formData.advantages} onChange={e=>setFormData({...formData,advantages:e.target.value})} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="applications">Применение (строка=пункт)</Label>
                    <Textarea id="applications" rows={3} value={formData.applications} onChange={e=>setFormData({...formData,applications:e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Характеристики</Label>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <Input placeholder="Размер" value={formData.size} onChange={e=>setFormData({...formData,size:e.target.value})} />
                      <Input placeholder="Толщина" value={formData.thickness} onChange={e=>setFormData({...formData,thickness:e.target.value})} />
                      <Input placeholder="Вес" value={formData.weight} onChange={e=>setFormData({...formData,weight:e.target.value})} />
                      <Input placeholder="Нагрузка" value={formData.load} onChange={e=>setFormData({...formData,load:e.target.value})} />
                      <Input placeholder="Материал" value={formData.material} onChange={e=>setFormData({...formData,material:e.target.value})} />
                      <Input placeholder="Цвет" value={formData.color} onChange={e=>setFormData({...formData,color:e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setEditingId(null) }}>Отмена</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Сохранение...' : editingId ? 'Сохранить' : 'Добавить'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Фильтры */}
      <div className="mb-6">
        <FilterPanel
          title="Фильтр продуктов"
          filters={filters}
          onFiltersChange={(newFilters) => setFilters(newFilters as AdminProductFilters)}
          filterConfigs={adminProductFilterConfigs}
          resultsCount={filteredProducts.length}
          totalCount={products.length}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map(p => (
          <Card key={p.id} className="hover:shadow-lg transition-shadow">
            {/* Изображение продукта */}
            <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden flex items-center justify-center p-2">
              {p.images && p.images.length > 0 ? (
                <ProductImage
                  src={p.images[0]}
                  alt={p.name}
                  width={600}
                  height={338}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Нет фото</div>
              )}
            </div>
            <CardHeader className="pb-3">
              <h2 className="text-xl font-bold heading">{p.name}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="tertiary" className="flex-shrink-0">
                  {categoryLabels[p.category] || p.category}
                </Badge>
                <Badge variant={p.isActive ? 'default':'secondary'} className="flex-shrink-0">
                  {p.isActive ? 'Доступен':'Скрыт'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {p.description && <p className="text-sm text-gray-600 leading-relaxed">{p.description.length>140 ? p.description.slice(0,140)+'…' : p.description}</p>}
                <div className="flex flex-wrap gap-2 text-[11px] text-gray-500">
                  {p.size && <span>Размер: {p.size}</span>}
                  {p.thickness && <span>Толщина: {p.thickness}</span>}
                  {p.weight && <span>Вес: {p.weight}</span>}
                  {p.load && <span>Нагрузка: {p.load}</span>}
                  {p.material && <span>Материал: {p.material}</span>}
                  {p.color && <span>Цвет: {p.color}</span>}
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">{p.price ? `${p.price.toLocaleString()} ₽` : 'По запросу'}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={()=>router.push(`/products/${p.id}`)} title="Просмотр"><Eye className="w-4 h-4"/></Button>
                    <Button size="sm" variant="outline" onClick={()=>startEdit(p)} title="Редактировать"><Edit className="w-4 h-4"/></Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={()=>handleDelete(p.id)} title="Удалить"><Trash2 className="w-4 h-4"/></Button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500">Создан: {new Date(p.createdAt).toLocaleDateString('ru-RU')}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {products.length === 0 ? 'Продукты не найдены' : 'Нет продуктов, соответствующих фильтру'}
          </p>
          <p className="text-gray-400 mt-2">
            {products.length === 0 ? 'Добавьте первый продукт, чтобы начать' : 'Попробуйте изменить параметры фильтра'}
          </p>
        </div>
      )}
    </div>
  )
}
