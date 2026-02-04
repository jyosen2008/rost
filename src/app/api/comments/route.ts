import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const { postId, body, authorName } = await request.json()

  if (!postId || !body || !authorName) {
    return NextResponse.json({ error: 'postId, author name, and body are required' }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from('comments')
    .insert({ post_id: postId, body, author_name: authorName })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ comment: data?.[0] ?? null }, { status: 201 })
}
