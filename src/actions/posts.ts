'use server'

import { supabaseServer } from '@/lib/supabase-server'

export async function createPostAction(formData: FormData) {
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
