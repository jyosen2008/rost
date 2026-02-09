'use client'

import { useEffect, useState } from 'react'
import AuthPanel from '@/components/auth-panel'
import WateryBackground from '@/components/app/watery-background'
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
    <div className="relative min-h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-2xl shadow-black/30">
      <WateryBackground />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.5em] text-[var(--text-subtle)]">Röst</p>
          <h1 className="text-4xl font-semibold leading-tight text-[var(--text-primary)] sm:text-6xl">
            Reflections, opinions, stories, thoughts.
          </h1>
          <p className="max-w-xl text-lg text-[var(--text-muted)]">
            A pastel-blue sanctuary for writing, sharing, and following the voices you care about.
          </p>
          <div className="flex flex-wrap gap-3">
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
