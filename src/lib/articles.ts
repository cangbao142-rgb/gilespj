import { cache } from 'react'
import { createServerSupabaseClient, createBrowserSupabaseClient } from './supabase'
import type { Article, CategoryType } from './types'

// 服务端获取文章列表（SSR）
export async function getArticles({
  category,
  page = 1,
  pageSize = 10,
}: {
  category?: CategoryType | null
  page?: number
  pageSize?: number
} = {}) {
  const supabase = createServerSupabaseClient()
  let query = supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error
  return { data: data as Article[], total: count ?? 0 }
}

// 服务端获取单篇文章（cache 去重：generateMetadata 与页面同请求只查一次库）
export const getArticleById = cache(async (id: string) => {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Article
})

// 服务端获取今日盘解
export async function getTodayArticles(type: CategoryType = 'daily') {
  const supabase = createServerSupabaseClient()

  // 使用 UTC+8 时区
  const now = new Date()
  const offset = 8 * 60
  const local = new Date(now.getTime() + (offset + now.getTimezoneOffset()) * 60000)
  const y = local.getFullYear()
  const m = String(local.getMonth() + 1).padStart(2, '0')
  const d = String(local.getDate()).padStart(2, '0')
  const start = `${y}-${m}-${d}T00:00:00+08:00`
  const end = `${y}-${m}-${d}T23:59:59+08:00`

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('category', type)
    .gte('created_at', start)
    .lte('created_at', end)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Article[]
}

// 服务端获取统计数据
export async function getStats() {
  const supabase = createServerSupabaseClient()

  const [articlesRes, dailyRes, teachingRes] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('category', 'article'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('category', 'daily'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('category', 'teaching'),
  ])

  return {
    articles: articlesRes.count ?? 0,
    daily: dailyRes.count ?? 0,
    teaching: teachingRes.count ?? 0,
  }
}

// 格式化日期
export function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 截取摘要
export function getExcerpt(html: string, maxLen = 120) {
  const text = html.replace(/<[^>]+>/g, '')
  return text.length > maxLen ? text.substring(0, maxLen) + '...' : text
}
