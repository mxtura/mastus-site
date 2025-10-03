"use client"

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback, Suspense, useRef, useMemo, type ComponentType } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FilterPanel } from '@/components/ui/FilterPanel'
import { Plus, Edit, Trash2, Eye, Boxes } from 'lucide-react'
import Image from 'next/image'
import ProductImage from '@/components/ProductImage'
import { adminProductFilterConfigs, AdminProductFilters, initialAdminProductFilters } from '@/components/filters/admin-product-filter-config'
import { applyAdminProductFilters } from '@/components/filters/filter-utils'
import type { MDEditorProps } from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MarkdownEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
) as ComponentType<MDEditorProps>

interface Product {
  id: string
  name: string
  description: string | null
  sku: string
  price: number | null
  category: string
  categoryNameRu?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  images: string[]
  attributes?: Record<string, unknown>
  attributeLabels?: Record<string, string>
  advantages: string[]
  applications: string[]
}

// Категории подмешиваем из API ответа (categoryNameRu) и формируем словарь

const maxImages = 10

function AdminProductsPageInner() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriesMap, setCategoriesMap] = useState<Record<string,string>>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string>('')
  const categoriesInitializedRef = useRef(false)
  const categoriesUniverseRef = useRef<string[]>([])
  const initialCategoriesFromQueryRef = useRef(false)
  const [filters, setFilters] = useState<AdminProductFilters>(() => {
    // Initialize from URL
    const categoriesParam = searchParams?.getAll('categories')
    const catSingle = searchParams?.get('categories')
    const categoriesFromQuery = categoriesParam && categoriesParam.length
      ? categoriesParam
      : (catSingle ? catSingle.split(',') : undefined)

    const text = searchParams?.get('text') || ''
    const sorting = searchParams?.get('sorting') || initialAdminProductFilters.sortBy
    const currencyPrice = searchParams?.get('currency_price') || ''
    const statusQ = (searchParams?.get('status') || 'ALL').toUpperCase() as AdminProductFilters['status']
    const priceFilterQ = (searchParams?.get('price_filter') || 'ALL').toUpperCase() as AdminProductFilters['priceFilter']

    const priceRange = (() => {
      if (!currencyPrice) return { min: '', max: '' }
      const [minRaw, maxRaw] = currencyPrice.split('-')
      return { min: (minRaw || '').trim(), max: (maxRaw || '').trim() }
    })()

    const hasQueryCategories = Boolean(categoriesFromQuery && categoriesFromQuery.length)
    initialCategoriesFromQueryRef.current = hasQueryCategories

    const initialCategories = hasQueryCategories
      ? (categoriesFromQuery as string[])
      : initialAdminProductFilters.categories

    return {
      searchText: text,
      categories: initialCategories,
      status: ['ALL','ACTIVE','INACTIVE'].includes(statusQ) ? statusQ : 'ALL',
      priceFilter: ['ALL','WITH_PRICE','ON_REQUEST'].includes(priceFilterQ) ? priceFilterQ : 'ALL',
      priceRange,
      sortBy: sorting
    }
  })
  const [showFilters, setShowFilters] = useState(true)
  // Категории с параметрами (метаданные)
  type CategoryParamMeta = { parameter: { id: string; code: string; nameRu: string }, visible: boolean, required: boolean }
  const [categoriesMetaByCode, setCategoriesMetaByCode] = useState<Record<string, { id: string; nameRu: string; params: CategoryParamMeta[] }>>({})
  // Динамические опции для фильтра категорий
  const dynamicFilterConfigs = useMemo(() => {
    const catOptions = Object.entries(categoriesMap).map(([value,label])=>({ value, label }))
    const hasPricedProducts = products.some(p => p.price !== null && p.price > 0)
    const showPriceRange = filters.priceFilter !== 'ON_REQUEST' && (filters.priceFilter !== 'ALL' || hasPricedProducts)

    return adminProductFilterConfigs.map(cfg => {
      if (cfg.key === 'categories') {
        return { ...cfg, options: catOptions, defaultValue: catOptions.map(option => option.value) }
      }
      if (cfg.key === 'priceRange') {
        return { ...cfg, hidden: !showPriceRange }
      }
      return cfg
    })
  }, [categoriesMap, products, filters.priceFilter])

  const emptyForm = { name: '', description: '', sku: '', price: '', category: 'LADDERS', isActive: true, images: '', attributes: {} as Record<string, unknown>, advantages: '', applications: '' }
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

  const fetchCategoriesMeta = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories')
      if (!res.ok) return
      const cats: Array<{ id: string; code: string; nameRu: string; params?: CategoryParamMeta[] }> = await res.json()
      const byCode: Record<string, { id: string; nameRu: string; params: CategoryParamMeta[] }> = {}
      const map: Record<string, string> = {}
      for (const c of cats) {
        byCode[c.code] = { id: c.id, nameRu: c.nameRu, params: (c.params || []).filter(p=>p.visible) }
        map[c.code] = c.nameRu || c.code
      }
      setCategoriesMetaByCode(byCode)
      setCategoriesMap(map)
    } catch (e) {
      console.error('Ошибка загрузки категорий:', e)
    }
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') { router.push('/admin/login'); return }
    fetchProducts()
    fetchCategoriesMeta()
  }, [status, session, router, fetchProducts, fetchCategoriesMeta])

  // Когда подгрузили список категорий, по умолчанию выбираем все, если пусто
  useEffect(() => {
    const nextUniverse = Object.keys(categoriesMap)
    const previousUniverse = categoriesUniverseRef.current

    if (!nextUniverse.length) {
      categoriesUniverseRef.current = nextUniverse
      return
    }

    setFilters(prev => {
      const currentSelection = Array.isArray(prev.categories) ? prev.categories : []
      let sanitizedSelection = currentSelection.filter(code => nextUniverse.includes(code))
      let changed = sanitizedSelection.length !== currentSelection.length

      if (!categoriesInitializedRef.current) {
        categoriesInitializedRef.current = true

        const representsAll =
          sanitizedSelection.length === nextUniverse.length &&
          nextUniverse.every(code => sanitizedSelection.includes(code))

        if (!initialCategoriesFromQueryRef.current && !representsAll) {
          sanitizedSelection = [...nextUniverse]
          changed = true
        } else if (initialCategoriesFromQueryRef.current && sanitizedSelection.length === 0) {
          sanitizedSelection = [...nextUniverse]
          changed = true
        }
      } else {
        const wasFullSelectionBefore =
          previousUniverse.length > 0 &&
          currentSelection.length === previousUniverse.length &&
          previousUniverse.every(code => currentSelection.includes(code))

        if (wasFullSelectionBefore && nextUniverse.length !== previousUniverse.length) {
          sanitizedSelection = [...nextUniverse]
          changed = true
        }
      }

      if (changed) {
        return { ...prev, categories: sanitizedSelection }
      }

      return prev
    })

    categoriesUniverseRef.current = nextUniverse
  }, [categoriesMap, setFilters])

  // Sync filters when URL changes (e.g., navigation)
  useEffect(() => {
    const categoriesParam = searchParams?.getAll('categories')
    const catSingle = searchParams?.get('categories')
    const categoriesFromQuery = categoriesParam && categoriesParam.length
      ? categoriesParam
      : (catSingle ? catSingle.split(',') : undefined)

    const text = searchParams?.get('text') || ''
    const sorting = searchParams?.get('sorting') || initialAdminProductFilters.sortBy
    const currencyPrice = searchParams?.get('currency_price') || ''
    const statusQ = (searchParams?.get('status') || 'ALL').toUpperCase() as AdminProductFilters['status']
    const priceFilterQ = (searchParams?.get('price_filter') || 'ALL').toUpperCase() as AdminProductFilters['priceFilter']

    const priceRange = (() => {
      if (!currencyPrice) return { min: '', max: '' }
      const [minRaw, maxRaw] = currencyPrice.split('-')
      return { min: (minRaw || '').trim(), max: (maxRaw || '').trim() }
    })()

    setFilters(prev => {
      const next: AdminProductFilters = {
        searchText: text,
        // If URL provides categories, use them; otherwise preserve current selection
        categories: categoriesFromQuery && categoriesFromQuery.length ? (categoriesFromQuery as string[]) : prev.categories,
        status: ['ALL','ACTIVE','INACTIVE'].includes(statusQ) ? statusQ : 'ALL',
        priceFilter: ['ALL','WITH_PRICE','ON_REQUEST'].includes(priceFilterQ) ? priceFilterQ : 'ALL',
        priceRange,
        sortBy: sorting
      }
      const same = (
        prev.searchText === next.searchText &&
        prev.sortBy === next.sortBy &&
        prev.status === next.status &&
        prev.priceFilter === next.priceFilter &&
        prev.priceRange.min === next.priceRange.min &&
        prev.priceRange.max === next.priceRange.max &&
        prev.categories.length === next.categories.length &&
        prev.categories.every((c, i) => c === next.categories[i])
      )
      return same ? prev : next
    })
  }, [searchParams])

  const updateUrlFromFilters = (nextFilters: AdminProductFilters) => {
    const params = new URLSearchParams(searchParams?.toString() || '')

    // text
    if (nextFilters.searchText && nextFilters.searchText.trim() !== '') params.set('text', nextFilters.searchText.trim())
    else params.delete('text')

    // sorting
    if (nextFilters.sortBy && nextFilters.sortBy !== initialAdminProductFilters.sortBy) params.set('sorting', nextFilters.sortBy)
    else params.delete('sorting')

    // currency_price as min-max
    const hasPricedProducts = products.some(product => product.price !== null && product.price > 0)
    const shouldSyncPriceRange = nextFilters.priceFilter !== 'ON_REQUEST' && (nextFilters.priceFilter !== 'ALL' || hasPricedProducts)
    const min = (nextFilters.priceRange?.min || '').trim()
    const max = (nextFilters.priceRange?.max || '').trim()
    if (shouldSyncPriceRange && (min !== '' || max !== '')) params.set('currency_price', `${min}-${max}`)
    else params.delete('currency_price')

    // status
    if (nextFilters.status && nextFilters.status !== initialAdminProductFilters.status) params.set('status', nextFilters.status)
    else params.delete('status')

    // price_filter
    if (nextFilters.priceFilter && nextFilters.priceFilter !== initialAdminProductFilters.priceFilter) params.set('price_filter', nextFilters.priceFilter)
    else params.delete('price_filter')

    // categories
    params.delete('categories')
    const allCategories = Object.keys(categoriesMap)
    const selected = nextFilters.categories || []
    const isAllSelected = selected.length === allCategories.length && selected.every(c => allCategories.includes(c))
    if (!isAllSelected && selected.length > 0) selected.forEach(c => params.append('categories', c))

    const query = params.toString()
    router.replace(`${pathname}${query ? `?${query}` : ''}`)
  }

  const handleFiltersChange = (next: AdminProductFilters) => {
    setFilters(next)
    updateUrlFromFilters(next)
  }

  const startCreate = () => { setFormError(''); setFormData({ ...emptyForm }); setEditingId(null); setIsDialogOpen(true) }
  const startEdit = (p: Product) => { setFormError(''); setFormData({ name: p.name, description: p.description || '', sku: p.sku || '', price: p.price?.toString() || '', category: p.category, isActive: p.isActive, images: (p.images||[]).join('\n'), attributes: (p.attributes as Record<string, unknown>) || {}, advantages: (p.advantages||[]).join('\n'), applications: (p.applications||[]).join('\n') }); setEditingId(p.id); setIsDialogOpen(true) }
  const handleDelete = async (id: string) => { if (!confirm('Удалить продукт?')) return; try { const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' }); if (res.ok) fetchProducts() } catch(e){ console.error(e) } }

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (isDialogOpen) return

    const body = document.body
    const html = document.documentElement

    body.style.removeProperty('overflow')
    body.style.removeProperty('padding-right')
    body.style.removeProperty('position')
    body.style.removeProperty('touch-action')
    body.style.removeProperty('overscroll-behavior')
    html.style.removeProperty('overflow')
    html.style.removeProperty('padding-right')

    if (body.hasAttribute('data-scroll-lock')) body.removeAttribute('data-scroll-lock')
    if (html.hasAttribute('data-scroll-lock')) html.removeAttribute('data-scroll-lock')
  }, [isDialogOpen])

  const handleImageUpload = async (file: File) => {
    const form = new FormData()
    form.append('file', file)
  const res = await fetch('/api/admin/upload-file', { method: 'POST', body: form })
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
      setFormError('')
      const meta = categoriesMetaByCode[formData.category]
      const skuTrimmed = formData.sku.trim()
      if (!skuTrimmed) {
        setFormError('Укажите артикул (SKU)')
        setSubmitting(false)
        return
      }
      if (skuTrimmed.length > 64) {
        setFormError('Артикул (SKU) не должен превышать 64 символа')
        setSubmitting(false)
        return
      }
      const requiredParams = (meta?.params || []).filter(p => p.required)
      const attrs = formData.attributes as Record<string, unknown>
      const missing = requiredParams.filter(p => !attrs || !attrs[p.parameter.code] || String(attrs[p.parameter.code]).trim() === '')
      if (missing.length) {
        setFormError(`Заполните обязательные параметры: ${missing.map(m=>m.parameter.nameRu || m.parameter.code).join(', ')}`)
        setSubmitting(false)
        return
      }
      const cleanedAttrs: Record<string, unknown> = {}
      for (const p of meta?.params || []) {
        const v = (attrs ?? {})[p.parameter.code]
        if (v !== undefined && String(v).trim() !== '') cleanedAttrs[p.parameter.code] = v
      }
      const payload = { name: formData.name.trim(), description: formData.description.trim() || null, sku: skuTrimmed, price: formData.price ? parseFloat(formData.price) : null, category: formData.category, isActive: formData.isActive, images: formData.images.split('\n').map(s=>s.trim()).filter(Boolean), attributes: cleanedAttrs, advantages: formData.advantages.split('\n').map(s=>s.trim()).filter(Boolean), applications: formData.applications.split('\n').map(s=>s.trim()).filter(Boolean) }
      const res = await fetch(editingId ? `/api/admin/products/${editingId}` : '/api/products', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setIsDialogOpen(false)
        setFormData({ ...emptyForm })
        setEditingId(null)
        fetchProducts()
      } else {
        const responseBody = await res.json().catch(() => null)
        setFormError(responseBody?.error || 'Не удалось сохранить продукт')
      }
    } catch(err){ console.error('Ошибка сохранения продукта', err) } finally { setSubmitting(false) }
  }

  if (status === 'loading' || loading) return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>
  if (!session || session.user.role !== 'ADMIN') return null

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Управление продукцией</h1>
          <p className="text-gray-600 mt-2">Добавляйте и редактируйте товары в каталоге</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={startCreate} variant="default" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" /> {editingId ? 'Редактировать' : 'Добавить продукт'}
              </Button>
            </DialogTrigger>
            <DialogContent className="flex w-[92vw] max-h-[90vh] flex-col overflow-hidden sm:max-w-[900px]">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Редактировать продукт' : 'Добавить новый продукт'}</DialogTitle>
                <DialogDescription>{editingId ? 'Измените поля и сохраните' : 'Заполните информацию о продукте'}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="mt-2 flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="grid gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Название *</Label>
                    <Input id="name" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} required />
                  </div>
                  <div className="grid gap-2" data-color-mode="light">
                    <Label htmlFor="description">Описание</Label>
                    <div className="border border-neutral-200">
                      <MarkdownEditor
                        value={formData.description}
                        height={240}
                        preview="edit"
                        textareaProps={{ id: 'description', placeholder: 'Опишите продукт с использованием Markdown (заголовки, списки, выделения).' }}
                        onChange={(value: string | undefined) => setFormData(prev => ({ ...prev, description: value ?? '' }))}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor="sku">Артикул (SKU) *</Label>
                      <Input id="sku" value={formData.sku} onChange={e=>setFormData({...formData,sku:e.target.value})} placeholder="Напр.: MST-001" required maxLength={64} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price">Цена</Label>
                      <Input id="price" type="number" step="0.01" value={formData.price} onChange={e=>setFormData({...formData,price:e.target.value})} placeholder="Пусто = по запросу" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Категория *</Label>
                      <Select value={formData.category} onValueChange={v=>setFormData({...formData,category:v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoriesMap).map(([k,l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
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
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Изображения</Label>
                      <div className="flex flex-wrap gap-3">
                        {formData.images.split('\n').filter(Boolean).map(src => (
                          <div key={src} className="relative group h-24 w-24 overflow-hidden rounded border bg-gray-50">
                            <Image src={src} alt="img" fill className="object-contain p-1" />
                            <button type="button" onClick={()=>removeImage(src)} className="absolute top-0 right-0 bg-red-600 px-1 text-xs text-white opacity-0 transition group-hover:opacity-100">×</button>
                          </div>
                        ))}
                        {formData.images.split('\n').filter(Boolean).length < maxImages && (
                          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded border text-xs hover:bg-gray-50">
                            <span className="text-primary">+</span>
                            <input type="file" accept="image/*" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) handleImageUpload(f); e.target.value=''; }} />
                          </label>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500">До {maxImages} изображений. Поддержка: jpg, png, webp, gif, svg.</p>
                    </div>
                    <div className="grid gap-2" data-color-mode="light">
                      <Label htmlFor="advantages">Преимущества (каждая строка станет отдельным пунктом)</Label>
                      <div className="border border-neutral-200">
                        <MarkdownEditor
                          value={formData.advantages}
                          height={220}
                          preview="edit"
                          textareaProps={{ id: 'advantages', placeholder: 'Используйте Markdown: **жирный**, _курсив_, списки и т.д.' }}
                          onChange={(value: string | undefined) => setFormData(prev => ({ ...prev, advantages: value ?? '' }))}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2" data-color-mode="light">
                    <Label htmlFor="applications">Применение (каждая строка станет отдельным пунктом)</Label>
                    <div className="border border-neutral-200">
                      <MarkdownEditor
                        value={formData.applications}
                        height={220}
                        preview="edit"
                        textareaProps={{ id: 'applications', placeholder: 'Опишите области использования, можно использовать Markdown.' }}
                        onChange={(value: string | undefined) => setFormData(prev => ({ ...prev, applications: value ?? '' }))}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Параметры категории</Label>
                    <div className="grid gap-3 md:grid-cols-2">
                      {(categoriesMetaByCode[formData.category]?.params || []).map(cp => {
                        const code = cp.parameter.code
                        const label = cp.parameter.nameRu || code
                        const val = (formData.attributes as Record<string, unknown>)[code] ?? ''
                        return (
                          <div key={code} className="grid gap-1">
                            <Label className="text-xs">{label}{cp.required ? ' *' : ''} <span className="text-[10px] text-gray-500">({code})</span></Label>
                            <Input value={String(val)} onChange={e=>setFormData(prev=>({ ...prev, attributes: { ...(prev.attributes as Record<string, unknown>), [code]: e.target.value } }))} />
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-[11px] text-gray-500">Состав параметров управляется в разделе «Категории».</p>
                  </div>
                  </div>
                </div>
              {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setEditingId(null) }}>Отмена</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Сохранение...' : editingId ? 'Сохранить' : 'Добавить'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/categories" className="flex items-center gap-2">
            <Boxes className="w-4 h-4" />
            Управление категориями
          </Link>
        </Button>
      </div>
    </div>

      {/* Фильтры */}
      <div className="mb-6">
        <FilterPanel
          title="Фильтр продуктов"
          filters={filters}
          onFiltersChange={(newFilters) => handleFiltersChange(newFilters as AdminProductFilters)}
          filterConfigs={dynamicFilterConfigs}
          resultsCount={filteredProducts.length}
          totalCount={products.length}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map(p => {
          const hasPrice = typeof p.price === 'number' && p.price > 0
          const formattedPrice = hasPrice ? p.price!.toLocaleString('ru-RU') : null
          const skuLabel = p.sku && p.sku.trim() ? p.sku : '—'

          return (
            <Card
              key={p.id}
              className="group flex h-full flex-col rounded-none border border-neutral-200 bg-white py-0 transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                <div className="flex h-full w-full items-center justify-center px-2 pb-3 pt-0">
                  {p.images && p.images.length > 0 ? (
                    <ProductImage
                      src={p.images[0]}
                      alt={p.name}
                      width={600}
                      height={450}
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[var(--primary)]">
                      <div className="flex h-16 w-16 items-center justify-center border border-[var(--primary)]/30 bg-[var(--primary)]/10">
                        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                        {categoriesMap[p.category] || p.category}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <CardContent className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-4">
                <div className="flex flex-col gap-2">
                  <div className="min-h-[3.25rem]">
                    <h2
                      className="heading text-base font-semibold leading-snug text-neutral-900 transition-colors duration-200 line-clamp-2 group-hover:text-[var(--primary)]"
                      title={p.name}
                    >
                      {p.name}
                    </h2>
                  </div>

                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3 text-xs uppercase tracking-wide text-neutral-500">
                    <span>
                      Артикул: <span className="font-semibold text-neutral-800">{skuLabel}</span>
                    </span>
                    <Badge
                      variant="tertiary"
                      className="rounded-none px-2 py-1 text-[10px] uppercase tracking-wide"
                    >
                      {categoriesMap[p.category] || p.category}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-xs uppercase tracking-wide text-neutral-500">Цена</span>
                  <span className="text-lg font-semibold text-[var(--primary)]">
                    {formattedPrice ? `${formattedPrice} ₽` : 'По запросу'}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 text-xs text-neutral-500">
                  <div className="flex items-center gap-5">
                    <span className="whitespace-nowrap">
                      Создан: {new Date(p.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                    <Badge
                      variant={p.isActive ? 'default' : 'secondary'}
                      className="rounded-none px-2 py-1 text-[10px] uppercase tracking-wide"
                    >
                      {p.isActive ? 'Активен' : 'Скрыт'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => p.sku && router.push(`/products/${p.sku}`)}
                      title="Просмотр"
                      aria-label="Просмотреть на сайте"
                      disabled={!p.sku}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => startEdit(p)}
                      title="Редактировать"
                      aria-label="Редактировать продукт"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(p.id)}
                      title="Удалить"
                      aria-label="Удалить продукт"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Загрузка...</div>}>
      <AdminProductsPageInner />
    </Suspense>
  )
}
