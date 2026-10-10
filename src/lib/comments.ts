import { createServerSupabaseClient } from './supabase'

export interface Comment {
  id: string
  article_id: string
  parent_id: string | null
  nickname: string
  content: string
  created_at: string
}

export interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[]
}

export async function getComments(articleId: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return buildTree((data as Comment[]) ?? [])
}

function buildTree(comments: Comment[]): CommentWithReplies[] {
  const map = new Map<string, CommentWithReplies>()
  const roots: CommentWithReplies[] = []

  for (const c of comments) {
    map.set(c.id, { ...c, replies: [] })
  }

  for (const c of comments) {
    const node = map.get(c.id)!
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

export async function createComment(
  articleId: string,
  nickname: string,
  content: string,
  parentId?: string
) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('comments')
    .insert({
      article_id: articleId,
      nickname,
      content,
      parent_id: parentId || null,
    })
    .select()
    .single()

  if (error) throw error
  return data as Comment
}
