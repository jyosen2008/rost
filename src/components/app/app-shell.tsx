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
      <div className="grid gap-4 lg:grid-cols-[88px,1fr]">
        <Sidebar onSearchClick={() => setSearchOpen(true)} />
        <main className="min-w-0 space-y-6 pb-16 lg:pb-0">{children}</main>
      </div>
    </>
  )
}
