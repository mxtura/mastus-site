import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/providers";
import "./globals.css";
import localFont from 'next/font/local';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Local Furore font (400 only). Duplicate entry for 700 to keep font-bold from falling back.
const furore = localFont({
  src: [
    { path: './fonts/Furore.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Furore.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-furore',
  display: 'swap'
});

export const metadata: Metadata = {
  title: "Laddex - Полимер-песчаные люки и кольца опорные",
  description: "Производство и продажа полимер-песчаных люков 750*60/95 мм и колец опорных КО-6/КО-7. Качественная продукция для инженерных коммуникаций.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${geistSans.variable} ${geistMono.variable} ${furore.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
