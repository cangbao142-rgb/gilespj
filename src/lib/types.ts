export type CategoryType = 'article' | 'daily' | 'teaching'

export interface Article {
  id: string
  title: string
  content: string
  cover_url: string | null
  category: CategoryType
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  article: '文章',
  daily: '盘解',
  teaching: '教学',
}
