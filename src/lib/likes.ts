import { createServerSupabaseClient } from './supabase'

export async function getLikeCount(articleId: string) {
  const supabase = createServerSupabaseClient()
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('article_id', articleId)

  if (error) throw error
  return count ?? 0
}

export async function hasLiked(articleId: string, fingerprint: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('article_id', articleId)
    .eq('fingerprint', fingerprint)
    .maybeSingle()

  if (error) throw error
  return !!data
}

export async function toggleLike(articleId: string, fingerprint: string) {
  const supabase = createServerSupabaseClient()

  // 走数据库 toggle_like 函数（SECURITY DEFINER）：匿名无直接写删权限，
  // 只能按 article_id + fingerprint 成对点赞/取消
  const { data, error } = await supabase.rpc('toggle_like', {
    p_article_id: articleId,
    p_fingerprint: fingerprint,
  })
  if (error) throw error
  return { liked: data === true }
}
