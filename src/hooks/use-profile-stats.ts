'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabaseClient } from '@/lib/supabase-client'

export type ProfileRow = {
  user_id: string
  handle: string
  display_name: string
  avatar_url: string | null
  bio: string | null
}

export type FollowListItem = {
  user_id: string
  handle: string
  display_name: string
  avatar_url: string | null
}

type Stats = {
  posts: number
  followers: number
  following: number
}

export function useProfileStats(userId: string | null) {
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [stats, setStats] = useState<Stats>({ posts: 0, followers: 0, following: 0 })
  const [loading, setLoading] = useState(true)
  const [followers, setFollowers] = useState<FollowListItem[]>([])
  const [following, setFollowing] = useState<FollowListItem[]>([])

  const load = useCallback(async () => {
    if (!userId) {
      setProfile(null)
      setStats({ posts: 0, followers: 0, following: 0 })
      setFollowers([])
      setFollowing([])
      setLoading(false)
      return
    }

    setLoading(true)

    const [profileResult, followersResult, followingResult, postsCountResult] = await Promise.all([
      supabaseClient.from('profiles').select('user_id, handle, display_name, avatar_url, bio').eq('user_id', userId).maybeSingle(),
      supabaseClient.from('follows').select('follower_id').eq('following_id', userId),
      supabaseClient.from('follows').select('following_id').eq('follower_id', userId),
      supabaseClient.from('posts').select('id', { head: true, count: 'exact' }).eq('author_id', userId)
    ])

    if (profileResult.error) console.error('Loading profile failed', profileResult.error)
    if (followersResult.error) console.error('Loading followers ids failed', followersResult.error)
    if (followingResult.error) console.error('Loading following ids failed', followingResult.error)
    if (postsCountResult.error) console.error('Loading posts count failed', postsCountResult.error)

    const followerIds = (followersResult.data ?? []).map((row) => row.follower_id as string)
    const followingIds = (followingResult.data ?? []).map((row) => row.following_id as string)

    const [followersProfiles, followingProfiles] = await Promise.all([
      followerIds.length
        ? supabaseClient
            .from('profiles')
            .select('user_id, handle, display_name, avatar_url')
            .in('user_id', followerIds)
            .order('display_name')
        : Promise.resolve({ data: [], error: null } as any),
      followingIds.length
        ? supabaseClient
            .from('profiles')
            .select('user_id, handle, display_name, avatar_url')
            .in('user_id', followingIds)
            .order('display_name')
        : Promise.resolve({ data: [], error: null } as any)
    ])

    if (followersProfiles.error) console.error('Loading followers profiles failed', followersProfiles.error)
    if (followingProfiles.error) console.error('Loading following profiles failed', followingProfiles.error)

    setProfile((profileResult.data as any) ?? null)
    setStats({
      posts: postsCountResult.count ?? 0,
      followers: followerIds.length,
      following: followingIds.length
    })
    setFollowers(((followersProfiles.data as any) ?? []) as FollowListItem[])
    setFollowing(((followingProfiles.data as any) ?? []) as FollowListItem[])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  return useMemo(
    () => ({ profile, stats, followers, following, loading, refresh: load }),
    [profile, stats, followers, following, loading, load]
  )
}
