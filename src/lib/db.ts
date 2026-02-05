import { supabaseServer } from './supabase-server'

export type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_url: string | null
  category: string | null
  tags: string[] | null
  content: string
  published_at: string | null
  created_at: string
  author_name: string | null
}

export async function getPublishedPosts({
  search,
  tag,
  category
}: {
  search?: string
  tag?: string
  category?: string
} = {}) {
  let query = supabaseServer
    .from('posts')
    .select(
      'id, title, slug, excerpt, cover_url, category, tags, content, published_at, created_at, author_name'
    )
    .order('published_at', { ascending: false })
    .limit(30)

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }
  if (tag) {
    query = query.contains('tags', [tag])
  }
  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) {
    console.error('Fetching posts failed', error)
    return []
  }
  return (data ?? []) as Post[]
}

export async function getPostBySlug(slug: string) {
  const { data, error } = await supabaseServer
    .from('posts')
    .select('id, title, slug, excerpt, cover_url, category, tags, content, published_at, created_at, author_name')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('loading post failed', error)
    return null
  }

  return data as Post
}

export async function getCategories() {
  const { data, error } = await supabaseServer.from('categories').select('name').order('name')
  if (error) {
    console.error(error)
    return []
  }
  return data.map((row) => row.name as string)
}

export async function getTags() {
  const { data, error } = await supabaseServer.from('tags').select('name').order('name')
  if (error) {
    console.error(error)
    return []
  }
  return data.map((row) => row.name as string)
}

export async function getComments(postId: string) {
  const { data, error } = await supabaseServer
    .from('comments')
    .select('id, author_name, body, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  if (error) {
    console.error('Fetching comments failed', error)
    return []
  }
  return data
}

export type LiveStatsSummary = {
  totalPosts: number
  totalComments: number
  totalBookmarks: number
}

export async function getLiveStats(): Promise<LiveStatsSummary> {
  const [postsResult, commentsResult, bookmarksResult] = await Promise.all([
    supabaseServer.from('posts').select('id', { head: true, count: 'exact' }),
    supabaseServer.from('comments').select('id', { head: true, count: 'exact' }),
    supabaseServer.from('bookmarks').select('id', { head: true, count: 'exact' })
  ])

  if (postsResult.error) {
    console.error('Live stats posts count failed', postsResult.error)
  }
  if (commentsResult.error) {
    console.error('Live stats comments count failed', commentsResult.error)
  }
  if (bookmarksResult.error) {
    console.error('Live stats bookmarks count failed', bookmarksResult.error)
  }

  return {
    totalPosts: postsResult.count ?? 0,
    totalComments: commentsResult.count ?? 0,
    totalBookmarks: bookmarksResult.count ?? 0
  }
}
