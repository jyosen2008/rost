import './globals.css'
import clsx from 'clsx'
import { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import ThemeProvider from '@/components/theme-provider'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700']
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans'
})

export const metadata: Metadata = {
  title: 'Röst | Classy communal blogging',
  description:
    'Röst is a pastel-hued, modern-classic blogging destination where anyone can sign up, write, share, and discuss ideas.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={clsx(playfair.variable, inter.variable)}>
      <body className="min-h-screen bg-rost text-peat transition-colors duration-300">
        <ThemeProvider>
          <div className="relative isolate overflow-hidden px-4 py-8 sm:px-8 lg:px-12">
            <div className="pointer-events-none absolute inset-0 opacity-30 blur-3xl" />
            <div className="relative mx-auto max-w-6xl">
              <div className="rounded-3xl border border-white/30 bg-gradient-to-b from-dawn/70 via-rost/80 to-mist/90 p-6 shadow-2xl shadow-peat/5">
                {children}
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
