'use client'

import { useState } from 'react'
import { supabaseClient } from '@/lib/supabase-client'

type FormMode = 'login' | 'signup'

type SocialProvider = 'google' | 'apple' | 'facebook'

const socialOptions: { label: string; provider: SocialProvider }[] = [
  { label: 'Google', provider: 'google' },
  { label: 'Apple', provider: 'apple' },
  { label: 'Facebook', provider: 'facebook' }
]

export default function AuthPanel() {
  const [mode, setMode] = useState<FormMode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      if (mode === 'signup') {
        const { error } = await supabaseClient.auth.signUp({ email, password })
        if (error) {
          setMessage(error.message)
        } else {
          setMessage('Check your email for a confirmation link.')
        }
      } else {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password })
        if (error) {
          setMessage(error.message)
        } else {
          setMessage('Welcome back to Röst!')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: SocialProvider) => {
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) {
        setMessage(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-3xl border border-peat/10 bg-peat/10 p-6 shadow-lg">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-peat/60">
        <span>Join Röst</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
              mode === 'signup'
                ? 'bg-peat text-white'
                : 'bg-white text-peat/70 hover:text-peat'
            }`}
          >
            Sign up
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
              mode === 'login'
                ? 'bg-peat text-white'
                : 'bg-white text-peat/70 hover:text-peat'
            }`}
          >
            Login
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-peat/60">Continue with</p>
          <div className="mt-2 grid gap-2">
            {socialOptions.map((option) => (
              <button
                key={option.provider}
                type="button"
                onClick={() => handleSocialLogin(option.provider)}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/40 bg-white py-3 text-xs font-semibold uppercase tracking-[0.2em] text-peat transition hover:border-peat"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[0.55rem] uppercase tracking-[0.4em] text-peat/40">
          <span className="h-px flex-1 bg-peat/20" aria-hidden="true" />
          <span>Or</span>
          <span className="h-px flex-1 bg-peat/20" aria-hidden="true" />
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            required
            className="rounded-2xl border border-white/30 bg-white/50 px-4 py-3 text-base text-peat placeholder:text-peat/50 focus:border-ember focus:outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            required
            className="rounded-2xl border border-white/30 bg-white/50 px-4 py-3 text-base text-peat placeholder:text-peat/50 focus:border-ember focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-ember px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white"
          >
            {mode === 'login' ? 'Login' : 'Create account'}
          </button>
          {message ? <p className="text-sm text-peat/70">{message}</p> : null}
        </form>
      </div>
    </section>
  )
}
