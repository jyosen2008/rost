import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'

async function getProfile(handle: string) {
  const normalizedHandle = handle.toLowerCase()
  const { data, error } = await supabaseServer
    .from('profiles')
    .select('user_id, handle, display_name, avatar_url, bio')
    .eq('handle', normalizedHandle)
    .maybeSingle()

  if (error) {
    console.error('Loading handle profile failed', error)
    return null
  }

  return data
}

async function getProfileStats(userId: string) {
  const [postsResult, followersResult, followingResult] = await Promise.all([
    supabaseServer
      .from('posts')
      .select('id', { head: true, count: 'exact' })
      .eq('author_id', userId),
    supabaseServer
      .from('follows')
      .select('id', { head: true, count: 'exact' })
      .eq('following_id', userId),
    supabaseServer
      .from('follows')
      .select('id', { head: true, count: 'exact' })
      .eq('follower_id', userId)
  ])

  if (postsResult.error) console.error('Live stats posts count failed', postsResult.error)
  if (followersResult.error) console.error('Live stats followers count failed', followersResult.error)
  if (followingResult.error) console.error('Live stats following count failed', followingResult.error)

  return {
    posts: postsResult.count ?? 0,
    followers: followersResult.count ?? 0,
    following: followingResult.count ?? 0
  }
}

export default async function HandleProfilePage({ params }: { params: { handle: string } }) {
  const handleParam = params.handle
  if (!handleParam) {
    notFound()
  }

  const profile = await getProfile(handleParam)
  if (!profile) {
    notFound()
  }

  const stats = await getProfileStats(profile.user_id)

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-6 text-peat shadow-2xl shadow-peat/30">
        <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.4em] text-[var(--text-subtle)]">
          <span>Profile</span>
          <span>·</span>
          <span>{profile.handle}</span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">
          {profile.display_name}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">@{profile.handle}</p>
        <p className="mt-3 max-w-3xl text-sm text-[var(--text-muted)]">
          {profile.bio || 'This storyteller hasn’t penned a bio yet, but their handle is ready when you are.'}
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
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/profile"
            className="rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-5 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-[var(--text-muted)]"
          >
            Edit profile
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-[var(--accent)] px-5 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-black"
          >
            Manage posts
          </Link>
        </div>
      </div>
    </section>
  )
}
