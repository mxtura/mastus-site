import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: 'МАСТУС - Админ панель',
  description: 'Панель администратора ООО МАСТУС',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
      </body>
    </html>
  )
}
