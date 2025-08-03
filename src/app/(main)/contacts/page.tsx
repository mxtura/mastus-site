import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Contacts() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Контакты</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Свяжитесь с нами для получения консультации или размещения заказа
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Контактная информация */}
          <div className="space-y-8">
            <Card className="p-8">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-6">ООО &quot;МАСТУС&quot;</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-1">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Телефон</h3>
                      <p className="text-gray-600">+7 (XXX) XXX-XX-XX</p>
                      <p className="text-gray-600">+7 (XXX) XXX-XX-XX</p>
                      <p className="text-sm text-gray-500 mt-1">Пн-Пт: 9:00-18:00</p>
                    </div>
                  </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">info@mastus.ru</p>
                    <p className="text-gray-600">sales@mastus.ru</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Адрес</h3>
                    <p className="text-gray-600">г. Кимры, Тверская область</p>
                    <p className="text-gray-600">ул. Орджоникидзе, д. 68</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Режим работы</h3>
                    <p className="text-gray-600">Понедельник - Пятница: 9:00 - 18:00</p>
                    <p className="text-gray-600">Суббота: 10:00 - 16:00</p>
                    <p className="text-gray-600">Воскресенье: выходной</p>
                  </div>
                </div>
              </div>
              </CardContent>
            </Card>

            {/* Реквизиты */}
            <Card className="bg-gray-50 p-8">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-bold text-gray-900 mb-4">Реквизиты компании</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-900">Полное наименование:</span>
                    </div>
                    <div>
                      Общество с ограниченной ответственностью &quot;МАСТУС&quot;
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-900">ИНН:</span>
                    </div>
                    <div>XXXXXXXXXX</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-900">КПП:</span>
                    </div>
                    <div>XXXXXXXXX</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-900">ОГРН:</span>
                    </div>
                    <div>XXXXXXXXXXXXX</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-900">Юридический адрес:</span>
                    </div>
                    <div>г. Кимры, Тверская область, ул. Орджоникидзе, д. 68</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Форма обратной связи */}
          <Card className="p-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-6">Отправить сообщение</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Имя *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ваше имя"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Компания
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Название компании"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+7 (XXX) XXX-XX-XX"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Тема обращения
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Выберите тему</option>
                  <option value="price">Запрос цены</option>
                  <option value="order">Размещение заказа</option>
                  <option value="delivery">Доставка</option>
                  <option value="technical">Техническая консультация</option>
                  <option value="other">Другое</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Сообщение *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Опишите ваш запрос подробнее..."
                ></textarea>
              </div>

              <div>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Я согласен на обработку персональных данных в соответствии с{" "}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                      политикой конфиденциальности
                    </Link>
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
              >
                Отправить сообщение
              </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Яндекс карта */}
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div style={{position:"relative",overflow:"hidden"}}>
              <a href="https://yandex.ru/maps/10811/kimry/?utm_medium=mapframe&utm_source=maps" style={{color:"#eee",fontSize:"12px",position:"absolute",top:"0px"}}>Кимры</a>
              <a href="https://yandex.ru/maps/10811/kimry/house/ulitsa_ordzhonikidze_68/Z04YdQNoQEQEQFtsfXR0eX1jYQ==/?from=api-maps&ll=37.348925%2C56.858086&origin=jsapi_2_1_79&rtext=~56.858155%2C37.348908&rtt=auto&ruri=~&utm_medium=mapframe&utm_source=maps&z=19.96" style={{color:"#eee",fontSize:"12px",position:"absolute",top:"14px"}}>Улица Орджоникидзе, 68 — Яндекс Карты</a>
              <iframe 
                src="https://yandex.ru/map-widget/v1/?from=api-maps&ll=37.348925%2C56.858086&mode=whatshere&origin=jsapi_2_1_79&rtext=~56.858155%2C37.348908&rtt=auto&ruri=~&whatshere%5Bpoint%5D=37.348696%2C56.857972&whatshere%5Bzoom%5D=17&z=19.96" 
                width="100%" 
                height="400" 
                frameBorder="0" 
                allowFullScreen={true} 
                style={{position:"relative"}}
                title="Местоположение ООО МАСТУС"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
