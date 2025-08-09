"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

export default function ColorVariant1() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Загружаем Google Fonts для варианта 1 - современный стиль
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Open Sans, sans-serif' }}>
      {/* Navigation */}
      <nav className="bg-white border-b-2" style={{ borderBottomColor: '#9d171e' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-bold text-xl" style={{ color: '#9d171e' }}>
              МАСТУС - Вариант 1
            </div>
            <div className="flex space-x-6">
              <Link href="/color-tests" className="hover:underline" style={{ color: '#000000' }}>← Назад к выбору</Link>
              <Link href="/color-tests/variant-1" className="hover:underline font-semibold" style={{ color: '#9d171e' }}>Вариант 1</Link>
              <Link href="/color-tests/variant-2" className="hover:underline" style={{ color: '#000000' }}>Вариант 2</Link>
              <Link href="/color-tests/variant-3" className="hover:underline" style={{ color: '#000000' }}>Вариант 3</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative text-white py-16 lg:py-24 overflow-hidden" style={{ backgroundColor: '#f9a31a' }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              ООО ФИРМА&quot;МАСТУС&quot;
            </h1>
            <p className="text-lg sm:text-xl mb-2 opacity-90 font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Вариант 1: Современный и надежный
            </p>
            <p className="text-base mb-8 opacity-80">
              Полимер-песчаные изделия и алюминиевые лестницы
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto text-white shadow-sm transition-all font-semibold"
                style={{ backgroundColor: '#9d171e' }}
              >
                Продукция
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-2 border-white text-white hover:bg-white shadow-sm transition-all font-semibold"
                style={{ borderColor: 'white', color: 'white' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#000000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'white';
                }}
              >
                Контакты
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Color Palette Info */}
      <section className="py-12" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#9d171e', fontFamily: 'Montserrat, sans-serif' }}>
            Цветовая палитра - Вариант 1
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-lg mb-3 shadow-lg" style={{ backgroundColor: '#f9a31a' }}></div>
              <p className="text-sm font-semibold" style={{ color: '#000000' }}>Основной фон</p>
              <p className="text-xs" style={{ color: '#000000' }}>#f9a31a</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-lg mb-3 shadow-lg" style={{ backgroundColor: '#9d171e' }}></div>
              <p className="text-sm font-semibold" style={{ color: '#000000' }}>Акценты</p>
              <p className="text-xs" style={{ color: '#000000' }}>#9d171e</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-lg mb-3 shadow-lg" style={{ backgroundColor: '#000000' }}></div>
              <p className="text-sm font-semibold" style={{ color: '#000000' }}>Текст</p>
              <p className="text-xs" style={{ color: '#000000' }}>#000000</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-lg mb-3 shadow-lg border-2 border-gray-300" style={{ backgroundColor: '#ffffff' }}></div>
              <p className="text-sm font-semibold" style={{ color: '#000000' }}>Белый фон</p>
              <p className="text-xs" style={{ color: '#000000' }}>#ffffff</p>
            </div>
          </div>
          
          {/* Typography Info */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#9d171e', fontFamily: 'Montserrat, sans-serif' }}>Типографика</h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h4 className="font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif', color: '#000000' }}>Заголовки</h4>
                <p className="text-sm text-gray-600">Montserrat</p>
                <p className="text-xs text-gray-500">Современный геометрический sans-serif</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h4 className="font-semibold mb-2" style={{ fontFamily: 'Open Sans, sans-serif', color: '#000000' }}>Основной текст</h4>
                <p className="text-sm text-gray-600">Open Sans</p>
                <p className="text-xs text-gray-500">Читаемый гуманистический sans-serif</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#D82C2C' }}>
              Наша продукция
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#333333' }}>
              Полимер-песчаные изделия для инженерных коммуникаций
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Лестницы */}
            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all border">
              <div className="h-40 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-white rounded-lg flex items-center justify-center shadow-sm border">
                    <svg className="w-6 h-6" fill="#f9a31a" viewBox="0 0 24 24">
                      <path d="M4,21V3H6V5H7V3H9V5H10V3H12V5H13V3H15V5H16V3H18V5H19V3H21V21H19V19H18V21H16V19H15V21H13V19H12V21H10V19H9V21H7V19H6V21H4M6,7V9H18V7H6M6,11V13H18V11H6M6,15V17H18V15H6Z"/>
                    </svg>
                  </div>
                  <Badge variant="secondary" className="text-xs text-white" style={{ backgroundColor: '#9d171e' }}>1-3 секции</Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold" style={{ color: '#000000' }}>Алюминиевые лестницы</CardTitle>
                <CardDescription style={{ color: '#666666' }}>
                  Профессиональные лестницы из алюминиевого сплава для любых задач
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-3">
                  <span className="text-xl font-bold" style={{ color: '#000000' }}>от 6 200₽</span>
                  <span className="text-sm ml-2" style={{ color: '#666666' }}>/шт</span>
                </div>
                <Button className="w-full text-white font-medium" style={{ backgroundColor: '#9d171e' }}>
                  Подробнее
                </Button>
              </CardContent>
            </Card>

            {/* Полимер-песчаные изделия */}
            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all border">
              <div className="h-40 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-white rounded-lg flex items-center justify-center shadow-sm border">
                    <svg className="w-6 h-6" fill="#9d171e" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  </div>
                  <Badge variant="secondary" className="text-xs text-white" style={{ backgroundColor: '#f9a31a' }}>Люки и кольца</Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold" style={{ color: '#333333' }}>Полимер-песчаные изделия</CardTitle>
                <CardDescription style={{ color: '#666666' }}>
                  Люки и опорные кольца для инженерных коммуникаций
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-3">
                  <span className="text-xl font-bold" style={{ color: '#333333' }}>от 1 800₽</span>
                  <span className="text-sm ml-2" style={{ color: '#666666' }}>/шт</span>
                </div>
                <Button className="w-full text-white font-medium" style={{ backgroundColor: '#9d171e' }}>
                  Подробнее
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 text-white" style={{ backgroundColor: '#D82C2C' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Консультация специалиста</h2>
          <p className="text-base mb-6 opacity-90">
            Получите профессиональную консультацию по выбору продукции
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Button 
              size="default" 
              className="bg-white text-gray-900 hover:bg-gray-100 shadow-sm transition-all font-medium"
            >
              Связаться с нами
            </Button>
            <Button 
              size="default" 
              className="border border-white text-white hover:bg-white hover:text-gray-900 shadow-sm transition-all font-medium"
              style={{ backgroundColor: 'transparent' }}
            >
              Заказать звонок
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
