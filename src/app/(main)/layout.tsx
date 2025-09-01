"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function MainSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contact, setContact] = useState({
    phoneTel: "",
    emailInfo: "",
    addressCityRegion: "",
    telegramUsername: "",
    whatsappNumber: "",
  });

  const TEL_MAIN_HREF = contact.phoneTel ? `tel:${contact.phoneTel}` : undefined;
  const MAILTO_INFO = contact.emailInfo ? `mailto:${contact.emailInfo}` : undefined;
  const TG_LINK = contact.telegramUsername ? `https://t.me/${contact.telegramUsername}` : undefined;
  const WA_LINK = contact.whatsappNumber ? `https://wa.me/${contact.whatsappNumber}` : undefined;

  const phoneDisplay = contact.phoneTel
    ? contact.phoneTel.replace(/^\+?7?\s*(\d{3})(\d{3})(\d{2})(\d{2})$/, "+7 ($1) $2-$3-$4")
    : "+7";

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch('/api/content?type=CONTACTS', { next: { revalidate: 60 } });
        if (!res.ok) return;
        const payload = await res.json();
        if (ignore) return;
        type ContactsPayload = Partial<{
          phoneTel: string;
          emailInfo: string;
          addressCityRegion: string;
          telegramUsername: string;
          whatsappNumber: string;
        }>;
        const d: ContactsPayload = (payload?.data || {}) as ContactsPayload;
        setContact({
          phoneTel: typeof d.phoneTel === 'string' ? d.phoneTel : "",
          emailInfo: typeof d.emailInfo === 'string' ? d.emailInfo : "",
          addressCityRegion: typeof d.addressCityRegion === 'string' ? d.addressCityRegion : "",
          telegramUsername: typeof d.telegramUsername === 'string' ? d.telegramUsername : "",
          whatsappNumber: typeof d.whatsappNumber === 'string' ? d.whatsappNumber : "",
        });
      } catch {}
    }
    load();
    return () => { ignore = true };
  }, []);

  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/" className="text-2xl font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors heading">
                  Laddex
                </Link>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a
                  href={TEL_MAIN_HREF}
                  className="text-gray-900 hover:text-[var(--tertiary)] px-3 py-2 text-sm font-semibold transition-colors relative group whitespace-nowrap"
                  aria-label="Позвонить в Laddex"
                >
                  {phoneDisplay}
                  
                </a>
                <Link href="/" className="text-gray-900 hover:text-[var(--primary)] px-3 py-2 text-sm font-medium transition-colors relative group">
                  Главная
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--tertiary)] transition-all group-hover:w-full"></span>
                </Link>
                <Link href="/products" className="text-gray-700 hover:text-[var(--primary)] px-3 py-2 text-sm font-medium transition-colors relative group">
                  Продукция
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--tertiary)] transition-all group-hover:w-full"></span>
                </Link>
                
                <Link href="/contacts" className="text-gray-700 hover:text-[var(--primary)] px-3 py-2 text-sm font-medium transition-colors relative group">
                  Контакты
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--tertiary)] transition-all group-hover:w-full"></span>
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-[var(--primary)] px-3 py-2 text-sm font-medium transition-colors relative group">
                  О компании
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--tertiary)] transition-all group-hover:w-full"></span>
                </Link>
                
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                <a
                  href={TEL_MAIN_HREF}
                  className="block px-3 py-2 text-base font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]"
                  aria-label="Позвонить в Laddex"
                >
                  {phoneDisplay}
                </a>
                <Link 
                  href="/" 
                  className="text-gray-700 hover:text-[var(--primary)] block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Главная
                </Link>
                <Link 
                  href="/products" 
                  className="text-gray-700 hover:text-[var(--primary)] block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Продукция
                </Link>
                <Link 
                  href="/contacts" 
                  className="text-gray-700 hover:text-[var(--primary)] block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Контакты
                </Link>
                <Link 
                  href="/about" 
                  className="text-gray-700 hover:text-[var(--primary)] block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  О компании
                </Link>

              </div>
            </div>
          )}
        </nav>
      </header>
      
      <main>
        {children}
      </main>
      
  <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 text-[var(--primary)] heading">Laddex</h3>
              <p className="text-gray-300 mb-4 max-w-md">
                Производство и продажа качественных алюминиевых лестниц и полимер-песчаных изделий для инженерных коммуникаций. 
                Надежность, долговечность и профессиональный подход.
              </p>
              <div className="flex space-x-4">
                {/* WhatsApp */}
                <a href={WA_LINK} aria-label="WhatsApp" className="text-gray-400 hover:text-[var(--primary)] transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.155 5.3 5.36 0 12.02 0a11.86 11.86 0 0111.89 11.887c0 6.56-5.35 11.864-11.987 11.864a11.9 11.9 0 01-5.688-1.448L.057 24zM6.6 19.36c1.676.995 3.276 1.591 5.392 1.591 5.448 0 9.92-4.44 9.92-9.907 0-5.462-4.472-9.886-9.934-9.886-5.463 0-9.887 4.424-9.887 9.886 0 2.225.725 3.891 1.938 5.523l-.999 3.648 3.57-.855zm11.387-5.464c-.073-.122-.268-.195-.56-.342-.292-.146-1.732-.853-2.002-.95-.268-.098-.463-.146-.657.146-.195.292-.755.95-.926 1.146-.17.195-.341.22-.633.073-.292-.146-1.233-.455-2.35-1.45-.868-.774-1.456-1.73-1.627-2.022-.17-.293-.018-.45.128-.596.132-.131.292-.341.438-.512.146-.171.195-.293.292-.488.097-.195.048-.366-.024-.512-.073-.146-.657-1.587-.9-2.173-.237-.569-.48-.49-.657-.5l-.561-.01c-.195 0-.512.073-.78.366-.268.292-1.024 1-1.024 2.438 0 1.438 1.048 2.833 1.195 3.028.146.195 2.066 3.159 5.01 4.428.701.302 1.249.482 1.674.617.703.224 1.343.192 1.848.116.564-.084 1.732-.708 1.975-1.392.244-.683.244-1.268.171-1.39z" />
                  </svg>
                </a>
                {/* Telegram */}
                <a href={TG_LINK} aria-label="Telegram" className="text-gray-400 hover:text-[var(--primary)] transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 6.628 5.373 12 12 12 6.628 0 12-5.372 12-12 0-6.627-5.372-12-12-12zm5.69 8.217c-.228 2.403-1.216 8.24-1.72 10.932-.213 1.146-.632 1.528-1.04 1.564-.884.082-1.557-.586-2.414-1.148-1.342-.88-2.1-1.428-3.404-2.28-1.507-.992-.53-1.536.33-2.428.226-.235 4.15-3.805 4.23-4.13.009-.04.018-.188-.07-.266-.088-.079-.218-.052-.311-.03-.132.03-2.23 1.417-6.294 4.162-.596.41-1.13.61-1.604.6-.528-.012-1.544-.298-2.3-.543-.928-.301-1.664-.46-1.6-.97.033-.264.397-.533 1.09-.808 4.29-1.868 7.155-3.096 8.596-3.684 4.093-1.702 4.944-1.997 5.5-2.006.122-.002.395.028.572.17.15.12.19.283.21.397-.018.093.003.298-.01.468z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[var(--primary)]">Контакты</h3>
              <div className="text-gray-300 space-y-2">
                <p className="flex items-center">
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  <a href={TEL_MAIN_HREF} className="hover:text-white transition-colors">{phoneDisplay}</a>
                </p>
                <p className="flex items-center">
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <a href={MAILTO_INFO} className="hover:text-white transition-colors">{contact.emailInfo || 'info@site.ru'}</a>
                </p>
                <p className="flex items-center">
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  {contact.addressCityRegion || ''}
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; 2025 Laddex. Все права защищены.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                Политика конфиденциальности
              </Link>
              <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                Условия использования
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
