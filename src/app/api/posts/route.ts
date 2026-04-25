import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const uniqueSlug = (title: string) => {
  const base = slugify(title) || 'rost-post'
  return `${base}-${Date.now().toString(36)}`
}

export async function POST(request: NextRequest) {
  const { title, content, excerpt, category, tags, coverUrl, dropAt, authorId, authorName } = await request.json()

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  }

  const tagArray = Array.isArray(tags)
    ? tags.map((tag) => tag.trim()).filter(Boolean)
    : typeof tags === 'string'
    ? tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    : []

  const categoryKey = category?.trim() ? category : null
  const scheduledDate = dropAt ? new Date(dropAt) : null
  const publishedAt = scheduledDate && !Number.isNaN(scheduledDate.getTime())
    ? scheduledDate.toISOString()
    : new Date().toISOString()
  const { data, error } = await supabaseServer.from('posts').insert({
    title,
    slug: uniqueSlug(title),
    content,
    excerpt,
    category: categoryKey,
    tags: tagArray,
    cover_url: coverUrl,
    published_at: publishedAt,
    author_id: authorId ?? null,
    author_name: authorName ?? null
  }).select('id, title, slug, excerpt, cover_url, category, tags, content, published_at, created_at, author_name, author_id')

  if (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ post: data?.[0] ?? null }, { status: 201 })
}
