import HomeClient from '@/components/home-client'
import { getCategories, getPublishedPosts, getTags } from '@/lib/db'

export default async function HomePage() {
  const [posts, categories, tags] = await Promise.all([
    getPublishedPosts(),
    getCategories(),
    getTags()
  ])

  return <HomeClient posts={posts} categories={categories} tags={tags} />
}
