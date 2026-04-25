'use client'

import { useEffect, useState } from 'react'

type StreakState = {
  days: number
  lastVisit: string
  postsDrafted: number
}

const todayKey = () => new Date().toISOString().slice(0, 10)

const daysBetween = (a: string, b: string) => {
  const one = new Date(`${a}T00:00:00`).getTime()
  const two = new Date(`${b}T00:00:00`).getTime()
  return Math.round((two - one) / 86400000)
}

export function useRostStreak() {
  const [streak, setStreak] = useState<StreakState>({ days: 1, lastVisit: todayKey(), postsDrafted: 0 })

  useEffect(() => {
    const raw = window.localStorage.getItem('rost-streak')
    const today = todayKey()
    const saved = raw ? (JSON.parse(raw) as StreakState) : null
    const next: StreakState = saved
      ? {
          ...saved,
          days: saved.lastVisit === today ? saved.days : daysBetween(saved.lastVisit, today) === 1 ? saved.days + 1 : 1,
          lastVisit: today
        }
      : { days: 1, lastVisit: today, postsDrafted: 0 }

    window.localStorage.setItem('rost-streak', JSON.stringify(next))
    setStreak(next)
  }, [])

  const markDraft = () => {
    setStreak((prev) => {
      const next = { ...prev, postsDrafted: prev.postsDrafted + 1 }
      window.localStorage.setItem('rost-streak', JSON.stringify(next))
      return next
    })
  }

  return { streak, markDraft }
}
