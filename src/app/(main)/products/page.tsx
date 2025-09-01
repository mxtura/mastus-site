"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FilterPanel } from '@/components/ui/FilterPanel';
import { productFilterConfigs, initialProductFilters, ProductFilters } from '@/components/filters/product-filter-config';
import { applyProductFilters, Product as ProductType } from '@/components/filters/filter-utils';
import ProductImage from '@/components/ProductImage';

const categoryNames = {
  MANHOLES: 'Люки',
  SUPPORT_RINGS: 'Опорные кольца',
  LADDERS: 'Лестницы'
};

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  // Инициализируем фильтры с учётом query
  const [filters, setFilters] = useState<ProductFilters>(() => {
    const categoriesParam = searchParams?.getAll('categories');
    const catSingle = searchParams?.get('categories');
    const fromQuery = categoriesParam && categoriesParam.length
      ? categoriesParam
      : (catSingle ? catSingle.split(',') : undefined);

    if (fromQuery && fromQuery.length) {
      return { ...initialProductFilters, categories: fromQuery as string[] };
    }
    return initialProductFilters;
  });

  // Синхронизируем смену query после монтирования (на случай client nav)
  useEffect(() => {
    const catSingle = searchParams?.get('categories');
    const categoriesParam = searchParams?.getAll('categories');
    const fromQuery = categoriesParam && categoriesParam.length
      ? categoriesParam
      : (catSingle ? catSingle.split(',') : undefined);
    if (fromQuery) {
      setFilters(prev => ({ ...prev, categories: fromQuery as string[] }));
    }
  }, [searchParams]);

  useEffect(() => {
    let aborted = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        if (!aborted) setProducts(data || []);
      } catch (e) {
        if (!aborted) setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    load();
    return () => { aborted = true; };
  }, []);

  const filtered = useMemo(() => applyProductFilters(products, filters), [products, filters]);

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Продукция</h1>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Продукция</h1>
          </div>
          
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
            <p className="text-gray-600 max-w-sm mx-auto mb-4">
              Не удалось загрузить список продуктов: {error}
            </p>
            <Button onClick={() => window.location.reload()}>
              Попробовать снова
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 heading">Продукция</h1>
        </div>

        {/* Панель фильтров (универсальная) */}
        <div className="mb-10">
          <FilterPanel
            title="Фильтры и поиск"
            filters={filters}
            onFiltersChange={setFilters}
            filterConfigs={productFilterConfigs}
            resultsCount={filtered.length}
            totalCount={products.length}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(v => !v)}
          />
        </div>

        {/* Сетка продуктов */}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filtered.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-300 group cursor-pointer h-full flex flex-col">
        <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden flex items-center justify-center p-2">
                  {product.images && product.images.length > 0 ? (
                    <ProductImage
                      src={product.images[0]}
                      alt={product.name}
                      width={400}
                      height={225}
          className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--primary)]/5">
                      <div className="text-center text-[var(--primary)]">
                        <div className="w-16 h-16 mx-auto mb-3 bg-[var(--primary)]/20 rounded-none flex items-center justify-center border border-[var(--primary)]/30">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/>
                          </svg>
                        </div>
                        <p className="text-sm font-medium">{categoryNames[product.category as keyof typeof categoryNames]}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-6 group-hover:text-[var(--primary)] transition-colors heading">
                      {product.name}
                    </CardTitle>
                    <Badge variant="tertiary" className="flex-shrink-0">
                      {categoryNames[product.category as keyof typeof categoryNames]}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 flex-1 flex flex-col">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  {/* Основные характеристики (reserved space) */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4 min-h-[68px]">
                    {product.size && (
                      <div>
                        <span className="font-medium">Размер:</span>
                        <br />
                        <span>{product.size}</span>
                      </div>
                    )}
                    {product.load && (
                      <div>
                        <span className="font-medium">Нагрузка:</span>
                        <br />
                        <span>{product.load}</span>
                      </div>
                    )}
                  </div>
                  {/* Цена */}
                  {product.price && (
                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm text-gray-500">Цена:</span>
                      <span className="text-xl font-bold text-[var(--primary)]">
                        {product.price.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Пустое состояние */}
  {filtered.length === 0 && !loading && products.length > 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Ничего не найдено</h3>
            <p className="text-gray-600 max-w-sm mx-auto mb-4">
              Попробуйте изменить параметры поиска или фильтры
            </p>
            <Button 
              onClick={() => setFilters(initialProductFilters)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Сбросить фильтры
            </Button>
          </div>
        )}

        {/* Пустое состояние - нет продуктов вообще */}
        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Продукция не найдена</h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              В данный момент нет доступных продуктов для отображения
            </p>
          </div>
        )}

        {/* Заказать консультацию */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Не нашли подходящий продукт?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Свяжитесь с нами для получения индивидуального предложения 
              или консультации по выбору оптимального решения
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/contacts">
                  Получить консультацию
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/about">
                  Узнать больше о компании
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-12 text-center">Загрузка...</div>}>
      <ProductsPageInner />
    </Suspense>
  );
}
