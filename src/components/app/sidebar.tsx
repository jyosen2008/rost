'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from '@/components/theme-toggle'

type SidebarProps = {
  onSearchClick: () => void
}

const nav = [
  { href: '/home', label: 'Home', icon: IconHome },
  { href: '/dashboard', label: 'Studio', icon: IconDashboard },
  { href: '/profile', label: 'Profile', icon: IconProfile }
]

type IconProps = {
  className?: string
}

function IconHome({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5L12 4l9 6.5v8.5a1 1 0 0 1-1 1h-6v-5.5h-4V20H4a1 1 0 0 1-1-1z" />
    </svg>
  )
}

function IconDashboard({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="8" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
    </svg>
  )
}

function IconProfile({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </svg>
  )
}

export default function Sidebar({ onSearchClick }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 px-2 py-2 icon-rail lg:sticky lg:left-auto lg:top-6 lg:h-fit lg:translate-x-0 lg:flex-col">
      {nav.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex h-12 w-12 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors duration-200 lg:h-14 lg:w-14 ${
              active
                ? 'bg-[var(--accent-soft)] text-[var(--accent)] shadow-lg shadow-[var(--accent-soft)]'
                : 'hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]'
            }`}
          >
            <item.icon className="h-6 w-6" />
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)] shadow-lg group-hover:flex lg:bottom-auto lg:left-full lg:top-1/2 lg:mb-0 lg:ml-2 lg:-translate-x-0 lg:-translate-y-1/2">
              {item.label}
            </span>
          </Link>
        )
      })}
      <button
        type="button"
        onClick={onSearchClick}
        className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
        title="Search"
      >
        <span className="sr-only">Open search</span>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M16 16l5 5" />
        </svg>
      </button>
      <div className="flex w-full items-center justify-center rounded-2xl lg:mt-2">
        <ThemeToggle compact />
      </div>
    </aside>
  )
}
