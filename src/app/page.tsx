import dynamic from 'next/dynamic'
import { getCategories, getPublishedPosts, getTags } from '@/lib/db'

const HomeClient = dynamic(() => import('@/components/home-client'), {
  ssr: false
})

export default async function HomePage() {
  const [posts, categories, tags] = await Promise.all([
    getPublishedPosts(),
    getCategories(),
    getTags()
  ])

  return <HomeClient posts={posts} categories={categories} tags={tags} />
}
