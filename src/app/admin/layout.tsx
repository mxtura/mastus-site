import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from 'next/font/local';
import '../globals.css'
import Providers from '@/components/providers'
import { AdminNav } from '@/components/admin-nav'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Add the same local Furore font as in root layout to keep body class list identical (avoids hydration mismatch)
const furore = localFont({
  src: [
    { path: '../fonts/Furore.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/Furore.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-furore',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Laddex - Админ панель',
  description: 'Панель администратора Laddex',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} ${furore.variable} antialiased`}>
      <Providers>
        <div className="min-h-screen bg-gray-50">
          {/* Админская навигация */}
          <AdminNav />

          {/* Контент админки */}
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </Providers>
    </div>
  )
}
