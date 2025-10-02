'use client'

import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import type {
  WheelEvent as ReactWheelEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import ProductImage from '@/components/ProductImage'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images?: string[]
  name: string
  categoryLabel?: string
}

const FALLBACK_IMAGE = '/images/placeholder-product.svg'
const ZOOM_STEP = 0.3
const MAX_ZOOM = 4

type LightboxSize = {
  width: number
  height: number
}

const DEFAULT_LIGHTBOX_SIZE: LightboxSize = { width: 1600, height: 1200 }

type ZoomUpdater = number | ((current: number) => number)

const clampOffsetValue = (value: number, max: number) => {
  if (max <= 0) return 0
  return Math.max(-max, Math.min(max, value))
}

export function ProductGallery({ images = [], name, categoryLabel }: ProductGalleryProps) {
  const sanitized = useMemo(
    () => images.filter((src) => typeof src === 'string' && src.trim() !== ''),
    [images],
  )
  const hasImages = sanitized.length > 0

  const [activeIndex, setActiveIndex] = useState(0)
  const [mainLoaded, setMainLoaded] = useState(false)
  const [mainError, setMainError] = useState(false)

  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxError, setLightboxError] = useState(false)
  const [lightboxSize, setLightboxSize] = useState<LightboxSize>(DEFAULT_LIGHTBOX_SIZE)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const pointerIdRef = useRef<number | null>(null)
  const lightboxContainerRef = useRef<HTMLDivElement | null>(null)

  const resetView = useCallback(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    pointerIdRef.current = null
    setIsDragging(false)
  }, [])

  const setZoomLevel = useCallback(
    (targetZoom: ZoomUpdater, origin?: { clientX: number; clientY: number }) => {
      const container = lightboxContainerRef.current
      if (!container) return

      setZoom((prevZoom) => {
        const desiredZoom = typeof targetZoom === 'function' ? targetZoom(prevZoom) : targetZoom
        const nextZoom = Number(Math.min(MAX_ZOOM, Math.max(1, desiredZoom)).toFixed(2))
        if (nextZoom === prevZoom) return prevZoom

        const rect = container.getBoundingClientRect()

        setOffset((prevOffset) => {
          if (nextZoom <= 1) return { x: 0, y: 0 }

          let nextOffset = { ...prevOffset }

          if (origin) {
            const offsetFromCenterX = origin.clientX - rect.left - rect.width / 2
            const offsetFromCenterY = origin.clientY - rect.top - rect.height / 2
            const scaleRatio = nextZoom / prevZoom
            const scaleDelta = scaleRatio - 1

            nextOffset = {
              x: prevOffset.x - offsetFromCenterX * scaleDelta,
              y: prevOffset.y - offsetFromCenterY * scaleDelta,
            }
          }

          const maxX = (rect.width * (nextZoom - 1)) / 2
          const maxY = (rect.height * (nextZoom - 1)) / 2

          return {
            x: clampOffsetValue(nextOffset.x, maxX),
            y: clampOffsetValue(nextOffset.y, maxY),
          }
        })

        return nextZoom
      })
    },
    [],
  )

  const handleWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>) => {
      if (!isLightboxOpen) return
      event.preventDefault()
      const direction = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
      setZoomLevel((current) => current + direction, {
        clientX: event.clientX,
        clientY: event.clientY,
      })
    },
    [isLightboxOpen, setZoomLevel],
  )

  const handleDoubleClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      setZoomLevel(
        (current) => (current > 1.05 ? 1 : Math.min(MAX_ZOOM, current + 1)),
        { clientX: event.clientX, clientY: event.clientY },
      )
    },
    [setZoomLevel],
  )

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (zoom <= 1) return
      event.preventDefault()
      pointerIdRef.current = event.pointerId
      event.currentTarget.setPointerCapture(event.pointerId)
      setIsDragging(true)
      dragStartRef.current = {
        x: event.clientX - offset.x,
        y: event.clientY - offset.y,
      }
    },
    [offset, zoom],
  )

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDragging || pointerIdRef.current !== event.pointerId || zoom <= 1) return
      event.preventDefault()

      const container = lightboxContainerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const nextOffset = {
        x: event.clientX - dragStartRef.current.x,
        y: event.clientY - dragStartRef.current.y,
      }
      const maxX = (rect.width * (zoom - 1)) / 2
      const maxY = (rect.height * (zoom - 1)) / 2

      setOffset({
        x: clampOffsetValue(nextOffset.x, maxX),
        y: clampOffsetValue(nextOffset.y, maxY),
      })
    },
    [isDragging, zoom],
  )

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return
    event.preventDefault()
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      /* ignore */
    }
    pointerIdRef.current = null
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (!hasImages) {
      setActiveIndex(0)
      return
    }
    setActiveIndex((prev) => (prev >= sanitized.length ? 0 : prev))
  }, [hasImages, sanitized.length])


  useEffect(() => {
    setMainLoaded(false)
    setMainError(false)
  }, [activeIndex, sanitized])

  useEffect(() => {
    if (!isLightboxOpen) return
    setLightboxIndex(activeIndex)
    setLightboxError(false)
  }, [isLightboxOpen, activeIndex])

  const openLightbox = useCallback(
    (index: number) => {
      if (!hasImages) return
      resetView()
      setLightboxIndex(index)
      setLightboxError(false)
      setIsLightboxOpen(true)
    },
    [hasImages, resetView],
  )

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false)
    pointerIdRef.current = null
    setIsDragging(false)
    resetView()
  }, [resetView])

  const showNext = useCallback(() => {
    if (!hasImages) return
    setActiveIndex((prev) => {
      const next = (prev + 1) % sanitized.length
      if (isLightboxOpen) {
        setLightboxIndex(next)
        setLightboxError(false)
      }
      return next
    })
  }, [hasImages, sanitized.length, isLightboxOpen])

  const showPrev = useCallback(() => {
    if (!hasImages) return
    setActiveIndex((prev) => {
      const next = (prev - 1 + sanitized.length) % sanitized.length
      if (isLightboxOpen) {
        setLightboxIndex(next)
        setLightboxError(false)
      }
      return next
    })
  }, [hasImages, sanitized.length, isLightboxOpen])

  const handleSelect = useCallback(
    (index: number) => {
      if (!hasImages) return
      setActiveIndex(index)
      if (isLightboxOpen) {
        setLightboxIndex(index)
        setLightboxError(false)
      }
    },
    [hasImages, isLightboxOpen],
  )

  useEffect(() => {
    if (!isLightboxOpen) return

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox()
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        showNext()
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        showPrev()
      }
    }

    window.addEventListener('keydown', handleKey)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = originalOverflow
    }
  }, [isLightboxOpen, closeLightbox, showNext, showPrev])

  useEffect(() => {
    if (!isLightboxOpen) return
    resetView()
  }, [isLightboxOpen, lightboxIndex, resetView])

  useEffect(() => {
    if (!isLightboxOpen || zoom <= 1) return

    const handleResize = () => {
      const container = lightboxContainerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const maxX = (rect.width * (zoom - 1)) / 2
      const maxY = (rect.height * (zoom - 1)) / 2
      setOffset((prev) => ({
        x: clampOffsetValue(prev.x, maxX),
        y: clampOffsetValue(prev.y, maxY),
      }))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isLightboxOpen, zoom])

  const currentMainSrc = hasImages ? sanitized[activeIndex] : FALLBACK_IMAGE
  const currentLightboxSrc = hasImages ? sanitized[lightboxIndex] : FALLBACK_IMAGE
  const canZoomIn = zoom < MAX_ZOOM - 0.01
  const canZoomOut = zoom > 1.01
  const canReset = canZoomOut || Math.abs(offset.x) > 1 || Math.abs(offset.y) > 1

  useEffect(() => {
    setLightboxSize(DEFAULT_LIGHTBOX_SIZE)
  }, [currentLightboxSrc])

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-neutral-100 border border-neutral-200 flex items-center justify-center p-4">
        {hasImages ? (
          <>
            <Image
              key={currentMainSrc}
              src={mainError ? FALLBACK_IMAGE : currentMainSrc}
              alt={`${name} ${activeIndex + 1}`}
              fill
              sizes="(min-width: 1024px) 600px, 100vw"
              className={cn(
                'object-contain transition-all duration-500 ease-out',
                mainLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
              )}
              onLoadingComplete={() => setMainLoaded(true)}
              onError={() => setMainError(true)}
              priority
            />

            {sanitized.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  aria-label="Предыдущее фото"
                  className="absolute left-3 top-1/2 z-20 -translate-y-1/2 bg-white/80 p-2 text-neutral-800 shadow transition hover:bg-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Следующее фото"
                  className="absolute right-3 top-1/2 z-20 -translate-y-1/2 bg-white/80 p-2 text-neutral-800 shadow transition hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded bg-black/50 px-3 py-1 text-xs font-medium text-white">
                  {activeIndex + 1} / {sanitized.length}
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => openLightbox(activeIndex)}
              aria-label="Открыть фото на весь экран"
              className="absolute right-3 top-3 z-20 flex items-center gap-2 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800 shadow transition hover:bg-white"
            >
              <Maximize2 className="h-4 w-4" />
              Открыть
            </button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--primary)]/5">
            <div className="text-center text-[var(--primary)]">
              <div className="w-24 h-24 mx-auto mb-4 bg-[var(--primary)]/20 rounded-none flex items-center justify-center border border-[var(--primary)]/30">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
                </svg>
              </div>
              <p className="text-lg font-medium">{categoryLabel}</p>
            </div>
          </div>
        )}
      </div>

      {hasImages && sanitized.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {sanitized.map((image, index) => (
            <button
              key={image + index}
              type="button"
              onClick={() => handleSelect(index)}
              aria-label={`Показать фото ${index + 1}`}
              className={cn(
                'relative aspect-square border transition',
                activeIndex === index ? 'border-neutral-900' : 'border-neutral-200 hover:border-neutral-400',
              )}
            >
              <ProductImage
                src={image}
                alt={`${name} превью ${index + 1}`}
                width={160}
                height={160}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-6 py-10 transition-opacity duration-300',
          isLightboxOpen ? 'opacity-100 pointer-events-auto' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!isLightboxOpen}
      >
        <button
          type="button"
          onClick={closeLightbox}
          aria-label="Закрыть полноэкранный просмотр"
          className="absolute right-6 top-6 flex items-center gap-2 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
        >
          <X className="h-4 w-4" />
          Закрыть
        </button>

        {hasImages ? (
          <>
            <button
              type="button"
              onClick={showPrev}
              aria-label="Предыдущее фото"
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 p-3 text-white transition hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="relative flex w-full max-w-5xl flex-col items-center gap-6">
              <div
                ref={lightboxContainerRef}
                role="presentation"
                aria-label="Область просмотра изображения"
                className="relative flex max-h-[80vh] w-full items-center justify-center overflow-hidden"
                onWheel={handleWheel}
                onDoubleClick={handleDoubleClick}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <Image
                  key={currentLightboxSrc}
                  src={lightboxError ? FALLBACK_IMAGE : currentLightboxSrc}
                  alt={`${name} полноэкранное фото ${lightboxIndex + 1}`}
                  width={lightboxSize.width}
                  height={lightboxSize.height}
                  sizes="(min-width: 1280px) 70vw, (min-width: 768px) 85vw, 100vw"
                  className="select-none object-contain transition-transform duration-300 ease-out"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '80vh',
                    transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                    cursor: isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default',
                    willChange: 'transform',
                  }}
                  onLoadingComplete={(event) => {
                    if (event.naturalWidth > 0 && event.naturalHeight > 0) {
                      setLightboxSize({ width: event.naturalWidth, height: event.naturalHeight })
                    }
                  }}
                  onError={() => {
                    setLightboxError(true)
                    setLightboxSize(DEFAULT_LIGHTBOX_SIZE)
                  }}
                  priority
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium uppercase tracking-widest text-white/80">
                <span className="rounded border border-white/30 bg-white/10 px-2 py-1">
                  {lightboxIndex + 1} / {sanitized.length}
                </span>
                <span className="text-white/60">{name}</span>

                <div className="ml-4 flex items-center gap-2 text-white">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((current) => current - ZOOM_STEP)}
                    aria-label="Уменьшить масштаб"
                    className="rounded-full bg-white/10 p-2 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={!canZoomOut}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((current) => current + ZOOM_STEP)}
                    aria-label="Увеличить масштаб"
                    className="rounded-full bg-white/10 p-2 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={!canZoomIn}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    aria-label="Сбросить масштаб"
                    className="rounded-full bg-white/10 p-2 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={!canReset}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <span className="min-w-[3rem] text-center text-xs font-semibold text-white/70">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={showNext}
              aria-label="Следующее фото"
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 p-3 text-white transition hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        ) : (
          <div className="text-center text-white/80">Нет изображений для отображения</div>
        )}
      </div>
    </div>
  )
}

export default ProductGallery
