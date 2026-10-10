export interface Article {
  id: string
  title: string
  content: string
  cover_url: string | null
  category: 'article' | 'daily' | 'operation'
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export type CategoryType = 'article' | 'daily' | 'operation'

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  article: '文章',
  daily: '盘解',
  operation: '操作记录',
}
