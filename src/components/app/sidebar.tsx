'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/home', label: 'Home' }
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-6 h-fit rounded-3xl border border-white/40 bg-white/70 p-4 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.5em] text-peat/60">Rost</p>
      <nav className="mt-4 flex flex-col gap-2">
        {nav.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active ? 'bg-peat text-white' : 'text-peat/70 hover:bg-white/60'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
