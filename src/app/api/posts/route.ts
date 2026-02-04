import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export async function POST(request: NextRequest) {
  const { title, content, excerpt, category, tags, coverUrl } = await request.json()

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  }

  const tagArray = Array.isArray(tags)
    ? tags.map((tag) => tag.trim()).filter(Boolean)
    : typeof tags === 'string'
    ? tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    : []

  const { data, error } = await supabaseServer.from('posts').insert({
    title,
    slug: slugify(title),
    content,
    excerpt,
    category,
    tags: tagArray,
    cover_url: coverUrl,
    published_at: new Date().toISOString()
  })

  if (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ post: data?.[0] ?? null }, { status: 201 })
}
