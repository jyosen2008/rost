import dynamic from 'next/dynamic'
import { getCategories, getLiveStats, getTags } from '@/lib/db'

const DashboardClient = dynamic(() => import('@/components/app/dashboard-client'), { ssr: false })

export default async function DashboardPage() {
  const [categories, tags, liveStats] = await Promise.all([getCategories(), getTags(), getLiveStats()])
  return <DashboardClient categories={categories} tags={tags} liveStats={liveStats} />
}
