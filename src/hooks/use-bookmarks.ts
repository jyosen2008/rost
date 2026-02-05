'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabaseClient } from '@/lib/supabase-client'

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const fetchBookmarks = useCallback(async (uid: string | null) => {
    if (!uid) {
      if (!mountedRef.current) return
      setBookmarks([])
      setUserId(null)
      return
    }

    const { data, error } = await supabaseClient
      .from('bookmarks')
      .select('post_id')
      .eq('user_id', uid)

    if (!mountedRef.current) return

    if (error) {
      console.error('Loading bookmarks failed', error)
      setBookmarks([])
      setUserId(uid)
      return
    }

    setBookmarks(data.map((row) => row.post_id))
    setUserId(uid)
  }, [])

  useEffect(() => {
    mountedRef.current = true

    const load = async () => {
      const { data } = await supabaseClient.auth.getSession()
      if (!mountedRef.current) return
      await fetchBookmarks(data.session?.user.id ?? null)
    }

    load()

    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!mountedRef.current) return
      fetchBookmarks(session?.user.id ?? null)
    })

    return () => {
      mountedRef.current = false
      listener.subscription.unsubscribe()
    }
  }, [fetchBookmarks])

  const toggleBookmark = useCallback(
    async (postId: string) => {
      if (!userId || !mountedRef.current) {
        return
      }

      const alreadyBookmarked = bookmarks.includes(postId)

      if (alreadyBookmarked) {
        const { error } = await supabaseClient
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId)

        if (!error && mountedRef.current) {
          setBookmarks((prev) => prev.filter((id) => id !== postId))
        } else if (error) {
          console.error('Removing bookmark failed', error)
        }
        return
      }

      const { error } = await supabaseClient.from('bookmarks').insert({
        user_id: userId,
        post_id: postId
      })

      if (!error && mountedRef.current) {
        setBookmarks((prev) => [...prev, postId])
      } else if (error) {
        console.error('Saving bookmark failed', error)
      }
    },
    [bookmarks, userId]
  )

  return { bookmarks, toggleBookmark }
}
