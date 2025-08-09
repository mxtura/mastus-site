import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">О компании</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            ООО &quot;МАСТУС&quot; - надежный производитель полимер-песчаных изделий 
            и алюминиевых лестниц с многолетним опытом работы
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
                    полимер-песчаных изделий для городских инженерных коммуникаций, а также 
                    профессиональных алюминиевых лестниц. Мы предлагаем современные решения 
                    для обустройства колодцев различного назначения и выполнения высотных работ.
                  </p>
                  <p>
                    Основными направлениями нашей деятельности являются производство 
                    полимер-песчаных люков, опорных колец и широкий ассортимент алюминиевых лестниц 
                    (односекционные, двухсекционные и трехсекционные). Вся продукция изготавливается 
                    из высококачественных материалов с соблюдением всех технологических требований 
                    и стандартов качества.
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Опыт и экспертиза</h3>
                <p className="text-gray-600">
                  Многолетний опыт работы в сфере производства изделий для коммунальной инфраструктуры
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Контроль качества</h3>
                <p className="text-gray-600">
                  Строгий контроль качества на всех этапах производства, соответствие ГОСТ
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Техническая поддержка</h3>
                <p className="text-gray-600">
                  Консультации по выбору продукции, технические рекомендации по монтажу
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34 7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78 2.46,14.63L4.57,12.97L4.5,12L4.57,11L2.46,9.37C2.27,9.22 2.21,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66 8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66 16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05 19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22 21.54,9.37L19.43,11L19.5,12L19.43,13L21.54,14.63C21.73,14.78 21.79,15.05 21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04 19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68 14.87,18.93L14.5,21.58C14.46,21.82 14.25,22 14,22H10M11.25,4L10.88,6.61C9.68,6.86 8.62,7.5 7.85,8.39L5.44,7.35L4.69,8.65L6.8,10.2C6.4,11.37 6.4,12.64 6.8,13.8L4.68,15.36L5.43,16.66L7.86,15.62C8.63,16.5 9.68,17.14 10.87,17.38L11.24,20H12.76L13.13,17.39C14.32,17.14 15.37,16.5 16.14,15.62L18.57,16.66L19.32,15.36L17.2,13.81C17.6,12.64 17.6,11.37 17.2,10.2L19.31,8.65L18.56,7.35L16.15,8.39C15.38,7.5 14.32,6.86 13.12,6.61L12.75,4H11.25Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Индивидуальный подход</h3>
                <p className="text-gray-600">
                  Гибкие условия сотрудничества, индивидуальные решения для каждого заказчика
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3,1V7C3,8.11 3.89,9 5,9H9V21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V9H19C20.11,9 21,8.11 21,7V1H3M5,3H19V7H15A1,1 0 0,0 14,8V20H10V8A1,1 0 0,0 9,7H5V3Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Оперативность</h3>
                <p className="text-gray-600">
                  Быстрое выполнение заказов, налаженная логистика, своевременная доставка
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Конкурентные цены</h3>
                <p className="text-gray-600">
                  Прямые поставки от производителя, оптимальное соотношение цены и качества
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Производство */}
        <section className="mb-16">
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Наше производство</h2>
              <p className="text-lg text-gray-600">
                Современные технологии и оборудование для производства качественной продукции
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Технологический процесс</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</span>
                    <span>Подготовка и дозирование сырья по точной рецептуре</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</span>
                    <span>Смешивание полимера с наполнителем в специальных смесителях</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</span>
                    <span>Формование изделий под высоким давлением и температурой</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">4</span>
                    <span>Контроль качества и испытания готовой продукции</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">5</span>
                    <span>Упаковка и подготовка к отправке</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Контроль качества</h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Входной контроль сырья и материалов</li>
                  <li>• Контроль технологических параметров производства</li>
                  <li>• Испытания механических свойств изделий</li>
                  <li>• Проверка геометрических размеров</li>
                  <li>• Визуальный контроль внешнего вида</li>
                  <li>• Испытания на морозостойкость и химическую стойкость</li>
                  <li>• Ведение протоколов испытаний</li>
                  <li>• Сертификация готовой продукции</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Партнеры и клиенты */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Наши клиенты</h2>
            <p className="text-lg text-gray-600">
              Нам доверяют ведущие строительные и коммунальные организации
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,7V3H2V21H22V7H12M6,19H4V17H6V19M6,15H4V13H6V15M6,11H4V9H6V11M6,7H4V5H6V7M10,19H8V17H10V19M10,15H8V13H10V15M10,11H8V9H10V11M10,7H8V5H10V7M20,19H12V17H20V19M20,15H12V13H20V15M20,11H12V9H20V11Z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Строительные компании</h3>
              <p className="text-gray-600 text-sm">
                Крупные застройщики и строительные организации для жилищного и промышленного строительства
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Муниципальные службы</h3>
              <p className="text-gray-600 text-sm">
                Городские коммунальные службы, управляющие компании, службы благоустройства
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Торговые организации</h3>
              <p className="text-gray-600 text-sm">
                Дилеры и дистрибуторы строительных материалов по всей России
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Станьте нашим партнером</h2>
          <p className="text-xl mb-8 text-blue-100">
            Получите качественную продукцию и надежное партнерство на долгие годы
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/products" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Посмотреть продукцию
            </Link>
            <Link 
              href="/contacts" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Связаться с нами
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
