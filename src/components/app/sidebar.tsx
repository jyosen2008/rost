'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/home', label: 'Home', icon: IconHome },
  { href: '/dashboard', label: 'Dashboard', icon: IconDashboard }
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

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-6 flex h-fit flex-col items-center gap-3 px-1 py-2 icon-rail">
      {nav.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex h-14 w-14 items-center justify-center rounded-2xl text-[var(--text-muted)] transition-colors duration-200 ${
              active
                ? 'bg-[var(--accent-soft)] text-[var(--accent)] shadow-lg shadow-[var(--accent-soft)]'
                : 'hover:bg-white/40 hover:text-[var(--text-primary)]'
            }`}
          >
            <item.icon className="h-6 w-6" />
            <span className="pointer-events-none absolute left-full top-1/2 hidden -translate-y-1/2 rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)] shadow-lg group-hover:flex">
              {item.label}
            </span>
          </Link>
        )
      })}
    </aside>
  )
}
