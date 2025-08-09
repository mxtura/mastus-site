"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

export default function ColorVariant3() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Загружаем Google Fonts для варианта 3 - контрастный стиль
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Lato:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Lato, sans-serif' }}>
      {/* Navigation */}
      <nav className="bg-white border-b-2" style={{ borderBottomColor: '#f9a31a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-bold text-xl" style={{ color: '#f9a31a' }}>
              МАСТУС - Вариант 3
            </div>
            <div className="flex space-x-6">
              <Link href="/color-tests" className="hover:underline" style={{ color: '#9d171e' }}>← Назад к выбору</Link>
              <Link href="/color-tests/variant-1" className="hover:underline" style={{ color: '#9d171e' }}>Вариант 1</Link>
              <Link href="/color-tests/variant-2" className="hover:underline" style={{ color: '#9d171e' }}>Вариант 2</Link>
              <Link href="/color-tests/variant-3" className="hover:underline font-semibold" style={{ color: '#f9a31a' }}>Вариант 3</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-white py-16" style={{ backgroundColor: '#9d171e' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-3xl sm:text-4xl font-semibold mb-4" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              ООО ФИРМА&quot;МАСТУС&quot;
            </h1>
            <p className="text-lg mb-3" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: '500' }}>
              Вариант 3: Контрастный подход
            </p>
            <p className="text-base mb-8 opacity-90">
              Полимер-песчаные изделия и алюминиевые лестницы
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <Button 
                className="w-full sm:w-auto text-black font-medium px-6 py-2"
                style={{ backgroundColor: '#f9a31a' }}
              >
                Продукция
              </Button>
              <Button 
                variant="outline"
                className="w-full sm:w-auto font-medium px-6 py-2"
                style={{ 
                  borderColor: 'white', 
                  color: 'white',
                  backgroundColor: 'transparent'
                }}
              >
                Контакты
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Color Palette Info */}
      <section className="py-12" style={{ backgroundColor: '#F8F8F8' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#9d171e', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Цветовая палитра - Вариант 3
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-lg mb-3 shadow-lg" style={{ backgroundColor: '#9d171e' }}></div>
              <p className="text-sm font-semibold" style={{ color: '#000000' }}>Основной</p>
              <p className="text-xs" style={{ color: '#000000' }}>#9d171e</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-lg mb-3 shadow-lg" style={{ backgroundColor: '#f9a31a' }}></div>
              <p className="text-sm font-semibold" style={{ color: '#000000' }}>Контрастный</p>
              <p className="text-xs" style={{ color: '#000000' }}>#f9a31a</p>
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
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#9d171e', fontFamily: 'Oswald, sans-serif' }}>ТИПОГРАФИКА</h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h4 className="font-semibold mb-2" style={{ fontFamily: 'Oswald, sans-serif', color: '#000000', textTransform: 'uppercase' }}>Заголовки</h4>
                <p className="text-sm text-gray-600">Oswald</p>
                <p className="text-xs text-gray-500">Мощный condensed для контраста</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h4 className="font-semibold mb-2" style={{ fontFamily: 'Lato, sans-serif', color: '#000000' }}>Основной текст</h4>
                <p className="text-sm text-gray-600">Lato</p>
                <p className="text-xs text-gray-500">Гуманистический sans-serif для баланса</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#9d171e', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Наша продукция
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#000000' }}>
              Полимер-песчаные изделия для инженерных коммуникаций
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Лестницы */}
            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all bg-white border">
              <div className="h-40 flex items-center justify-center" style={{ backgroundColor: '#FFF3E0' }}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center shadow-sm bg-white border">
                    <svg className="w-6 h-6" fill="#f9a31a" viewBox="0 0 24 24">
                      <path d="M4,21V3H6V5H7V3H9V5H10V3H12V5H13V3H15V5H16V3H18V5H19V3H21V21H19V19H18V21H16V19H15V21H13V19H12V21H10V19H9V21H7V19H6V21H4M6,7V9H18V7H6M6,11V13H18V11H6M6,15V17H18V15H6Z"/>
                    </svg>
                  </div>
                  <Badge variant="secondary" className="text-xs" style={{ backgroundColor: '#f9a31a', color: 'black' }}>1-3 секции</Badge>
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
            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all bg-white border">
              <div className="h-40 flex items-center justify-center" style={{ backgroundColor: '#FFF3E0' }}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center shadow-sm bg-white border">
                    <svg className="w-6 h-6" fill="#9d171e" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  </div>
                  <Badge variant="secondary" className="text-xs" style={{ backgroundColor: '#9d171e', color: 'white' }}>Люки и кольца</Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold" style={{ color: '#000000' }}>Полимер-песчаные изделия</CardTitle>
                <CardDescription style={{ color: '#666666' }}>
                  Люки и опорные кольца для инженерных коммуникаций
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-3">
                  <span className="text-xl font-bold" style={{ color: '#000000' }}>от 1 800₽</span>
                  <span className="text-sm ml-2" style={{ color: '#666666' }}>/шт</span>
                </div>
                <Button className="w-full text-black font-medium" style={{ backgroundColor: '#f9a31a' }}>
                  Подробнее
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section with Alert */}
      <section className="py-16" style={{ backgroundColor: '#FFF8E1' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg p-6 border-l-4" style={{ backgroundColor: '#FFECB3', borderLeftColor: '#B71C1C' }}>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#B71C1C' }}>
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg" style={{ color: '#B71C1C' }}>Важная информация</h3>
                <p style={{ color: '#333333' }}>
                  Этот вариант использует яркие цвета для создания энергичного и динамичного впечатления.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-white" style={{ backgroundColor: '#9d171e' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Получить консультацию</h2>
          <p className="text-lg mb-8 opacity-90">
            Свяжитесь с нашими специалистами для подбора подходящих изделий
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              className="w-full sm:w-auto text-black font-medium px-6 py-2"
              style={{ backgroundColor: '#f9a31a' }}
            >
              Заказать звонок
            </Button>
            <Button 
              variant="outline"
              className="w-full sm:w-auto font-medium px-6 py-2"
              style={{ 
                borderColor: 'white', 
                color: 'white',
                backgroundColor: 'transparent'
              }}
            >
              Каталог продукции
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
