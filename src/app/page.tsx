import dynamic from 'next/dynamic'
import { getCategories, getLiveStats, getPublishedPosts, getTags } from '@/lib/db'

const HomeClient = dynamic(() => import('@/components/home-client'), {
  ssr: false
})

export default async function HomePage() {
  const [posts, categories, tags, liveStats] = await Promise.all([
    getPublishedPosts(),
    getCategories(),
    getTags(),
    getLiveStats()
  ])

  return <HomeClient posts={posts} categories={categories} tags={tags} liveStats={liveStats} />
}
