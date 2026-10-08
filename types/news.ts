export interface Article {
  id: string
  title: string
  description: string | null
  url: string
  image_url: string | null
  source: string
  category: string
  published_at: string | null
  created_at: string
}

export type Category = 'all' | 'world' | 'technology' | 'business' | 'science' | 'sports' | 'health'

export interface NewsResponse {
  articles: Article[]
  total: number
  page: number
  totalPages: number
}

export interface CategoryConfig {
  label: string
  icon: string
  color: string
}

export const CATEGORIES: Record<Category, CategoryConfig> = {
  all: { label: 'All News', icon: '🌐', color: 'text-white' },
  world: { label: 'World', icon: '🗺️', color: 'text-blue-400' },
  technology: { label: 'Technology', icon: '💻', color: 'text-purple-400' },
  business: { label: 'Business', icon: '📈', color: 'text-green-400' },
  science: { label: 'Science', icon: '🔬', color: 'text-yellow-400' },
  health: { label: 'Health', icon: '❤️', color: 'text-red-400' },
  sports: { label: 'Sports', icon: '⚽', color: 'text-orange-400' },
}
