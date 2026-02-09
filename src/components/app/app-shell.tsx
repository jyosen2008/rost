'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/app/sidebar'
import { useSession } from '@/hooks/use-session'

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/')
    }
  }, [loading, user, router])

  return (
    <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
      <Sidebar />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
