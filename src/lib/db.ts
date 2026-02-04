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
    console.error(error)
    return []
  }
  return data
}

export async function createPostAction(formData: FormData) {
  'use server'
  const title = formData.get('title')
  const excerpt = formData.get('excerpt')
  const content = formData.get('content')
  const category = formData.get('category')
  const tagList = formData.get('tags')
  const coverUrl = formData.get('coverUrl')

  if (!title || !content) {
    throw new Error('Title and content are required')
  }

  const { data, error } = await supabaseServer
    .from('posts')
    .insert({
      title,
      excerpt,
      content,
      category,
      tags: typeof tagList === 'string' ? tagList.split(',').map((tag) => tag.trim()) : null,
      cover_url: coverUrl,
      published_at: new Date().toISOString()
    })

  if (error) {
    throw new Error('Unable to create post: ' + error.message)
  }

  return data?.[0]
}

export async function addCommentAction(formData: FormData) {
  'use server'
  const postId = formData.get('postId') as string
  const body = formData.get('body') as string
  const authorName = formData.get('authorName') as string

  if (!postId || !body || !authorName) {
    throw new Error('postId, name, and comment body are required')
  }

  const { data, error } = await supabaseServer
    .from('comments')
    .insert({ post_id: postId, body, author_name: authorName })

  if (error) {
    throw new Error('Unable to save comment: ' + error.message)
  }

  return data?.[0]
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
    console.error(error)
    return []
  }
  return data
}
