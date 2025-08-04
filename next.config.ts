import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Для создания standalone версии (нужно для Docker)
  output: 'standalone',
  
  // Конфигурация изображений
  images: {
    domains: ['localhost', 'mxbox.fun', 'admin.mxbox.fun'],
    unoptimized: false,
  },
  
  // Поддержка поддоменов - правильная конфигурация  
  async rewrites() {
    return [
      // Для логина на админском поддомене (работает для любого домена)
      {
        source: '/login',
        destination: '/admin/login',
        has: [
          {
            type: 'host',
            value: '(admin\\..+)',
          },
        ],
      },
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      },
      {
        source: '/admin/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
