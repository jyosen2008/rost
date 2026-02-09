import dynamic from 'next/dynamic'
import { getCategories, getLiveStats, getPublishedPosts, getTags } from '@/lib/db'

const HomeFeedClient = dynamic(() => import('@/components/app/home-feed-client'), { ssr: false })

export default async function HomePage() {
  const [posts, categories, tags, liveStats] = await Promise.all([
    getPublishedPosts(),
    getCategories(),
    getTags(),
    getLiveStats()
  ])

  return <HomeFeedClient posts={posts} categories={categories} tags={tags} liveStats={liveStats} />
}
