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
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
        <ThemeProvider>
          <div className="relative min-h-screen overflow-hidden px-3 py-4 sm:px-6 lg:px-10">
            <div className="pointer-events-none fixed left-6 top-8 h-48 w-48 rounded-full bg-[var(--accent-soft)] blur-3xl" />
            <div className="pointer-events-none fixed bottom-10 right-8 h-56 w-56 rounded-full bg-[var(--accent-variant-soft)] blur-3xl" />
            <div className="relative mx-auto max-w-7xl">
              <div className="studio-shell relative p-3 sm:p-5">
                {children}
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
