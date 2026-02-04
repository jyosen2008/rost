'use client'

import { useState } from 'react'
import { supabaseClient } from '@/lib/supabase-client'

type FormMode = 'login' | 'signup'

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

  return (
    <section className="rounded-3xl border border-peat/10 bg-peat/5 p-6 shadow-lg">
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
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
          className="rounded-2xl border border-white/30 bg-white/50 px-4 py-3 text-base text-peat focus:border-ember focus:outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
          className="rounded-2xl border border-white/30 bg-white/50 px-4 py-3 text-base text-peat focus:border-ember focus:outline-none"
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
    </section>
  )
}
