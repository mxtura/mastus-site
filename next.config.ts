import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Разрешенные домены для разработки (исправляет CORS предупреждения)
  allowedDevOrigins: [
    'admin.mastus.local:3000',
    'mastus.local:3000'
  ],
  
  // Поддержка поддоменов - правильная конфигурация  
  async rewrites() {
    return [
      // Только для логина на админском поддомене
      {
        source: '/login',
        destination: '/admin/login',
        has: [
          {
            type: 'host',
            value: 'admin.mastus.local:3000',
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
