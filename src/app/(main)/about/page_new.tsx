import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function About() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">О компании</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            ООО &quot;МАСТУС&quot; - надежный производитель полимер-песчаных изделий 
            для инженерных коммуникаций с многолетним опытом работы
          </p>
        </div>

        {/* О компании */}
        <section className="mb-16">
          <Card className="overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-8">
              <CardContent className="p-8">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-3xl">
                    ООО &quot;МАСТУС&quot;
                  </CardTitle>
                </CardHeader>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Наша компания специализируется на производстве и поставке качественных 
                    полимер-песчаных изделий для городских инженерных коммуникаций. 
                    Мы предлагаем современные решения для обустройства колодцев различного назначения.
                  </p>
                  <p>
                    Основными направлениями нашей деятельности являются производство 
                    полимер-песчаных люков размером 750×60/95 мм и опорных колец КО-6/КО-7. 
                    Вся продукция изготавливается из высококачественных материалов с соблюдением 
                    всех технологических требований и стандартов качества.
                  </p>
                  <p>
                    Мы работаем как с крупными строительными и коммунальными организациями, 
                    так и с частными заказчиками, предлагая индивидуальный подход к каждому клиенту 
                    и гибкие условия сотрудничества.
                  </p>
                </div>
              </CardContent>
              
              <div className="bg-blue-50 p-8 flex items-center justify-center">
                <div className="text-center text-blue-600">
                  <div className="w-32 h-32 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,7V3H2V21H22V7H12M6,19H4V17H6V19M6,15H4V13H6V15M6,11H4V9H6V11M6,7H4V5H6V7M10,19H8V17H10V19M10,15H8V13H10V15M10,11H8V9H10V11M10,7H8V5H10V7M20,19H12V17H20V19M20,15H12V13H20V15M20,11H12V9H20V11Z"/>
                    </svg>
                  </div>
                  <p className="text-lg font-medium">Производственный комплекс</p>
                  <p className="text-sm text-blue-500 mt-2">
                    Современное оборудование и технологии
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Наши преимущества */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Наши преимущества</h2>
            <p className="text-lg text-gray-600">
              Что делает нас надежным партнером в сфере производства полимер-песчаных изделий
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
                  </svg>
                </div>
                <CardTitle className="text-xl mb-2">Опыт и экспертиза</CardTitle>
                <CardDescription>
                  Многолетний опыт работы в сфере производства изделий для коммунальной инфраструктуры
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>
                  </svg>
                </div>
                <CardTitle className="text-xl mb-2">Контроль качества</CardTitle>
                <CardDescription>
                  Строгий контроль качества на всех этапах производства, соответствие ГОСТ
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                  </svg>
                </div>
                <CardTitle className="text-xl mb-2">Техническая поддержка</CardTitle>
                <CardDescription>
                  Профессиональные консультации по выбору и применению нашей продукции
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.98C19.47,12.66 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11.02L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11.02C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.98Z"/>
                  </svg>
                </div>
                <CardTitle className="text-xl mb-2">Современное производство</CardTitle>
                <CardDescription>
                  Использование передовых технологий и современного оборудования
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H6V1H8V3H16V1H18V3H19M19,19V8H5V19H19M9,14H7V16H9V14M13,14H11V16H13V14M17,14H15V16H17V14"/>
                  </svg>
                </div>
                <CardTitle className="text-xl mb-2">Сроки поставки</CardTitle>
                <CardDescription>
                  Соблюдение сроков изготовления и поставки продукции заказчикам
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
                  </svg>
                </div>
                <CardTitle className="text-xl mb-2">Конкурентные цены</CardTitle>
                <CardDescription>
                  Оптимальное соотношение цены и качества, прямые поставки от производителя
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-16" />

        {/* Статистика */}
        <section className="mb-16">
          <Card className="p-8">
            <CardHeader className="text-center mb-8">
              <CardTitle className="text-3xl mb-4">Наши достижения</CardTitle>
              <CardDescription className="text-lg">
                Цифры, которые говорят о нашем профессионализме
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">5+</div>
                  <div className="text-gray-600">лет на рынке</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">1000+</div>
                  <div className="text-gray-600">выполненных заказов</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-yellow-600 mb-2">50+</div>
                  <div className="text-gray-600">постоянных клиентов</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
                  <div className="text-gray-600">качественная продукция</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Призыв к действию */}
        <section className="text-center">
          <Card className="p-8">
            <CardHeader>
              <CardTitle className="text-2xl mb-4">Готовы начать сотрудничество?</CardTitle>
              <CardDescription className="text-lg mb-6">
                Свяжитесь с нами для получения подробной информации о продукции и условиях поставки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/contacts">Связаться с нами</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/products">Смотреть продукцию</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
