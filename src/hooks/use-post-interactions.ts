'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabaseClient } from '@/lib/supabase-client'

type InteractionState = {
  likeCounts: Record<string, number>
  likedPosts: string[]
  loading: boolean
  toggleLike: (postId: string) => Promise<void>
}

export function usePostInteractions(postIds: string[]): InteractionState {
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [likedPosts, setLikedPosts] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabaseClient.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setUserId(data.session?.user.id ?? null)
    })
    return () => {
      mounted = false
    }
  }, [])

  const fetchLikeCounts = useCallback(async () => {
    if (postIds.length === 0) {
      setLikeCounts({})
      return
    }
    const { data, error } = await supabaseClient
      .from('likes')
      .select('post_id')
      .in('post_id', postIds)

    if (error) {
      console.error('Loading like counts failed', error)
      return
    }

    const counts: Record<string, number> = {}
    data?.forEach((row) => {
      counts[row.post_id] = (counts[row.post_id] ?? 0) + 1
    })
    setLikeCounts(counts)
  }, [postIds])

  const fetchLikedPosts = useCallback(async () => {
    if (!userId || postIds.length === 0) {
      setLikedPosts([])
      return
    }
    const { data, error } = await supabaseClient
      .from('likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds)

    if (error) {
      console.error('Loading liked posts failed', error)
      return
    }

    setLikedPosts(data?.map((row) => row.post_id) ?? [])
  }, [postIds, userId])

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.allSettled([fetchLikeCounts(), fetchLikedPosts()]).then(() => {
      if (active) {
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [fetchLikeCounts, fetchLikedPosts])

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!userId) return
      const alreadyLiked = likedPosts.includes(postId)
      if (alreadyLiked) {
        const { error } = await supabaseClient
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)

        if (!error) {
          setLikedPosts((prev) => prev.filter((id) => id !== postId))
          setLikeCounts((prev) => ({
            ...prev,
            [postId]: Math.max((prev[postId] ?? 1) - 1, 0)
          }))
        }
        return
      }

      const { error } = await supabaseClient.from('likes').insert({ post_id: postId, user_id: userId })
      if (!error) {
        setLikedPosts((prev) => [...prev, postId])
        setLikeCounts((prev) => ({
          ...prev,
          [postId]: (prev[postId] ?? 0) + 1
        }))
      }
    },
    [likedPosts, userId]
  )

  return useMemo(
    () => ({
      likeCounts,
      likedPosts,
      loading,
      toggleLike
    }),
    [likeCounts, likedPosts, loading, toggleLike]
  )
}
