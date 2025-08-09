"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ColorTestsIndex() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-bold text-xl text-gray-900">
              Тестирование цветовых палитр
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Вернуться на главную
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Выбор цветовой палитры для сайта МАСТУС
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Сравните три варианта цветовых палитр для демонстрации продукции МАСТУС: 
            полимер-песчаных изделий и алюминиевых лестниц. Каждый вариант показывает 
            различный подход к использованию фирменных цветов.
          </p>
        </div>

        {/* Color Variants Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Variant 1 */}
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="h-32" style={{ background: 'linear-gradient(135deg, #f9a31a 0%, #9d171e 100%)' }}></div>
            <CardHeader>
              <CardTitle className="text-xl">Вариант 1</CardTitle>
              <CardDescription className="text-base">
                Классический и надежный
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Основной фон:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: '#f9a31a' }}></div>
                    <span className="text-xs text-gray-500">#f9a31a</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Акценты:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: '#9d171e' }}></div>
                    <span className="text-xs text-gray-500">#9d171e</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Текст:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: '#000000' }}></div>
                    <span className="text-xs text-gray-500">#000000</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Использует оранжевый фон с красными акцентами, создавая теплый и надежный образ.
              </p>
              <Button asChild className="w-full" style={{ backgroundColor: '#9d171e' }}>
                <Link href="/color-tests/variant-1">
                  Посмотреть вариант
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Variant 2 */}
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="h-32" style={{ backgroundColor: '#ffffff', borderBottom: '4px solid #9d171e' }}></div>
            <CardHeader>
              <CardTitle className="text-xl">Вариант 2</CardTitle>
              <CardDescription className="text-base">
                Современный и минималистичный
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Основной фон:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: '#ffffff' }}></div>
                    <span className="text-xs text-gray-500">#ffffff</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Акценты:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: '#9d171e' }}></div>
                    <span className="text-xs text-gray-500">#9d171e</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Вторичный:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: '#f9a31a' }}></div>
                    <span className="text-xs text-gray-500">#f9a31a</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Чистый белый фон с красными акцентами и оранжевыми элементами для современного вида.
              </p>
              <Button asChild className="w-full" style={{ backgroundColor: '#9d171e' }}>
                <Link href="/color-tests/variant-2">
                  Посмотреть вариант
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Variant 3 */}
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="h-32" style={{ background: 'linear-gradient(135deg, #9d171e 0%, #f9a31a 100%)' }}></div>
            <CardHeader>
              <CardTitle className="text-xl">Вариант 3</CardTitle>
              <CardDescription className="text-base">
                Контрастный подход
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Основной:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: '#9d171e' }}></div>
                    <span className="text-xs text-gray-500">#9d171e</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Дополнительный:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: '#f9a31a' }}></div>
                    <span className="text-xs text-gray-500">#f9a31a</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Текст:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: '#000000' }}></div>
                    <span className="text-xs text-gray-500">#000000</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Высококонтрастный дизайн с динамичным использованием красного и оранжевого.
              </p>
              <Button asChild className="w-full" style={{ backgroundColor: '#f9a31a', color: '#000000' }}>
                <Link href="/color-tests/variant-3">
                  Посмотреть вариант
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Guide */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Руководство по выбору</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3" style={{ color: '#9d171e' }}>
                Классический (Вариант 1)
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Подходит для консервативной аудитории</li>
                <li>• Создает ощущение тепла и надежности</li>
                <li>• Оранжевый фон привлекает внимание</li>
                <li>• Хорошо подходит для B2B сегмента</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3" style={{ color: '#9d171e' }}>
                Современный (Вариант 2)
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Подходит для современной аудитории</li>
                <li>• Минималистичный и чистый дизайн</li>
                <li>• Отличная читаемость контента</li>
                <li>• Профессиональный вид</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3" style={{ color: '#f9a31a' }}>
                Контрастный (Вариант 3)
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Высококонтрастный и яркий</li>
                <li>• Создает динамичный образ</li>
                <li>• Выделяется среди конкурентов</li>
                <li>• Подходит для молодой аудитории</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
