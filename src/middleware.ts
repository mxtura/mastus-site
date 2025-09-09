import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { rateLimit } from './lib/simple-rate-limit'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const hostname = request.headers.get('host') || ''
  
  console.log('🔍 Middleware - hostname:', hostname, 'pathname:', pathname)

  // Определяем, это админский поддомен или нет
  const isAdminSubdomain = hostname.startsWith('admin.')
  
  console.log('🌐 IsAdminSubdomain:', isAdminSubdomain)

  // Rate limiting для всех API маршрутов (кроме NextAuth)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    const { success, remaining } = await rateLimit(clientIp)
    
    if (!success) {
      return new Response(JSON.stringify({
        error: 'Too many requests',
        remaining: 0
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0'
        }
      })
    }

    // Добавляем заголовки rate limit к успешным запросам
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    
    return response
  }

  // Если это НЕ админский поддомен, блокируем доступ к админским страницам
  if (!isAdminSubdomain && pathname.startsWith('/admin')) {
    console.log('🚫 Main site - blocking admin path:', pathname)
    return new NextResponse('Not Found', { status: 404 })
  }

  // Если это админский поддомен
  if (isAdminSubdomain) {
    // Разрешаем публичные файлы без проверки авторизации
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/favicon') ||
      pathname.includes('.') ||
      pathname === '/login'  // Изменили с /admin/login на /login
    ) {
      console.log('✅ Admin subdomain - public file/auth:', pathname)
      return NextResponse.next()
    }

    // Для корневого пути на админском поддомене проверяем авторизацию
    if (pathname === '/') {
      try {
        const token = await getToken({ 
          req: request,
          secret: process.env.NEXTAUTH_SECRET 
        })

        if (!token) {
          console.log('🔒 Admin subdomain root - no token, redirecting to login')
          return NextResponse.redirect(new URL('/login', request.url))  // Изменили на /login
        }

        if (token.role !== 'ADMIN') {
          console.log('❌ Admin subdomain root - user is not admin:', token.role)
          return NextResponse.redirect(new URL('/login?error=AccessDenied', request.url))  // Изменили на /login
        }

        console.log('✅ Admin subdomain root - redirecting admin to dashboard')
        return NextResponse.redirect(new URL('/dashboard', request.url))  // Перенаправляем на чистый URL
      } catch (error) {
        console.error('Middleware auth error:', error)
        return NextResponse.redirect(new URL('/login?error=TokenError', request.url))  // Изменили на /login
      }
    }

    // Для чистых путей на админском поддомене проверяем авторизацию и делаем rewrite
  if (pathname === '/dashboard' || pathname === '/products' || pathname === '/messages' || pathname === '/content' || pathname === '/settings' || pathname === '/categories') {
      try {
        const token = await getToken({ 
          req: request,
          secret: process.env.NEXTAUTH_SECRET 
        })

        if (!token) {
          console.log('🔒 Admin subdomain - no token, redirecting to login')
          return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(pathname), request.url))
        }

        if (token.role !== 'ADMIN') {
          console.log('❌ Admin subdomain - user is not admin:', token.role)
          return NextResponse.redirect(new URL('/login?error=AccessDenied', request.url))
        }

  console.log('✅ Admin subdomain - admin access granted for:', pathname, '- rewriting to /admin' + pathname)
        // Делаем rewrite на настоящий путь
        const url = request.nextUrl.clone()
    url.pathname = '/admin' + pathname
        return NextResponse.rewrite(url)
      } catch (error) {
        console.error('Middleware auth error:', error)
        return NextResponse.redirect(new URL('/login?error=TokenError', request.url))
      }
    }

    // Для всех реальных админских путей проверяем авторизацию
  if (pathname.startsWith('/admin/dashboard') || pathname.startsWith('/admin/products') || pathname.startsWith('/admin/messages') || pathname.startsWith('/admin/content') || pathname.startsWith('/admin/settings') || pathname.startsWith('/admin/categories')) {
      try {
        const token = await getToken({ 
          req: request,
          secret: process.env.NEXTAUTH_SECRET 
        })

        if (!token) {
          console.log('🔒 Admin subdomain - no token, redirecting to login')
          return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(pathname), request.url))  // Изменили на /login
        }

        if (token.role !== 'ADMIN') {
          console.log('❌ Admin subdomain - user is not admin:', token.role)
          return NextResponse.redirect(new URL('/login?error=AccessDenied', request.url))  // Изменили на /login
        }

        console.log('✅ Admin subdomain - admin access granted')
      } catch (error) {
        console.error('Middleware auth error:', error)
        return NextResponse.redirect(new URL('/login?error=TokenError', request.url))  // Изменили на /login
      }
    }
  }

  // Проверка API админских роутов (только админские эндпоинты)  
  if (pathname.startsWith('/api/admin') || 
      pathname.startsWith('/api/messages')) {
    try {
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET 
      })

      if (!token || token.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Доступ запрещен' }, 
          { status: 403 }
        )
      }
    } catch (error) {
      console.error('API auth error:', error)
      return NextResponse.json(
        { error: 'Ошибка аутентификации' }, 
        { status: 401 }
      )
    }
  }

  // Проверяем только POST/PUT/DELETE запросы к /api/products (создание/изменение только для админов)
  if (pathname.startsWith('/api/products') && request.method !== 'GET') {
    try {
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET 
      })

      if (!token || token.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Доступ запрещен' }, 
          { status: 403 }
        )
      }
    } catch (error) {
      console.error('API auth error:', error)
      return NextResponse.json(
        { error: 'Ошибка аутентификации' }, 
        { status: 401 }
      )
    }
  }

  // Перенаправление уже аутентифицированных админов со страницы логина
  if (pathname === '/admin/login') {
    try {
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET 
      })

      if (token && token.role === 'ADMIN') {
        console.log('↩️ Admin already logged in, redirecting to dashboard')
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
    } catch (error) {
      console.error('Middleware redirect error:', error)
    }
  }

  // Добавляем заголовки безопасности
  const response = NextResponse.next()
  
  // CSP заголовки
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api-maps.yandex.ru https://static.cloudflareinsights.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api-maps.yandex.ru https://cloudflareinsights.com; " +
    "frame-src 'self' https://yandex.ru https://*.yandex.ru; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  )
  
  // Дополнительные заголовки безопасности
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}
