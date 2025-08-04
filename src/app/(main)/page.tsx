"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const products = [
    { id: 1, name: 'Люк стандартный', price: '2 500₽', category: 'luks', status: 'В наличии', description: 'Полимер-песчаный люк для колодцев водоснабжения', size: '750×60 мм', color: 'blue' },
    { id: 2, name: 'Люк усиленный', price: '3 200₽', category: 'luks', status: 'В наличии', description: 'Усиленный люк повышенной прочности', size: '750×95 мм', color: 'blue' },
    { id: 3, name: 'Кольцо опорное КО-6', price: '1 800₽', category: 'kolca', status: 'В наличии', description: 'Опорное кольцо диаметром 600 мм', size: 'КО-6', color: 'green' },
    { id: 4, name: 'Кольцо опорное КО-7', price: '2 100₽', category: 'kolca', status: 'В наличии', description: 'Опорное кольцо диаметром 700 мм', size: 'КО-7', color: 'green' },
    { id: 5, name: 'Люк телефонный', price: '2 700₽', category: 'luks', status: 'Под заказ', description: 'Специализированный люк для телефонных колодцев', size: '750×60 мм', color: 'purple' },
    { id: 6, name: 'Комплект люк + кольцо', price: '3 650₽', category: 'komplekt', status: 'В наличии', description: 'Готовое решение: люк стандартный + кольцо КО-6', size: 'Люк + Кольцо', color: 'orange', originalPrice: '4 300₽' }
  ];

  const filteredProducts = activeFilter === 'all' 
    ? products 
    : products.filter(product => product.category === activeFilter);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 lg:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              ООО &quot;МАСТУС&quot;
            </h1>
            
            <p className="text-xl sm:text-2xl mb-8 text-blue-100 font-light">
              Производство полимер-песчаных изделий
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto sm:max-w-none">
              <Button asChild size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 shadow-lg transition-all">
                <Link href="/products">
                  Продукция
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-blue-600 shadow-lg transition-all">
                <Link href="/contacts">
                  Контакты
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#f9fafb" d="M0,64L48,69.3C96,75,192,85,288,85.3C384,85,480,75,576,64C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Наша продукция
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Полимер-песчаные изделия для инженерных коммуникаций
            </p>
          </div>

          {/* Filter */}
          <div className="flex justify-center mb-12">
            <div className="flex flex-wrap gap-3 bg-white rounded-xl p-2 shadow-md">
              <button 
                onClick={() => setActiveFilter('all')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeFilter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Все товары
              </button>
              <button 
                onClick={() => setActiveFilter('luks')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeFilter === 'luks' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Люки
              </button>
              <button 
                onClick={() => setActiveFilter('kolca')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeFilter === 'kolca' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Кольца
              </button>
              <button 
                onClick={() => setActiveFilter('komplekt')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeFilter === 'komplekt' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Комплекты
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden shadow-md hover:shadow-lg transition-all">
                <div className={`h-48 bg-gradient-to-br from-${product.color}-50 to-${product.color}-100 flex items-center justify-center relative`}>
                  {product.originalPrice && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-red-500">-15%</Badge>
                    </div>
                  )}
                  {product.category === 'komplekt' && !product.originalPrice && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-orange-500">Комплект</Badge>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full flex items-center justify-center shadow-lg">
                      {product.category === 'luks' && (
                        <svg className={`w-8 h-8 text-${product.color}-600`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                        </svg>
                      )}
                      {product.category === 'kolca' && (
                        <svg className={`w-8 h-8 text-${product.color}-600`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6"/>
                        </svg>
                      )}
                      {product.category === 'komplekt' && (
                        <svg className={`w-8 h-8 text-${product.color}-600`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19,7H18V6A2,2 0 0,0 16,4H8A2,2 0 0,0 6,6V7H5A1,1 0 0,0 4,8V19A3,3 0 0,0 7,22H17A3,3 0 0,0 20,19V8A1,1 0 0,0 19,7M8,6H16V7H8V6M18,19A1,1 0 0,1 17,20H7A1,1 0 0,1 6,19V9H18V19Z"/>
                        </svg>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">{product.size}</Badge>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {product.originalPrice && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold text-gray-500 line-through">{product.originalPrice}</span>
                      <Badge className="bg-red-500">-15%</Badge>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-gray-900">{product.price}</span>
                    <Badge variant="outline" className={
                      product.status === 'В наличии' 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }>
                      {product.status}
                    </Badge>
                  </div>
                  <Button asChild size="sm" className={`w-full ${
                    product.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                    product.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                    product.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}>
                    <Link href={`/products/${product.id}`}>Подробнее</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/products">
                Посмотреть всю продукцию
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Нужна консультация?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Свяжитесь с нами для расчета стоимости
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <a href="tel:+7" className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                Позвонить
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600">
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
