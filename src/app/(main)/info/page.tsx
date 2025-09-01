import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Info() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 heading tracking-wide">ПОЛЕЗНАЯ ИНФОРМАЦИЯ</h1>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            Техническая информация о полимер-песчаных изделиях, их применении и преимуществах
          </p>
        </div>

        {/* О полимер-песчаных изделиях */}
        <section className="mb-20">
          <Card className="p-10 border-neutral-300 bg-neutral-50 rounded-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl font-semibold tracking-wide text-neutral-900 mb-6">ЧТО ТАКОЕ ПОЛИМЕР-ПЕСЧАНЫЕ ИЗДЕЛИЯ?</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4 text-neutral-700 leading-relaxed">
                  <p>
                    Полимер-песчаные изделия — это композитные материалы, изготовленные из смеси 
                    полимерного связующего (обычно полиэтилен или полипропилен) и песка в качестве наполнителя.
                  </p>
                  <p>
                    Такая комбинация обеспечивает уникальные свойства: высокую прочность, долговечность, 
                    устойчивость к агрессивным средам и при этом относительно небольшой вес по сравнению 
                    с традиционными материалами.
                  </p>
                  <p>
                    Технология производства включает смешивание компонентов при высокой температуре 
                    и последующее формование под давлением, что обеспечивает однородность структуры 
                    и высокое качество готовых изделий.
                  </p>
                </div>
        <Card className="bg-white border border-neutral-300 p-6 rounded-none">
                  <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-semibold tracking-wide text-neutral-900 mb-4">СОСТАВ МАТЕРИАЛА</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0">
          <ul className="space-y-2 text-neutral-700 text-sm">
                  <li><strong>75-80%</strong> - кварцевый песок (наполнитель)</li>
                  <li><strong>20-25%</strong> - полимерное связующее</li>
                  <li><strong>1-2%</strong> - красители и модификаторы</li>
                </ul>
                
        <h3 className="text-lg font-semibold tracking-wide text-neutral-900 mb-4 mt-6">ОСНОВНЫЕ СВОЙСТВА</h3>
          <ul className="space-y-2 text-neutral-700 text-sm">
                      <li>• Плотность: 1,6-1,8 г/см³</li>
                      <li>• Прочность на сжатие: до 50 МПа</li>
                      <li>• Водопоглощение: менее 0,1%</li>
                      <li>• Морозостойкость: более 300 циклов</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Преимущества перед другими материалами */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Сравнение с традиционными материалами
            </h2>
          </div>
          
          <div className="overflow-x-auto border border-neutral-300 rounded-none">
            <table className="w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Характеристика
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Полимер-песчаные
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Чугунные
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Железобетонные
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Вес</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">45-65 кг ✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">120-150 кг</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">80-120 кг</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Коррозия</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">Не подвержены ✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">Подвержены</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">Частично</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Срок службы</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">50+ лет ✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">25-30 лет</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">20-25 лет</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Стоимость</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">Средняя ✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">Высокая</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">Низкая</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Кража</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">Минимальный риск ✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">Высокий риск</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">Низкий риск</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Монтаж</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">Простой ✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">Сложный</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">Средний</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Области применения */}
        <section className="mb-16">
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Области применения</h2>
              <p className="text-lg text-gray-600">
                Где используются полимер-песчаные люки и кольца опорные
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2C15.31,2 18,4.66 18,7.95C18,12.41 12,19 12,19C12,19 6,12.41 6,7.95C6,4.66 8.69,2 12,2M12,6A2,2 0 0,0 10,8A2,2 0 0,0 12,10A2,2 0 0,0 14,8A2,2 0 0,0 12,6M20,19C20,21.21 16.42,23 12,23C7.58,23 4,21.21 4,19C4,17.71 5.22,16.56 7.11,15.94L7.75,16.74C6.67,17.19 6,17.81 6,18.5C6,19.88 8.69,21 12,21C15.31,21 18,19.88 18,18.5C18,17.81 17.33,17.19 16.25,16.74L16.89,15.94C18.78,16.56 20,17.71 20,19Z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Водопроводные сети</h3>
                <p className="text-gray-600 text-sm">
                  Люки для доступа к водопроводным коммуникациям, запорной арматуре, счетчикам
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V5H19V19Z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Канализационные системы</h3>
                <p className="text-gray-600 text-sm">
                  Закрытие смотровых и ревизионных колодцев канализационных сетей
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Электрические сети</h3>
                <p className="text-gray-600 text-sm">
                  Защита кабельных колодцев, распределительных устройств, трансформаторных подстанций
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17,16H7V14H17M17,12H7V10H17M17,8H7V6H17M19,2H5A2,2 0 0,0 3,4V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V4A2,2 0 0,0 19,2Z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Телефонные сети</h3>
                <p className="text-gray-600 text-sm">
                  Люки для телефонных и интернет-кабелей, распределительных шкафов связи
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Газовые сети</h3>
                <p className="text-gray-600 text-sm">
                  Закрытие колодцев газопроводов, защита газорегуляторных пунктов
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,18.5C15.79,18.5 18.86,16.28 19.72,13H17.65C16.83,15.14 14.61,16.5 12,16.5C9.39,16.5 7.17,15.14 6.35,13H4.28C5.14,16.28 8.21,18.5 12,18.5M12,5.5C8.21,5.5 5.14,7.72 4.28,11H6.35C7.17,8.86 9.39,7.5 12,7.5C14.61,7.5 16.83,8.86 17.65,11H19.72C18.86,7.72 15.79,5.5 12,5.5M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Тепловые сети</h3>
                <p className="text-gray-600 text-sm">
                  Доступ к теплопроводам, тепловым камерам, узлам учета тепловой энергии
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Монтаж и эксплуатация */}
        <section className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Монтаж и эксплуатация
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Особенности монтажа</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</span>
                    <span>Подготовка основания - выравнивание и уплотнение грунта</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</span>
                    <span>Установка опорного кольца на подготовленное основание</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</span>
                    <span>Проверка горизонтальности установки кольца</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">4</span>
                    <span>Засыпка и уплотнение грунта вокруг кольца</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">5</span>
                    <span>Установка люка в посадочное место кольца</span>
                  </li>
                </ul>
                
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Важно:</h4>
                  <p className="text-sm text-gray-600">
                    Монтаж должен производиться при температуре не ниже -10°C. 
                    При более низких температурах материал может стать хрупким.
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Рекомендации по эксплуатации</h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Регулярная проверка состояния люка и кольца</li>
                  <li>• Очистка от загрязнений по мере необходимости</li>
                  <li>• Контроль горизонтального положения</li>
                  <li>• Проверка плотности прилегания крышки люка</li>
                  <li>• При обнаружении трещин - замена изделия</li>
                  <li>• Использование подъемных механизмов при работе</li>
                </ul>
                
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Преимущества в эксплуатации:</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>✓ Не требуют специального ухода</li>
                    <li>✓ Устойчивы к химическим воздействиям</li>
                    <li>✓ Сохраняют свойства при перепадах температур</li>
                    <li>✓ Не подвержены коррозии</li>
                    <li>✓ Длительный срок службы</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Стандарты и сертификация */}
        <section className="mb-16">
          <div className="bg-blue-50 rounded-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Стандарты и нормативы</h2>
              <p className="text-lg text-gray-600">
                Соответствие продукции действующим стандартам и требованиям
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Нормативные документы:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• ГОСТ 3634-99 &quot;Люки смотровых колодцев&quot;</li>
                  <li>• ГОСТ 8020-90 &quot;Конструкции бетонные и железобетонные&quot;</li>
                  <li>• СНиП 2.04.03-85 &quot;Канализация. Наружные сети&quot;</li>
                  <li>• СП 32.13330.2018 &quot;Канализация. Наружные сети&quot;</li>
                  <li>• ТР ТС 014/2011 &quot;Безопасность автомобильных дорог&quot;</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Сертификаты соответствия:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Сертификат соответствия ГОСТ Р</li>
                  <li>• Санитарно-эпидемиологическое заключение</li>
                  <li>• Сертификат пожарной безопасности</li>
                  <li>• Протоколы испытаний в аккредитованных лабораториях</li>
                  <li>• Техническое свидетельство Росстроя</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Часто задаваемые вопросы</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Какой срок службы у полимер-песчаных люков?
              </h3>
              <p className="text-gray-600">
                Срок службы полимер-песчаных люков составляет более 50 лет. Материал не подвержен 
                коррозии, устойчив к агрессивным средам и температурным перепадам.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Выдерживают ли люки нагрузку от автотранспорта?
              </h3>
              <p className="text-gray-600">
                Да, наши люки рассчитаны на нагрузку до 25 тонн, что соответствует классу нагрузки A15 
                по европейским стандартам. Они подходят для использования на дорогах с интенсивным движением.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Можно ли красить полимер-песчаные изделия?
              </h3>
              <p className="text-gray-600">
                Изделия могут изготавливаться в различных цветах (серый, коричневый) за счет добавления 
                красителей в массу. Дополнительная покраска не требуется, так как цвет сохраняется на весь срок службы.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Как происходит доставка продукции?
              </h3>
              <p className="text-gray-600">
                Доставка осуществляется автотранспортом по всей России. Возможна доставка как до склада 
                покупателя, так и на объект. Стоимость доставки рассчитывается индивидуально в зависимости 
                от объема заказа и расстояния.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
  <section className="bg-neutral-900 text-white p-12 text-center border-y-4 border-[var(--primary)]">
          <h2 className="text-3xl font-bold mb-4 heading tracking-wide">НУЖНА ТЕХНИЧЕСКАЯ КОНСУЛЬТАЦИЯ?</h2>
          <p className="text-lg mb-10 text-neutral-300 tracking-wide">Поможем подобрать решение под ваш проект</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+7" className="bg-white text-neutral-900 px-10 py-3 font-semibold tracking-wide rounded-none hover:bg-neutral-200 transition-colors">ПОЗВОНИТЬ</a>
            <Link href="/contacts" className="border-2 border-neutral-400 text-white px-10 py-3 font-semibold tracking-wide rounded-none hover:bg-white hover:text-neutral-900 transition-colors">НАПИСАТЬ</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
