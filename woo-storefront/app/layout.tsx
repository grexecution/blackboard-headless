import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { SideCart } from '@/components/cart/side-cart'
import { MobileBottomNav } from '@/components/layout/mobile-nav'
import { ScrollToTop } from '@/components/layout/scroll-to-top'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BlackBoard Training - Professional Foot Training Equipment',
  description: 'Maximum movement potential for your feet. Professional foot training equipment designed for athletes and physiotherapists.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} pb-16 md:pb-0`} suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <SideCart />
          <MobileBottomNav />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  )
}