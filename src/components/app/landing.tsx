'use client'

import { useEffect, useState } from 'react'
import AuthPanel from '@/components/auth-panel'
import WateryBackground from '@/components/app/watery-background'
import ThemeToggle from '@/components/theme-toggle'
import { useSession } from '@/hooks/use-session'
import { useRouter } from 'next/navigation'

export default function Landing() {
  const { user, loading } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [loading, user, router])

  return (
    <div className="relative min-h-[calc(100vh-2rem)] overflow-hidden rounded-[34px] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-2xl shadow-black/20">
      <WateryBackground />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.5em] text-[var(--text-subtle)]">ROST</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[var(--text-primary)] sm:text-6xl">
            A calmer, smarter media room for internet-native writing.
          </h1>
          <p className="max-w-xl text-lg text-[var(--text-muted)]">
            Rooms, duets, digest cards, anonymous verified stories, live drops, and a co-writer that guides the post while you write.
          </p>
          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {['Rooms', 'Digest', 'Duets'].map((item) => (
              <div key={item} className="vibe-panel p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{item}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Built into the live feed</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-3 py-2"
            >
              <ThemeToggle compact />
            </button>
            <a
              href="#auth"
              className="rounded-full border border-[var(--card-border)] bg-[var(--icon-bg)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-primary)]"
            >
              Login / Sign up
            </a>
          </div>
        </div>

        <div id="auth" className="flex w-full justify-center">
          {mounted ? <AuthPanel /> : <div className="h-[340px] w-[360px] rounded-3xl bg-[var(--panel-bg)]" />}
        </div>
      </div>
    </div>
  )
}
