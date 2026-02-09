'use client'

import dynamic from 'next/dynamic'

const Landing = dynamic(() => import('@/components/app/landing'), {
  ssr: false
})

export default function Page() {
  return <Landing />
}
