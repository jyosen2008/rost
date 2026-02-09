'use client'

import React, { FormEvent, useState } from 'react'
import { supabaseClient } from '@/lib/supabase-client'

type FormMode = 'login' | 'signup'

export default function AuthPanel() {
  const [mode, setMode] = useState<FormMode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [handleValue, setHandleValue] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const saveProfile = async (userId: string) => {
    const normalizedHandle = handleValue.trim().replace(/^@/, '').toLowerCase()
    if (!normalizedHandle) {
      setMessage('Please pick a handle to continue.')
      return
    }
    const nameToSave = displayName.trim() || 'a Röst storyteller'
    await supabaseClient.from('profiles').upsert({
      user_id: userId,
      handle: normalizedHandle,
      display_name: nameToSave,
      bio: ''
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      if (mode === 'signup') {
        const { data, error } = await supabaseClient.auth.signUp({ email, password })
        if (error) {
          setMessage(error.message)
        } else if (data?.user?.id) {
          await saveProfile(data.user.id)
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
    <section className="glass-panel w-full max-w-[360px] px-5 py-6 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between text-[0.6rem] uppercase tracking-[0.35em] text-[var(--text-muted)]">
        <span>Join Röst</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold transition ${
              mode === 'signup'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--icon-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Join
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold transition ${
              mode === 'login'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--icon-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Login
          </button>
        </div>
      </div>

      <p className="mt-3 text-xs uppercase tracking-[0.3em] text-[var(--text-subtle)]">
        {mode === 'login' ? 'Return with email' : 'Create an email account'}
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        {mode === 'signup' && (
          <>
            <input
              type="text"
              value={handleValue}
              onChange={(event) => setHandleValue(event.target.value)}
              placeholder="Handle (e.g. @story)"
              required
              className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:border-[var(--accent)] focus:outline-none"
            />
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Display name"
              required
              className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:border-[var(--accent)] focus:outline-none"
            />
          </>
        )}
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
          className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:border-[var(--accent)] focus:outline-none"
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            required
            className="w-full rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 pr-12 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:border-[var(--accent)] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[var(--icon-bg)] px-2 py-1 text-[0.6rem] font-semibold text-[var(--text-muted)]"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-2xl bg-[var(--accent)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition"
        >
          {mode === 'login' ? 'Login' : 'Create account'}
        </button>
        {message ? <p className="text-xs text-[var(--text-muted)]">{message}</p> : null}
      </form>
    </section>
  )
}
