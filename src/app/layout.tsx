import type { Metadata, Viewport } from 'next'
import './globals.css'
import { MobileNav } from '@/components/layout/MobileNav'

export const metadata: Metadata = {
  title: {
    template: '%s | Agrobeus',
    default: 'Agrobeus BezoekApp',
  },
  description: 'Klantenbeheer en bezoekregistratie voor Agrobeus Consulting',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Agrobeus',
  },
  icons: {
    apple: '/icons/icon-180.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4a8a3a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <main className="max-w-lg mx-auto bg-gray-50 min-h-screen">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  )
}
