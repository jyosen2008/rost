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
          <div className="relative min-h-screen overflow-hidden px-3 py-5 sm:px-6 lg:px-10">
            <div className="relative mx-auto max-w-7xl">
              <div className="relative rounded-[28px] border border-[var(--panel-border)] bg-[var(--panel-surface)] p-4 shadow-2xl shadow-[rgba(8,16,32,0.26)] backdrop-blur-2xl sm:p-6">
                {children}
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
