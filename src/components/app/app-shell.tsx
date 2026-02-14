'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/app/sidebar'
import SearchModal from '@/components/search-modal'
import { useSession } from '@/hooks/use-session'

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useSession()
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/')
    }
  }, [loading, user, router])

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="grid gap-6 lg:grid-cols-[72px,1fr]">
        <Sidebar onSearchClick={() => setSearchOpen(true)} />
        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </>
  )
}
