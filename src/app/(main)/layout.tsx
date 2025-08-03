import Link from "next/link";

export default function MainSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">ООО &quot;МАСТУС&quot;</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link href="/" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Главная
                </Link>
                <Link href="/products" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Продукция
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  О компании
                </Link>
                <Link href="/contacts" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Контакты
                </Link>
                <Link href="/info" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Информация
                </Link>
              </div>
            </div>
            <div className="md:hidden">
              <div className="flex flex-col space-y-1">
                <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Главная</Link>
                <Link href="/products" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Продукция</Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">О компании</Link>
                <Link href="/contacts" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Контакты</Link>
                <Link href="/info" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Информация</Link>
              </div>
            </div>
          </div>
        </nav>
      </header>
      
      <main>
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">ООО &quot;МАСТУС&quot;</h3>
              <p className="text-gray-300">
                Производство и продажа качественных полимер-песчаных изделий для инженерных коммуникаций.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Продукция</h3>
              <ul className="text-gray-300 space-y-2">
                <li>Люки полимер-песчаные 750×60/95 мм</li>
                <li>Кольца опорные КО-6</li>
                <li>Кольца опорные КО-7</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Контакты</h3>
              <div className="text-gray-300 space-y-2">
                <p>Телефон: +7 (XXX) XXX-XX-XX</p>
                <p>Email: info@mastus.ru</p>
                <p>Адрес: г. Москва</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ООО &quot;МАСТУС&quot;. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
