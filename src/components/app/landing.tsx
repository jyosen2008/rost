'use client'

import { useEffect, useState } from 'react'
import AuthPanel from '@/components/auth-panel'
import ThemeToggle from '@/components/theme-toggle'
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
    <div className="relative min-h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-white/40 bg-white/40 p-6 shadow-2xl shadow-peat/10">
      <WateryBackground />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.5em] text-peat/60">Rost</p>
          <h1 className="text-4xl font-semibold leading-tight text-peat sm:text-6xl">
            Reflections, opinions, stories, thoughts.
          </h1>
          <p className="max-w-xl text-lg text-peat/70">
            A calm place to write, follow people you like, and keep a personal feed of what you actually want to read.
          </p>
          <div className="flex flex-wrap gap-3">
            <ThemeToggle />
            <a
              href="#auth"
              className="rounded-full border border-white/50 bg-white/60 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-peat backdrop-blur hover:border-peat/40"
            >
              Login / Sign up
            </a>
          </div>
        </div>

        <div id="auth" className="flex w-full justify-center">
          {/* Avoid layout jump while hydrating */}
          {mounted ? <AuthPanel /> : <div className="h-[340px] w-[360px] rounded-3xl bg-white/40" />}
        </div>
      </div>

      <div className="relative mx-auto mt-10 max-w-6xl rounded-3xl border border-white/40 bg-white/50 p-5 text-sm text-peat/70 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-peat/60">What you get after login</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Profile dashboard with followers / following + post count</li>
          <li>Create post popup (no leaving the dashboard)</li>
          <li>Home feed prioritized by who you follow + what you read</li>
        </ul>
      </div>
    </div>
  )
}
