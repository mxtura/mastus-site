import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              ООО &quot;МАСТУС&quot;
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Производство и продажа полимер-песчаных изделий
            </p>
            <p className="text-lg mb-10 text-blue-50 max-w-3xl mx-auto">
              Качественные люки и кольца опорные для инженерных коммуникаций. 
              Долговечность, надежность и доступная цена.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <Link href="/products">
                  Посмотреть продукцию
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link href="/contacts">
                  Связаться с нами
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Наша продукция</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Специализируемся на производстве качественных полимер-песчаных изделий 
              для городских коммуникаций
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Люки */}
            <Card className="overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <div className="text-gray-500 text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  </div>
                  <p className="text-sm">Изображение люка</p>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Люки полимер-песчаные
                  <Badge variant="secondary">750×60/95 мм</Badge>
                </CardTitle>
                <CardDescription>
                  Высококачественные люки для колодцев различного назначения
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>• Высокая прочность и долговечность</li>
                  <li>• Устойчивость к химическим воздействиям</li>
                  <li>• Не подвержены коррозии</li>
                  <li>• Легкий вес для удобства монтажа</li>
                </ul>
                <Button asChild variant="link" className="p-0 h-auto text-blue-600">
                  <Link href="/products#люки">
                    Подробнее →
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Кольца опорные */}
            <Card className="overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <div className="text-gray-500 text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                    </svg>
                  </div>
                  <p className="text-sm">Изображение кольца</p>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                  Кольца опорные полимер-песчаные
                  <div className="flex gap-1">
                    <Badge variant="outline">КО-6</Badge>
                    <Badge variant="outline">КО-7</Badge>
                  </div>
                </CardTitle>
                <CardDescription>
                  Опорные кольца для установки люков и создания надежной конструкции
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>• Точные геометрические размеры</li>
                  <li>• Экологически безопасные</li>
                  <li>• Стойкость к температурным перепадам</li>
                  <li>• Длительный срок службы</li>
                </ul>
                <Button asChild variant="link" className="p-0 h-auto text-blue-600">
                  <Link href="/products#кольца">
                    Подробнее →
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Почему выбирают нас</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H6V1H8V3H16V1H18V3H19M19,19V8H5V19H19M9,14H7V16H9V14M13,14H11V16H13V14M17,14H15V16H17V14"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Быстрая поставка</h3>
                <p className="text-gray-600">
                  Оперативное выполнение заказов и доставка по всей России
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Гарантия качества</h3>
                <p className="text-gray-600">
                  Вся продукция соответствует ГОСТ и имеет сертификаты качества
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Выгодная цена</h3>
                <p className="text-gray-600">
                  Конкурентоспособные цены от производителя без посредников
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Готовы сделать заказ?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Свяжитесь с нами для расчета стоимости и консультации
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <a href="tel:+7">
                Позвонить
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/contacts">
                Написать нам
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
