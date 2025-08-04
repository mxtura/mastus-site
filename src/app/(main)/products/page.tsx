'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductImage from "@/components/ProductImage";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number | null;
  category: string;
  images: string[];
  size: string | null;
  load: string | null;
}

const categoryNames = {
  MANHOLES: 'Люки',
  SUPPORT_RINGS: 'Опорные кольца'
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние фильтрации
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [priceRange, setPriceRange] = useState<{ min: string, max: string }>({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Фильтрация и сортировка продуктов
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      // Фильтр по цене
      const productPrice = product.price || 0;
      const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
      const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
      const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;
      
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'ru');
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Продукция</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              ООО &quot;МАСТУС&quot; специализируется на производстве высококачественных 
              полимер-песчаных изделий для городских инженерных коммуникаций
            </p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Продукция</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            ООО &quot;МАСТУС&quot; специализируется на производстве высококачественных 
            полимер-песчаных изделий для городских инженерных коммуникаций
          </p>
        </div>

        {/* Панель фильтров */}
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-2xl shadow-lg border border-blue-100/50 mb-8 overflow-hidden">
          {/* Заголовок с кнопкой для мобильных */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.121A1 1 0 013 6.414V4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Фильтры и поиск</h2>
                  <p className="text-blue-100 text-sm">Найдите нужную продукцию</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.121A1 1 0 013 6.414V4z" />
                </svg>
                {showFilters ? 'Скрыть' : 'Показать'}
              </Button>
            </div>
          </div>

          {/* Фильтры */}
          <div className={`p-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Поиск */}
              <div className="space-y-2">
                <label htmlFor="search" className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  Поиск по названию
                </label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Введите название продукта..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/70 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
                />
              </div>

              {/* Категория */}
              <div className="space-y-2">
                <label htmlFor="category" className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  Категория
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white/70 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    <SelectItem value="MANHOLES">Люки</SelectItem>
                    <SelectItem value="SUPPORT_RINGS">Опорные кольца</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ценовой диапазон */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  Цена (₽)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="От"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full bg-white/70 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
                  />
                  <Input
                    type="number"
                    placeholder="До"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full bg-white/70 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
                  />
                </div>
              </div>

              {/* Сортировка */}
              <div className="space-y-2">
                <label htmlFor="sort" className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  </div>
                  Сортировка
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white/70 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20">
                    <SelectValue placeholder="Сортировать по" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">По названию</SelectItem>
                    <SelectItem value="price">По цене (возрастание)</SelectItem>
                    <SelectItem value="price-desc">По цене (убывание)</SelectItem>
                    <SelectItem value="category">По категории</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Статистика результатов и кнопка сброса */}
            <div className="mt-6 pt-6 border-t border-blue-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Найдено продуктов: <span className="text-blue-600 text-lg">{filteredAndSortedProducts.length}</span> из {products.length}
                  </p>
                  <p className="text-xs text-gray-500">Результаты обновляются автоматически</p>
                </div>
              </div>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSortBy('name');
                  setPriceRange({ min: '', max: '' });
                }}
                variant="outline"
                size="sm"
                className="whitespace-nowrap bg-white/80 hover:bg-white border-blue-300 text-blue-700 hover:text-blue-800 transition-all shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Сбросить фильтры
              </Button>
            </div>
          </div>
        </div>

        {/* Сетка продуктов */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="hover:shadow-lg transition-shadow duration-300 group cursor-pointer">
                <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <ProductImage
                      src={product.images[0]}
                      alt={product.name}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                      <div className="text-center text-blue-600">
                        <div className="w-16 h-16 mx-auto mb-3 bg-blue-200 rounded-full flex items-center justify-center">
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
                    <CardTitle className="text-lg leading-6 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </CardTitle>
                    <Badge variant="outline" className="flex-shrink-0">
                      {categoryNames[product.category as keyof typeof categoryNames]}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="space-y-2">
                    {/* Основные характеристики */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
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
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500">Цена:</span>
                        <span className="text-xl font-bold text-blue-600">
                          {product.price.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Пустое состояние */}
        {filteredAndSortedProducts.length === 0 && !loading && products.length > 0 && (
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
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSortBy('name');
                setPriceRange({ min: '', max: '' });
              }}
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
                <Link href="/info">
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
