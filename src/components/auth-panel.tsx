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
    <section className="w-full max-w-[360px] rounded-3xl border border-peat/10 bg-peat/10 p-5 shadow-lg shadow-peat/10">
      <div className="flex items-center justify-between text-[0.6rem] uppercase tracking-[0.35em] text-peat/60">
        <span>Join Röst</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold transition ${
              mode === 'signup'
                ? 'bg-peat text-white'
                : 'bg-white text-peat/70 hover:text-peat'
            }`}
          >
            Join
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold transition ${
              mode === 'login'
                ? 'bg-peat text-white'
                : 'bg-white text-peat/70 hover:text-peat'
            }`}
          >
            Login
          </button>
        </div>
      </div>

      <p className="mt-3 text-xs uppercase tracking-[0.3em] text-peat/60">
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
              className="rounded-2xl border border-white/30 bg-white/60 px-4 py-3 text-sm text-peat placeholder:text-peat/60 focus:border-ember focus:outline-none"
            />
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Display name"
              required
              className="rounded-2xl border border-white/30 bg-white/60 px-4 py-3 text-sm text-peat placeholder:text-peat/60 focus:border-ember focus:outline-none"
            />
          </>
        )}
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
          className="rounded-2xl border border-white/30 bg-white/60 px-4 py-3 text-sm text-peat placeholder:text-peat/60 focus:border-ember focus:outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
          className="rounded-2xl border border-white/30 bg-white/60 px-4 py-3 text-sm text-peat placeholder:text-peat/60 focus:border-ember focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-2xl bg-ember px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white"
        >
          {mode === 'login' ? 'Login' : 'Create account'}
        </button>
        {message ? <p className="text-xs text-peat/60">{message}</p> : null}
      </form>
    </section>
  )
}
