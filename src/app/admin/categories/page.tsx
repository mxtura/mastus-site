"use client"

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft } from 'lucide-react'

type Parameter = { id: string; code: string; nameRu: string }
type CategoryParam = { id: string; visible: boolean; required: boolean; parameter: Parameter }
type Category = { id: string; code: string; nameRu: string; params?: CategoryParam[] }

interface DraftParam { tempId: string; code: string; nameRu: string; visible: boolean; required: boolean }
interface CategoryParamDraftState { open: boolean; code: string; nameRu: string; visible: boolean; required: boolean; submitting?: boolean }

// Базовые параметры по умолчанию (автоматически появляются при добавлении категории)
const BASELINE_PARAMS: Array<Omit<DraftParam,'tempId'>> = [
  { code: 'SIZE',      nameRu: 'Размер',    visible: true, required: false },
  { code: 'THICKNESS', nameRu: 'Толщина',   visible: true, required: false },
  { code: 'WEIGHT',    nameRu: 'Вес',       visible: true, required: false },
  { code: 'LOAD',      nameRu: 'Нагрузка',  visible: true, required: false },
  { code: 'MATERIAL',  nameRu: 'Материал',  visible: true, required: false },
  { code: 'COLOR',     nameRu: 'Цвет',      visible: true, required: false }
]

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [code, setCode] = useState('')
  const [nameRu, setNameRu] = useState('')
  const [addingParam, setAddingParam] = useState(false)
  const [draftParams, setDraftParams] = useState<DraftParam[]>(() => BASELINE_PARAMS.map((param, index) => ({ tempId: `baseline-${index}`, ...param })))
  const [newParamCode, setNewParamCode] = useState('')
  const [newParamNameRu, setNewParamNameRu] = useState('')
  const [categoryParamDrafts, setCategoryParamDrafts] = useState<Record<string, CategoryParamDraftState>>({})
  const [allParams, setAllParams] = useState<Parameter[]>([])
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)

  const resetDraftParams = useCallback(() => {
    setDraftParams(BASELINE_PARAMS.map((param, index) => ({ tempId: `baseline-${index}`, ...param })))
    setAddingParam(false)
    setNewParamCode('')
    setNewParamNameRu('')
  }, [])

  const loadParameters = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/parameters', { cache: 'no-store' })
      if (!res.ok) throw new Error('failed')
      const data = (await res.json()) as Parameter[]
      setAllParams(data)
    } catch {
      // ignore silently, allow retry on demand
    }
  }, [])

  const loadCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories', { cache: 'no-store' })
      if (!res.ok) throw new Error('failed')
      const data = (await res.json()) as Category[]
      setItems(data)
      setCategoryParamDrafts({})
      setError('')
    } catch {
      setError('Не удалось загрузить категории')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCategories()
    void loadParameters()
  }, [loadCategories, loadParameters])

  const updateCategory = useCallback(async (category: Category, patch: Partial<{ nameRu: string }>) => {
    const nextName = patch.nameRu?.trim()
    if (!nextName || nextName === category.nameRu) return
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nameRu: nextName })
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body?.error || 'Ошибка обновления категории')
        return
      }
      await loadCategories()
    } catch {
      setError('Ошибка обновления категории')
    }
  }, [loadCategories])

  const ensureParameter = useCallback(async (draft: DraftParam) => {
    const codeUp = draft.code.trim().toUpperCase()
    if (!codeUp || !/^[A-Z0-9_\-]{2,40}$/.test(codeUp)) return null
    const name = draft.nameRu.trim()
    let existing = allParams.find(p => p.code === codeUp)
    try {
      if (!existing) {
        const res = await fetch('/api/admin/parameters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: codeUp, nameRu: name || codeUp })
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body?.error || 'Ошибка создания параметра')
          return null
        }
        existing = (await res.json()) as Parameter
        setAllParams(prev => [...prev, existing!])
      } else if (name && name !== existing.nameRu) {
        const res = await fetch(`/api/admin/parameters/${existing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nameRu: name })
        })
        if (res.ok) {
          existing = { ...existing, nameRu: name }
          setAllParams(prev => prev.map(p => p.id === existing!.id ? existing! : p))
        }
      }
      return existing ?? null
    } catch {
      setError('Ошибка обработки параметра')
      return null
    }
  }, [allParams])

  const add = useCallback(async () => {
    const codeUp = code.trim().toUpperCase()
    const name = nameRu.trim()
    if (!/^[A-Z0-9_\-]{2,40}$/.test(codeUp)) {
      setError('Некорректный код категории')
      return
    }
    if (!name) {
      setError('Укажите название категории')
      return
    }
    setError('')
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeUp, nameRu: name })
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body?.error || 'Ошибка создания категории')
        return
      }
      const created = (await res.json()) as Category
      for (const draft of draftParams) {
        const param = await ensureParameter(draft)
        if (!param) continue
        await fetch('/api/admin/categories/params', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryId: created.id,
            parameterId: param.id,
            visible: draft.visible,
            required: draft.required
          })
        })
      }
      setCode('')
      setNameRu('')
      resetDraftParams()
      await Promise.all([loadCategories(), loadParameters()])
      setEditingCategoryId(created.id)
    } catch {
      setError('Ошибка создания категории')
    }
  }, [code, nameRu, draftParams, ensureParameter, loadCategories, loadParameters, resetDraftParams])

  const toggleCategoryParam = useCallback(async (category: Category, parameterId: string, patch: Partial<{ visible: boolean; required: boolean }>) => {
    try {
      await fetch('/api/admin/categories/params', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: category.id,
          parameterId,
          visible: patch.visible ?? true,
          required: patch.required ?? false
        })
      })
      await loadCategories()
    } catch {
      setError('Ошибка обновления параметров категории')
    }
  }, [loadCategories])

  const removeCategoryParam = useCallback(async (category: Category, parameterId: string) => {
    try {
      const res = await fetch(`/api/admin/categories/params?categoryId=${category.id}&parameterId=${parameterId}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body?.error || 'Ошибка удаления параметра')
        return
      }
      await loadCategories()
    } catch {
      setError('Ошибка удаления параметра')
    }
  }, [loadCategories])

  const addDraftParam = useCallback(() => {
    const codeUp = newParamCode.trim().toUpperCase()
    const name = newParamNameRu.trim()
    if (!codeUp || !name || !/^[A-Z0-9_\-]{2,40}$/.test(codeUp)) {
      setError('Укажите корректный код и название параметра')
      return
    }
    setDraftParams(prev => [...prev, { tempId: `tmp-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`, code: codeUp, nameRu: name, visible: true, required: false }])
    setNewParamCode('')
    setNewParamNameRu('')
    setAddingParam(false)
  }, [newParamCode, newParamNameRu])

  const updateDraftParam = useCallback((tempId: string, patch: Partial<Omit<DraftParam, 'tempId'>>) => {
    setDraftParams(prev => prev.map(item => item.tempId === tempId ? { ...item, ...patch, visible: patch.required ? true : patch.visible ?? item.visible } : item))
  }, [])

  const removeDraftParam = useCallback((tempId: string) => {
    setDraftParams(prev => prev.filter(item => item.tempId !== tempId))
  }, [])

  const openCategoryParamDraft = useCallback((category: Category) => {
    setCategoryParamDrafts(prev => ({
      ...prev,
      [category.id]: prev[category.id]?.open ? prev[category.id] : { open: true, code: '', nameRu: '', visible: true, required: false }
    }))
  }, [])

  const updateCategoryParamDraft = useCallback((category: Category, patch: Partial<{ code: string; nameRu: string; visible: boolean; required: boolean }>) => {
    setCategoryParamDrafts(prev => ({
      ...prev,
      [category.id]: prev[category.id]
        ? { ...prev[category.id], ...patch, visible: patch.required ? true : patch.visible ?? prev[category.id].visible }
        : { open: true, code: patch.code ?? '', nameRu: patch.nameRu ?? '', visible: patch.visible ?? true, required: patch.required ?? false }
    }))
  }, [])

  const cancelCategoryParamDraft = useCallback((category: Category) => {
    setCategoryParamDrafts(prev => ({ ...prev, [category.id]: { open: false, code: '', nameRu: '', visible: true, required: false } }))
  }, [])

  const submitCategoryParamDraft = useCallback(async (category: Category) => {
    const draft = categoryParamDrafts[category.id]
    if (!draft || !draft.code.trim() || !draft.nameRu.trim()) return
    const codeUp = draft.code.trim().toUpperCase()
    if (!/^[A-Z0-9_\-]{2,40}$/.test(codeUp)) { setError('Некорректный код параметра'); return }
    setCategoryParamDrafts(prev => ({ ...prev, [category.id]: { ...draft, submitting: true } }))
    try {
      let existing = allParams.find(p => p.code === codeUp) ?? null
      if (!existing) {
        const res = await fetch('/api/admin/parameters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: codeUp, nameRu: draft.nameRu.trim() })
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body?.error || 'Ошибка создания параметра')
          setCategoryParamDrafts(prev => ({ ...prev, [category.id]: { ...draft, submitting: false } }))
          return
        }
        existing = (await res.json()) as Parameter
        setAllParams(prev => [...prev, existing!])
      } else if (existing.nameRu !== draft.nameRu.trim()) {
        await fetch(`/api/admin/parameters/${existing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nameRu: draft.nameRu.trim() })
        })
        existing = { ...existing, nameRu: draft.nameRu.trim() }
        setAllParams(prev => prev.map(p => p.id === existing!.id ? existing! : p))
      }

      if (existing) {
        await fetch('/api/admin/categories/params', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryId: category.id,
            parameterId: existing.id,
            visible: draft.visible,
            required: draft.required
          })
        })
      }
      setCategoryParamDrafts(prev => ({ ...prev, [category.id]: { open: false, code: '', nameRu: '', visible: true, required: false } }))
      await Promise.all([loadCategories(), loadParameters()])
    } catch {
      setError('Ошибка добавления параметра')
      setCategoryParamDrafts(prev => ({ ...prev, [category.id]: { ...draft, submitting: false } }))
    }
  }, [allParams, categoryParamDrafts, loadCategories, loadParameters])

  const removeCategory = useCallback(async (category: Category) => {
    if (!confirm('Удалить категорию?')) return
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        alert(body?.error || 'Ошибка удаления')
        return
      }
      await loadCategories()
    } catch {
      alert('Ошибка удаления категории')
    }
  }, [loadCategories])
  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-wide text-neutral-900">Категории</h1>
          <p className="text-sm text-neutral-500">Управляйте витриной товаров и отображаемыми параметрами</p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/products" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад к продукции
          </Link>
        </Button>
      </div>

      <Card className="border border-neutral-300 shadow-sm overflow-hidden py-0">
        <CardHeader className="flex flex-col gap-3 border-b border-neutral-200 bg-neutral-900 py-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold uppercase tracking-wide">Добавить категорию</CardTitle>
            <p className="text-xs text-neutral-300">Создайте категорию и настройте параметры по умолчанию</p>
          </div>
          <div className="text-xs font-medium uppercase tracking-wide text-white/60">
            Всего категорий: {items.length}
          </div>
        </CardHeader>
  <CardContent className="space-y-8 bg-neutral-50 py-6">
          <div className="rounded border border-neutral-200 bg-white p-4 shadow-inner">
            <div className="grid gap-3 md:grid-cols-[2fr_2fr_1fr]">
              <Input placeholder="Код (например, LADDERS)" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} />
              <Input placeholder="Название по-русски" value={nameRu} onChange={e=>setNameRu(e.target.value)} />
              <Button onClick={add} disabled={!code.trim() || !nameRu.trim()}>Создать</Button>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>

          <div className="rounded border border-neutral-200 bg-white p-4 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Параметры по умолчанию</h3>
                <p className="text-xs text-neutral-500">Они будут автоматически связаны с новой категорией</p>
              </div>
              {!addingParam && (
                <Button size="sm" variant="outline" onClick={()=>setAddingParam(true)}>
                  Добавить параметр
                </Button>
              )}
            </div>

            {addingParam && (
              <div className="mb-4 grid items-start gap-2 rounded border border-dashed border-neutral-300 bg-neutral-50 p-3 md:grid-cols-5">
                <Input placeholder="Код (SIZE)" value={newParamCode} onChange={e=>setNewParamCode(e.target.value.toUpperCase())} />
                <Input placeholder="Название (Размер)" value={newParamNameRu} onChange={e=>setNewParamNameRu(e.target.value)} />
                <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-neutral-600">
                  <Checkbox checked disabled /> Видимо
                </label>
                <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-neutral-600">
                  <Checkbox checked={false} disabled /> Обязательно
                </label>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addDraftParam} disabled={!newParamCode.trim() || !newParamNameRu.trim()}>
                    Добавить
                  </Button>
                  <Button size="sm" variant="outline" onClick={()=>{ setAddingParam(false); setNewParamCode(''); setNewParamNameRu(''); }}>
                    Отмена
                  </Button>
                </div>
              </div>
            )}

            {draftParams.length === 0 && <p className="text-xs text-neutral-500">Параметры не добавлены.</p>}
            {draftParams.length > 0 && (
              <div className="space-y-2">
                {draftParams.map(dp => (
                  <div key={dp.tempId} className="grid items-center gap-2 rounded border border-neutral-200 bg-neutral-50 p-3 text-sm md:grid-cols-6">
                    <Input value={dp.code} onChange={e=>updateDraftParam(dp.tempId,{ code: e.target.value.toUpperCase() })} />
                    <Input value={dp.nameRu} onChange={e=>updateDraftParam(dp.tempId,{ nameRu: e.target.value })} />
                    <label className="flex items-center justify-center gap-1 text-xs uppercase tracking-wide text-neutral-600">
                      <Checkbox checked={dp.visible} onCheckedChange={()=>updateDraftParam(dp.tempId,{ visible: !dp.visible })} /> Видимо
                    </label>
                    <label className="flex items-center justify-center gap-1 text-xs uppercase tracking-wide text-neutral-600">
                      <Checkbox checked={dp.required} onCheckedChange={()=>updateDraftParam(dp.tempId,{ required: !dp.required, visible: true })} /> Обязательно
                    </label>
                    <Button size="sm" variant="outline" onClick={()=>removeDraftParam(dp.tempId)}>Удалить</Button>
                    <div className="text-[10px] font-mono uppercase tracking-wide text-neutral-400">{dp.code}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-neutral-300 shadow-sm overflow-hidden py-0">
        <CardHeader className="border-b border-neutral-200 bg-white py-6">
          <CardTitle className="text-lg font-semibold uppercase tracking-wide text-neutral-800">Текущие категории</CardTitle>
        </CardHeader>
  <CardContent className="bg-neutral-50 py-6">
          {loading ? (
            <p className="py-8 text-center text-sm text-neutral-500">Загрузка…</p>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">Категории ещё не созданы</p>
          ) : (
            <div className="space-y-5">
              {items.map(c => {
                const isEditing = editingCategoryId === c.id
                const paramCount = c.params?.length ?? 0
                return (
                  <div key={c.id} className="overflow-hidden rounded border border-neutral-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-neutral-200 bg-neutral-900 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-white/60">Код категории</p>
                        <p className="font-mono text-base">{c.code}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => {
                          if (isEditing) {
                            setEditingCategoryId(null)
                            cancelCategoryParamDraft(c)
                          } else {
                            setEditingCategoryId(c.id)
                          }
                        }}>
                          {isEditing ? 'Свернуть' : 'Изменить'}
                        </Button>
                        <Button size="sm" variant="tertiary" className="text-white hover:text-white/90" onClick={()=>removeCategory(c)}>
                          Удалить
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-5 px-5 py-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-neutral-500">Название</p>
                          <p className="text-lg font-semibold text-neutral-900">{c.nameRu}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium uppercase tracking-wide text-neutral-600">
                            Параметров: {paramCount}
                          </span>
                        </div>
                      </div>

                      {!isEditing && (
                        <div className="flex flex-wrap gap-2">
                          {c.params && c.params.length > 0 ? (
                            c.params.map(cp => (
                              <span key={cp.id} className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${cp.required ? 'bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/40' : 'border border-neutral-200 text-neutral-600 bg-neutral-100'}`}>
                                {cp.parameter.nameRu}
                                {cp.required ? ' • обяз.' : cp.visible ? '' : ' • скрыт'}
                              </span>
                            ))
                          ) : (
                            <p className="text-xs text-neutral-500">Нет параметров</p>
                          )}
                        </div>
                      )}

                      {isEditing && (
                        <div className="space-y-5 rounded border border-dashed border-neutral-300 bg-neutral-50 p-4">
                          <div className="grid gap-2 sm:max-w-md">
                            <label className="text-xs uppercase tracking-wide text-neutral-500">Название категории</label>
                            <Input defaultValue={c.nameRu} onBlur={async e => {
                              const value = e.target.value.trim()
                              if (value && value !== c.nameRu) {
                                await updateCategory(c, { nameRu: value })
                              }
                            }} />
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Параметры</p>
                            {c.params && c.params.length > 0 ? (
                              <div className="space-y-2">
                                {c.params.map(cp => (
                                  <div key={cp.id} className="grid items-center gap-2 rounded border border-neutral-200 bg-white p-3 text-sm md:grid-cols-[repeat(6,minmax(0,1fr))]">
                                    <Input defaultValue={cp.parameter.code} onBlur={async e => {
                                      const value = e.target.value.trim().toUpperCase()
                                      if (value && value !== cp.parameter.code) {
                                        await fetch(`/api/admin/parameters/${cp.parameter.id}`, {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ code: value })
                                        })
                                        await Promise.all([loadCategories(), loadParameters()])
                                      }
                                    }} />
                                    <Input defaultValue={cp.parameter.nameRu} onBlur={async e => {
                                      const value = e.target.value.trim()
                                      if (value && value !== cp.parameter.nameRu) {
                                        await fetch(`/api/admin/parameters/${cp.parameter.id}`, {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ nameRu: value })
                                        })
                                        await Promise.all([loadCategories(), loadParameters()])
                                      }
                                    }} />
                                    <label className="flex items-center justify-center gap-1 text-xs uppercase tracking-wide text-neutral-600">
                                      <Checkbox checked={cp.visible} onCheckedChange={()=>toggleCategoryParam(c, cp.parameter.id, { visible: !cp.visible })} /> Видимо
                                    </label>
                                    <label className="flex items-center justify-center gap-1 text-xs uppercase tracking-wide text-neutral-600">
                                      <Checkbox checked={cp.required} onCheckedChange={()=>toggleCategoryParam(c, cp.parameter.id, { required: !cp.required, visible: true })} /> Обязательно
                                    </label>
                                    <Button size="sm" variant="tertiary" onClick={()=>removeCategoryParam(c, cp.parameter.id)}>Убрать</Button>
                                    <div className="text-[10px] font-mono uppercase tracking-wide text-neutral-400">{cp.parameter.code}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-neutral-500">Нет параметров</p>
                            )}
                          </div>

                          <div className="border-t border-neutral-200 pt-4">
                            {!categoryParamDrafts[c.id]?.open && (
                              <Button size="sm" variant="outline" onClick={()=>openCategoryParamDraft(c)}>Добавить параметр</Button>
                            )}
                            {categoryParamDrafts[c.id]?.open && (
                              <div className="mt-3 grid items-center gap-2 rounded border border-neutral-200 bg-white p-3 text-sm md:grid-cols-[repeat(6,minmax(0,1fr))]">
                                <Input placeholder="Код" value={categoryParamDrafts[c.id].code} onChange={e=>updateCategoryParamDraft(c,{ code: e.target.value.toUpperCase() })} />
                                <Input placeholder="Название" value={categoryParamDrafts[c.id].nameRu} onChange={e=>updateCategoryParamDraft(c,{ nameRu: e.target.value })} />
                                <label className="flex items-center justify-center gap-1 text-xs uppercase tracking-wide text-neutral-600">
                                  <Checkbox checked={categoryParamDrafts[c.id].visible} onCheckedChange={()=>updateCategoryParamDraft(c,{ visible: !categoryParamDrafts[c.id].visible })} /> Видимо
                                </label>
                                <label className="flex items-center justify-center gap-1 text-xs uppercase tracking-wide text-neutral-600">
                                  <Checkbox checked={categoryParamDrafts[c.id].required} onCheckedChange={()=>updateCategoryParamDraft(c,{ required: !categoryParamDrafts[c.id].required, visible: true })} /> Обязательно
                                </label>
                                <div className="flex gap-2">
                                  <Button size="sm" disabled={!categoryParamDrafts[c.id].code.trim() || !categoryParamDrafts[c.id].nameRu.trim() || categoryParamDrafts[c.id].submitting} onClick={()=>submitCategoryParamDraft(c)}>
                                    {categoryParamDrafts[c.id].submitting ? '...' : 'Добавить'}
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={()=>cancelCategoryParamDraft(c)}>Отмена</Button>
                                </div>
                                <div className="text-[10px] font-mono uppercase tracking-wide text-neutral-400">{categoryParamDrafts[c.id].code || '—'}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

