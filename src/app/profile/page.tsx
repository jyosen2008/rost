'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import AppShell from '@/components/app/app-shell'
import { useProfileStats } from '@/hooks/use-profile-stats'
import { useSession } from '@/hooks/use-session'
import { supabaseClient } from '@/lib/supabase-client'

export default function ProfilePage() {
  const { user, loading: sessionLoading } = useSession()
  const { profile, stats, loading: profileLoading, refresh: refreshProfile } = useProfileStats(user?.id ?? null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [handleInput, setHandleInput] = useState('')
  const [displayNameInput, setDisplayNameInput] = useState('')
  const [bioInput, setBioInput] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const profileId = profile?.user_id ?? user?.id

  const display = useMemo(() => {
    const handle = profile?.handle ? `@${profile.handle}` : '@rost'
    const displayName = profile?.display_name ?? 'Röst-er'
    return {
      handle,
      displayName,
      bio: profile?.bio ?? ''
    }
  }, [profile])

  const handleEditToggle = () => {
    setEditingProfile((prev) => !prev)
    setHandleInput(profile?.handle ?? '')
    setDisplayNameInput(profile?.display_name ?? '')
    setBioInput(profile?.bio ?? '')
    setActionMessage(null)
  }

  const copyProfileLink = () => {
    if (typeof window === 'undefined') return
    const handleKey = profile?.handle ?? 'rost'
    const url = `${window.location.origin}/profiles/${handleKey}`
    navigator.clipboard.writeText(url)
    setActionMessage('Profile link copied to clipboard.')
  }

  const saveProfileEdits = async () => {
    if (!user?.id) return
    setSavingProfile(true)
    const normalizedHandle = handleInput.trim().replace(/^@/, '').toLowerCase()
    if (!normalizedHandle) {
      setActionMessage('Handle cannot be empty.')
      setSavingProfile(false)
      return
    }
    const normalizedDisplayName = displayNameInput.trim() || 'Röst-er'
    const sanitizedBio = bioInput.trim() || undefined
    const updates = {
      user_id: user.id,
      handle: normalizedHandle,
      display_name: normalizedDisplayName,
      bio: sanitizedBio
    }
    const { error } = await supabaseClient.from('profiles').upsert(updates, { onConflict: 'user_id' })
    setSavingProfile(false)
    if (error) {
      console.error('Profile update failed', error)
      setActionMessage(error.message || 'Unable to save profile. Try again.')
      return
    }
    setActionMessage('Profile updated!')
    setEditingProfile(false)
    refreshProfile()
  }

  if (sessionLoading || profileLoading) {
    return (
      <AppShell>
        <section className="glass-panel animate-pulse p-6">
          <h1 className="h-6 w-40 rounded bg-white/30" />
          <p className="mt-3 h-4 w-48 rounded bg-white/20" />
          <p className="mt-2 h-3 w-32 rounded bg-white/20" />
        </section>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="glass-panel rounded-3xl border border-white/20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)] p-6 text-peat shadow-2xl shadow-peat/20 dark:border-white/0 dark:bg-peat/80">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-subtle)]">Profile</p>
              <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{display.displayName}</h1>
              <p className="text-sm text-[var(--text-muted)]">{display.handle}</p>
              <p className="text-[0.65rem] uppercase tracking-[0.45em] text-[var(--text-subtle)]">ID: {profileId ?? '—'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={copyProfileLink}
                className="rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-5 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-[var(--text-muted)]"
              >
                Copy link
              </button>
              <Link
                href="/dashboard"
                className="rounded-full bg-[var(--accent)] px-5 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-black"
              >
                Manage posts
              </Link>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm text-[var(--text-muted)]">
            {display.bio || 'This is your space to share a short bio. Make it personal, poetic, precise, or all three.'}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-4 text-left">
              <p className="text-3xl font-semibold text-[var(--text-primary)]">{stats.posts}</p>
              <p className="mt-1 text-[0.7rem] uppercase tracking-[0.4em] text-[var(--text-subtle)]">Posts</p>
            </div>
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-4 text-left">
              <p className="text-3xl font-semibold text-[var(--text-primary)]">{stats.followers}</p>
              <p className="mt-1 text-[0.7rem] uppercase tracking-[0.4em] text-[var(--text-subtle)]">Followers</p>
            </div>
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-4 text-left">
              <p className="text-3xl font-semibold text-[var(--text-primary)]">{stats.following}</p>
              <p className="mt-1 text-[0.7rem] uppercase tracking-[0.4em] text-[var(--text-subtle)]">Following</p>
            </div>
          </div>
        </header>

        <section className="glass-panel space-y-4 rounded-3xl border border-white/20 p-6 text-[var(--text-primary)] shadow-lg shadow-peat/30">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-subtle)]">Profile details</p>
            <button
              type="button"
              onClick={handleEditToggle}
              className="rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]"
            >
              {editingProfile ? 'Cancel' : 'Edit profile'}
            </button>
          </div>
          <div className="space-y-1 text-sm">
            <p>
              Handle: <span className="font-semibold text-[var(--text-primary)]">{display.handle}</span>
            </p>
            <p>
              Display name: <span className="font-semibold text-[var(--text-primary)]">{display.displayName}</span>
            </p>
            <p>
              Bio: <span className="font-semibold text-[var(--text-primary)]">{display.bio || 'No bio yet'}</span>
            </p>
          </div>
          {editingProfile && (
            <div className="space-y-3">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--text-subtle)]">Update your profile</p>
              <input
                value={handleInput}
                onChange={(event) => setHandleInput(event.target.value)}
                placeholder="Handle (e.g. @story)"
                className="w-full rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
              />
              <input
                value={displayNameInput}
                onChange={(event) => setDisplayNameInput(event.target.value)}
                placeholder="Display name"
                className="w-full rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
              />
              <textarea
                value={bioInput}
                onChange={(event) => setBioInput(event.target.value)}
                rows={3}
                placeholder="Short bio"
                className="w-full rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
              />
              <button
                type="button"
                onClick={saveProfileEdits}
                disabled={savingProfile}
                className="w-full rounded-3xl bg-[var(--accent)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black"
              >
                {savingProfile ? 'Saving…' : 'Save profile'}
              </button>
            </div>
          )}
          {actionMessage && <p className="text-xs text-[var(--text-muted)]">{actionMessage}</p>}
        </section>
      </div>
    </AppShell>
  )
}
