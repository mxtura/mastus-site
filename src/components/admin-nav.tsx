'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { URLS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Package, 
  MessageSquare, 
  LogOut,
  User
} from 'lucide-react'

const navigation = [
  { name: 'Дашборд', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Продукты', href: '/products', icon: Package },
  { name: 'Категории', href: '/categories', icon: Package },
  { name: 'Сообщения', href: '/messages', icon: MessageSquare },
  { name: 'Контент', href: '/content', icon: LayoutDashboard },
  { name: 'Настройки', href: '/settings', icon: User },
]

export function AdminNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleSignOut = () => {
    // Build absolute admin login URL from current host to avoid wrong domain redirects
    const target = (() => {
      if (typeof window !== 'undefined') {
        const { protocol, host } = window.location
        const adminHost = host.startsWith('admin.') ? host : `admin.${host}`
        return `${protocol}//${adminHost}/login`
      }
      return `${URLS.admin}/login`
    })()
    signOut({ callbackUrl: target })
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Левая часть - логотип и навигация */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Laddex
              </h1>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                Админ
              </span>
            </div>
            
            {/* Навигационное меню */}
            <div className="hidden md:ml-8 md:flex md:items-center md:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      isActive
                        ? 'border-b-2 border-orange-500 text-gray-900'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Правая часть - профиль пользователя */}
          <div className="flex items-center space-x-4">
            {session?.user && (
              <>
                <Link href="/settings" className="flex items-center space-x-2 hover:underline">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {session.user.email}
                  </span>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Выйти</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Мобильное меню */}
      <div className="md:hidden">
        <div className="pt-2 pb-3 space-y-1 border-t border-gray-200">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block pl-3 pr-4 py-2 text-base font-medium ${
                  isActive
                    ? 'bg-orange-50 border-r-4 border-orange-500 text-orange-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
