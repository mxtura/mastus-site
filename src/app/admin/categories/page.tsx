"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

type Parameter = { id: string; code: string; nameRu: string }
type CategoryParam = { id: string; visible: boolean; required: boolean; parameter: Parameter }
type Category = { id: string; code: string; nameRu: string; params?: CategoryParam[] }

interface DraftParam { tempId: string; code: string; nameRu: string; visible: boolean; required: boolean }

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
  const [code, setCode] = useState('')
  const [nameRu, setNameRu] = useState('')
  // Draft parameters (local, will be created then bound after category creation)
  const [draftParams, setDraftParams] = useState<DraftParam[]>([])
  const [error, setError] = useState<string>('')
  const [allParams, setAllParams] = useState<Parameter[]>([])
  const [addingParam, setAddingParam] = useState(false)
  const [newParamCode, setNewParamCode] = useState('')
  const [newParamNameRu, setNewParamNameRu] = useState('')
  // Drafts for adding parameter inside existing categories
  const [categoryParamDrafts, setCategoryParamDrafts] = useState<Record<string, { open: boolean; code: string; nameRu: string; visible: boolean; required: boolean; submitting?: boolean }>>({})

  const load = async () => {
    try {
      setLoading(true)
      const [res, resParams] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/parameters')
      ])
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      setItems(data)
      if (resParams.ok) setAllParams(await resParams.json())
    } catch {
      setError('Не удалось загрузить категории')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Инициализируем черновые параметры базовыми (один раз), если пользователь ещё ничего не добавил/не изменил
  useEffect(() => {
    if (draftParams.length === 0) {
      setDraftParams(BASELINE_PARAMS.map(p => ({ tempId: crypto.randomUUID(), ...p })))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const add = async () => {
    try {
      setError('')
      const res = await fetch('/api/admin/categories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, nameRu })
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j?.error || 'Ошибка создания')
        return
      }
      const createdCat = await res.json()

      // For each draft param: create parameter (or reuse existing if code match), then bind
      for (const dp of draftParams) {
        // Try find existing by code
        const exists = allParams.find(p => p.code.toUpperCase() === dp.code.toUpperCase())
        let paramId = exists?.id
        if (!paramId) {
          const pr = await fetch('/api/admin/parameters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: dp.code, nameRu: dp.nameRu }) })
          if (pr.ok) {
            const p = await pr.json()
            paramId = p.id
          }
        } else if (exists && exists.nameRu !== dp.nameRu) {
          await fetch(`/api/admin/parameters/${exists.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nameRu: dp.nameRu }) })
        }
        if (paramId) {
          await fetch('/api/admin/categories/params', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categoryId: createdCat.id, parameterId: paramId, visible: dp.visible, required: dp.required }) })
        }
      }
      setCode(''); setNameRu(''); setDraftParams([]); setNewParamCode(''); setNewParamNameRu(''); setAddingParam(false)
      await load()
    } catch { setError('Ошибка сети') }
  }

  const updateCategory = async (c: Category, patch: Partial<{ nameRu: string }>) => {
    const res = await fetch(`/api/admin/categories/${c.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    })
    if (!res.ok) throw new Error('update failed')
  }

  const addDraftParam = () => {
    if (!newParamCode.trim() || !newParamNameRu.trim()) return
    setDraftParams(prev => [...prev, { tempId: crypto.randomUUID(), code: newParamCode.trim().toUpperCase(), nameRu: newParamNameRu.trim(), visible: true, required: false }])
    setNewParamCode(''); setNewParamNameRu(''); setAddingParam(false)
  }

  const updateDraftParam = (id: string, patch: Partial<Omit<DraftParam,'tempId'>>) => {
    setDraftParams(prev => prev.map(p => p.tempId === id ? { ...p, ...patch } : p))
  }

  const removeDraftParam = (id: string) => {
    setDraftParams(prev => prev.filter(p => p.tempId !== id))
  }

  const toggleCategoryParam = async (category: Category, parameterId: string, patch: Partial<{ visible: boolean; required: boolean }>) => {
    const cp = category.params?.find(p => p.parameter.id === parameterId)
    const visible = patch.visible ?? cp?.visible ?? true
    const required = patch.required ?? cp?.required ?? false
    await fetch('/api/admin/categories/params', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: category.id, parameterId, visible, required })
    })
    await load()
  }

  const removeCategoryParam = async (category: Category, parameterId: string) => {
    await fetch(`/api/admin/categories/params?categoryId=${category.id}&parameterId=${parameterId}`, { method: 'DELETE' })
    await load()
  }

  const openCategoryParamDraft = (c: Category) => {
    setCategoryParamDrafts(prev => ({
      ...prev,
      [c.id]: prev[c.id]?.open ? prev[c.id] : { open: true, code: '', nameRu: '', visible: true, required: false }
    }))
  }

  const updateCategoryParamDraft = (c: Category, patch: Partial<{ code: string; nameRu: string; visible: boolean; required: boolean }>) => {
    setCategoryParamDrafts(prev => ({
      ...prev,
      [c.id]: prev[c.id] ? { ...prev[c.id], ...patch } : { open: true, code: patch.code || '', nameRu: patch.nameRu || '', visible: patch.visible ?? true, required: patch.required ?? false }
    }))
  }

  const cancelCategoryParamDraft = (c: Category) => {
    setCategoryParamDrafts(prev => ({ ...prev, [c.id]: { open: false, code: '', nameRu: '', visible: true, required: false } }))
  }

  const submitCategoryParamDraft = async (c: Category) => {
    const draft = categoryParamDrafts[c.id]
    if (!draft || !draft.code.trim() || !draft.nameRu.trim()) return
    const codeUp = draft.code.trim().toUpperCase()
    if (!/^[A-Z0-9_\-]{2,40}$/.test(codeUp)) { setError('Некорректный код параметра'); return }
    try {
      setCategoryParamDrafts(prev => ({ ...prev, [c.id]: { ...draft, submitting: true } }))
      // Reuse existing param or create
      let existing = allParams.find(p => p.code === codeUp)
      if (!existing) {
        const cr = await fetch('/api/admin/parameters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: codeUp, nameRu: draft.nameRu.trim() }) })
        if (cr.ok) existing = await cr.json()
        else {
          const j = await cr.json().catch(()=>({}))
          setError(j?.error || 'Ошибка создания параметра')
          setCategoryParamDrafts(prev => ({ ...prev, [c.id]: { ...draft, submitting: false } }))
          return
        }
      } else if (existing.nameRu !== draft.nameRu.trim()) {
        await fetch(`/api/admin/parameters/${existing.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ nameRu: draft.nameRu.trim() }) })
      }
      if (existing) {
        // Assign
        await fetch('/api/admin/categories/params', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ categoryId: c.id, parameterId: existing.id, visible: draft.visible, required: draft.required }) })
      }
      // Reset draft
      setCategoryParamDrafts(prev => ({ ...prev, [c.id]: { open: false, code: '', nameRu: '', visible: true, required: false } }))
      await load()
    } catch {
      setError('Ошибка добавления параметра')
      setCategoryParamDrafts(prev => ({ ...prev, [c.id]: { ...draft, submitting: false } }))
    }
  }

  // legacy toggles removed in favor of dynamic parameters

  const removeCategory = async (c: Category) => {
    if (!confirm('Удалить категорию?')) return
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j?.error || 'Ошибка удаления')
      return
    }
    await load()
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Категории</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Добавить категорию</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            <Input placeholder="Код (например, LADDERS)" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} />
            <Input placeholder="Название по-русски" value={nameRu} onChange={e=>setNameRu(e.target.value)} />
            <Button onClick={add} disabled={!code.trim() || !nameRu.trim()}>Создать</Button>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Параметры по умолчанию</h3>
              {!addingParam && <Button size="sm" variant="outline" onClick={()=>setAddingParam(true)}>Добавить параметр</Button>}
            </div>
            {addingParam && (
              <div className="grid md:grid-cols-5 gap-2 mb-4 items-start border p-3 rounded">
                <Input placeholder="Код (SIZE)" value={newParamCode} onChange={e=>setNewParamCode(e.target.value.toUpperCase())} />
                <Input placeholder="Название (Размер)" value={newParamNameRu} onChange={e=>setNewParamNameRu(e.target.value)} />
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={true} disabled /> <span>Видимо</span></label>
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={false} disabled /> <span>Обязательно</span></label>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addDraftParam} disabled={!newParamCode.trim() || !newParamNameRu.trim()}>OK</Button>
                  <Button size="sm" variant="outline" onClick={()=>{ setAddingParam(false); setNewParamCode(''); setNewParamNameRu(''); }}>Отмена</Button>
                </div>
              </div>
            )}
            {draftParams.length === 0 && <p className="text-xs text-gray-500">Параметры не добавлены.</p>}
            {draftParams.length > 0 && (
              <div className="space-y-2">
                {draftParams.map(dp => (
                  <div key={dp.tempId} className="grid md:grid-cols-6 gap-2 items-center border rounded p-2 text-sm">
                    <Input value={dp.code} onChange={e=>updateDraftParam(dp.tempId,{ code: e.target.value.toUpperCase() })} />
                    <Input value={dp.nameRu} onChange={e=>updateDraftParam(dp.tempId,{ nameRu: e.target.value })} />
                    <label className="flex items-center gap-1 justify-center"><Checkbox checked={dp.visible} onCheckedChange={()=>updateDraftParam(dp.tempId,{ visible: !dp.visible })} /> <span>Видимо</span></label>
                    <label className="flex items-center gap-1 justify-center"><Checkbox checked={dp.required} onCheckedChange={()=>updateDraftParam(dp.tempId,{ required: !dp.required, visible: true })} /> <span>Обязательно</span></label>
                    <Button size="sm" variant="outline" onClick={()=>removeDraftParam(dp.tempId)}>Удалить</Button>
                    <div className="text-[10px] text-gray-500 break-all">{dp.code}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Категории</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Загрузка…</p>
          ) : (
            <div className="space-y-4">
              {items.map(c => (
                <div key={c.id} className="p-3 border rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-xs text-gray-500">{c.code}</div>
                      <Input className="mt-1 max-w-sm" defaultValue={c.nameRu} onBlur={async (e)=>{ const v=e.target.value.trim(); if(v && v!==c.nameRu){ await updateCategory(c,{ nameRu: v }); load(); } }} />
                    </div>
                    <Button variant="outline" onClick={()=>removeCategory(c)}>Удалить</Button>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Параметры категории</h4>
                    {c.params && c.params.length > 0 ? (
                      <div className="space-y-2">
                        {c.params.map(cp => (
                          <div key={cp.id} className="grid md:grid-cols-6 gap-2 items-center border rounded p-2 text-sm">
                            <Input defaultValue={cp.parameter.code} onBlur={async (e)=>{ const v=e.target.value.trim().toUpperCase(); if(v && v!==cp.parameter.code){ await fetch(`/api/admin/parameters/${cp.parameter.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code: v }) }); load(); } }} />
                            <Input defaultValue={cp.parameter.nameRu} onBlur={async (e)=>{ const v=e.target.value.trim(); if(v && v!==cp.parameter.nameRu){ await fetch(`/api/admin/parameters/${cp.parameter.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ nameRu: v }) }); load(); } }} />
                            <label className="flex items-center gap-1 justify-center"><Checkbox checked={cp.visible} onCheckedChange={()=>toggleCategoryParam(c, cp.parameter.id, { visible: !cp.visible })} /> <span>Видимо</span></label>
                            <label className="flex items-center gap-1 justify-center"><Checkbox checked={cp.required} onCheckedChange={()=>toggleCategoryParam(c, cp.parameter.id, { required: !cp.required, visible: true })} /> <span>Обязательно</span></label>
                            <Button size="sm" variant="outline" onClick={()=>removeCategoryParam(c, cp.parameter.id)}>Убрать</Button>
                            <div className="text-[10px] text-gray-500 break-all">{cp.parameter.code}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">Нет параметров</p>
                    )}
                    {/* Inline add new param to existing category */}
                    <div className="mt-3">
                      {!categoryParamDrafts[c.id]?.open && (
                        <Button size="sm" variant="outline" onClick={()=>openCategoryParamDraft(c)}>Добавить параметр</Button>
                      )}
                      {categoryParamDrafts[c.id]?.open && (
                        <div className="grid md:grid-cols-6 gap-2 items-center border rounded p-2 text-sm mt-2">
                          <Input placeholder="Код" value={categoryParamDrafts[c.id].code} onChange={e=>updateCategoryParamDraft(c,{ code: e.target.value.toUpperCase() })} />
                          <Input placeholder="Название" value={categoryParamDrafts[c.id].nameRu} onChange={e=>updateCategoryParamDraft(c,{ nameRu: e.target.value })} />
                          <label className="flex items-center gap-1 justify-center"><Checkbox checked={categoryParamDrafts[c.id].visible} onCheckedChange={()=>updateCategoryParamDraft(c,{ visible: !categoryParamDrafts[c.id].visible })} /> <span>Видимо</span></label>
                          <label className="flex items-center gap-1 justify-center"><Checkbox checked={categoryParamDrafts[c.id].required} onCheckedChange={()=>updateCategoryParamDraft(c,{ required: !categoryParamDrafts[c.id].required, visible: true })} /> <span>Обязательно</span></label>
                          <div className="flex gap-2">
                            <Button size="sm" disabled={!categoryParamDrafts[c.id].code.trim() || !categoryParamDrafts[c.id].nameRu.trim() || categoryParamDrafts[c.id].submitting} onClick={()=>submitCategoryParamDraft(c)}>
                              {categoryParamDrafts[c.id].submitting ? '...' : 'Добавить'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={()=>cancelCategoryParamDraft(c)}>Отмена</Button>
                          </div>
                          <div className="text-[10px] text-gray-500 break-all">{categoryParamDrafts[c.id].code || '—'}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
