"use client";

import Link from "next/link";
// Image import removed (handled inside FadingSlideshow)
import { FadingSlideshow } from "@/components/fading-slideshow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";
// Using contact info from DB for tel

interface ProductPreview {
  id: string;
  name: string;
  category: string;
  images: string[];
  price?: number | null;
  description?: string | null;
}

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [products, setProducts] = useState<ProductPreview[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [heroTitle, setHeroTitle] = useState<string>('');
  const [heroSubtitle, setHeroSubtitle] = useState<string>('');
  const [phoneTel, setPhoneTel] = useState<string>('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    let aborted = false;
    async function load() {
      try {
        setLoadingProducts(true);
        const res = await fetch('/api/products', { next: { revalidate: 60 } });
        if (!res.ok) throw new Error('Failed to load products');
        const data = await res.json();
        if (!aborted) {
          setProducts(Array.isArray(data) ? data : []);
        }
  } catch {
        // Silently ignore for homepage minimal block
      } finally {
        if (!aborted) setLoadingProducts(false);
      }
    }
    load();
    return () => { aborted = true; };
  }, []);

  // Load editable content
  useEffect(() => {
    let ignore = false
    async function loadContent() {
      try {
        const res = await fetch('/api/content?type=HOME', { next: { revalidate: 30 } })
        if (!res.ok) return
        const payload = await res.json()
        if (ignore) return
        const data = payload?.data || {}
        if (typeof data.heroTitle === 'string') setHeroTitle(data.heroTitle)
        if (typeof data.heroSubtitle === 'string') setHeroSubtitle(data.heroSubtitle)
      } catch {}
    }
    loadContent()
    return () => { ignore = true }
  }, [])

  // Load contact phone for CTA
  useEffect(() => {
    let ignore = false
    async function loadContact() {
      try {
        const res = await fetch('/api/content?type=CONTACTS', { next: { revalidate: 60 } })
        if (!res.ok) return
        const payload = await res.json()
        if (ignore) return
        const data = payload?.data || {}
        if (typeof data.phoneTel === 'string') setPhoneTel(data.phoneTel)
      } catch {}
    }
    loadContact()
    return () => { ignore = true }
  }, [])

  const ladderImages = useMemo(() => {
    return products
      .filter(p => p.category === 'LADDERS' && p.images && p.images.length)
      .flatMap(p => p.images.slice(0,2)) // up to 2 per product
      .filter(Boolean)
      .slice(0, 8)
      .map((src: string, idx: number) => ({ src, alt: `Лестницы ${idx+1}` }));
  }, [products]);

  const polymerImages = useMemo(() => {
    return products
      .filter(p => (p.category === 'MANHOLES' || p.category === 'SUPPORT_RINGS') && p.images && p.images.length)
      .flatMap(p => p.images.slice(0,2))
      .filter(Boolean)
      .slice(0, 8)
      .map((src: string, idx: number) => ({ src, alt: `Полимер-песчаные изделия ${idx+1}` }));
  }, [products]);

  return (
    <div className="min-h-screen">
      {/* Hero Section (industrial style) */}
  <section className="relative bg-neutral-900 text-white py-20 lg:py-32 overflow-hidden border-b-4 border-[var(--tertiary)]">
        {/* Background Pattern: sharp grid */}
        <div className="absolute inset-0 opacity-15 mix-blend-lighten pointer-events-none select-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23ffffff' stroke-width='1' stroke-opacity='0.09'%3E%3Cpath d='M0 .5H80M0 16.5H80M0 32.5H80M0 48.5H80M0 64.5H80M0 79.5H80'/%3E%3Cpath d='M.5 0v80M16.5 0v80M32.5 0v80M48.5 0v80M64.5 0v80M79.5 0v80'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] bg-clip-text text-transparent heading tracking-wide">
              {heroTitle}
            </h1>
            
            <p className="text-xl sm:text-2xl mb-8 text-gray-300 font-light tracking-wide">
              {heroSubtitle}
            </p>
            
            
          </div>
        </div>
      </section>

      {/* Products Section (multiple variants for selection) */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 heading">Наша продукция</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
            <Card className="group overflow-hidden shadow-sm hover:shadow-md transition-all rounded-none border border-neutral-300 bg-neutral-50">
              <div className="relative h-48 bg-neutral-100 border-b border-neutral-300 flex items-center justify-center">
                {ladderImages.length > 0 ? (
                  <FadingSlideshow
                    images={ladderImages}
                    priorityFirst
                    interval={3200}
                    fadeDuration={650}
                    className="h-full w-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400 tracking-wide">{loadingProducts ? 'Загрузка...' : 'Нет изображений'}</div>
                )}
                <div className="absolute top-0 left-0 h-1 w-full bg-[var(--tertiary)]" />
                <div className="absolute bottom-2 left-2">
                  <Badge variant="tertiary" className="text-[10px] tracking-wider rounded-none bg-transparent">1-3 СЕКЦИИ</Badge>
                </div>
              </div>
              <CardHeader className="pb-3 space-y-1">
                <CardTitle className="text-lg font-semibold tracking-wide text-neutral-900 heading">АЛЮМИНИЕВЫЕ ЛЕСТНИЦЫ</CardTitle>
                <CardDescription className="text-sm tracking-wide text-neutral-600">Профессиональные решения из алюминиевого сплава для производственных задач</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-2xl font-semibold text-neutral-900 leading-none">от 6 200₽</span>
                  <span className="text-xs text-neutral-500">/ШТ</span>
                </div>
                <Button asChild className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 rounded-none tracking-wide">
                  <Link href="/products?categories=LADDERS">Смотреть лестницы</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden shadow-sm hover:shadow-md transition-all rounded-none border border-neutral-300 bg-neutral-50">
              <div className="relative h-48 bg-neutral-100 border-b border-neutral-300 flex items-center justify-center">
                {polymerImages.length > 0 ? (
                  <FadingSlideshow
                    images={polymerImages}
                    interval={3400}
                    fadeDuration={650}
                    className="h-full w-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400 tracking-wide">{loadingProducts ? 'Загрузка...' : 'Нет изображений'}</div>
                )}
                <div className="absolute top-0 left-0 h-1 w-full bg-[var(--tertiary)]" />
                <div className="absolute bottom-2 left-2">
                  <Badge variant="tertiary" className="text-[10px] tracking-wider rounded-none bg-transparent">ЛЮКИ / КОЛЬЦА</Badge>
                </div>
              </div>
              <CardHeader className="pb-3 space-y-1">
                <CardTitle className="text-lg font-semibold tracking-wide text-neutral-900 heading">ПОЛИМЕР-ПЕСЧАНЫЕ ИЗДЕЛИЯ</CardTitle>
                <CardDescription className="text-sm tracking-wide text-neutral-600">Люки и опорные кольца для инженерных коммуникаций</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-2xl font-semibold text-neutral-900 leading-none">от 1 800₽</span>
                  <span className="text-xs text-neutral-500">/ШТ</span>
                </div>
                <Button asChild className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-none tracking-wide border border-neutral-800">
                  <Link href="/products?categories=MANHOLES&categories=SUPPORT_RINGS">Смотреть изделия</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          

          <div className="text-center mt-4">
            <Button asChild variant="outline" size="lg" className="rounded-none tracking-wide border-neutral-400 hover:bg-neutral-900 hover:text-white">
              <Link href="/products">Посмотреть всю продукцию</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
  <section className="py-16 bg-neutral-900 text-white border-t border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 heading">Нужна консультация?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Свяжитесь с нами для расчета стоимости
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-neutral-800 hover:bg-neutral-200 rounded-none tracking-wide">
              <a href={phoneTel ? `tel:${phoneTel}` : undefined} className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                Позвонить
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white text-neutral-800 hover:bg-neutral-200 rounded-none tracking-wide">
              <Link href="/contacts" className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                Написать
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
