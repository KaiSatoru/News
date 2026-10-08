import { Article, CATEGORIES } from '@/types/news'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'

interface NewsCardProps {
  article: Article
  featured?: boolean
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  world: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  technology: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  business: 'bg-green-500/20 text-green-300 border-green-500/30',
  science: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  health: 'bg-red-500/20 text-red-300 border-red-500/30',
  sports: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

export default function NewsCard({ article, featured = false }: NewsCardProps) {
  const timeAgo = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : 'Unknown time'

  const categoryConfig = CATEGORIES[article.category as keyof typeof CATEGORIES]
  const badgeColor = CATEGORY_BADGE_COLORS[article.category] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group flex flex-col bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden
        hover:border-[#3a3a3a] hover:bg-[#1f1f1f] hover:shadow-xl hover:shadow-black/40
        transition-all duration-200 animate-fade-in
        ${featured ? 'md:flex-row' : ''}
      `}
    >
      {/* Image */}
      <div
        className={`
          relative bg-[#111] overflow-hidden flex-shrink-0
          ${featured ? 'h-52 md:h-auto md:w-80' : 'h-44'}
        `}
      >
        <Image
          src={article.image_url || FALLBACK_IMAGE}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = FALLBACK_IMAGE
          }}
          sizes={featured ? '(max-width: 768px) 100vw, 320px' : '(max-width: 768px) 100vw, 33vw'}
          unoptimized
        />
        {/* Category badge overlay */}
        <div className="absolute top-3 left-3">
          <span
            className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
              border backdrop-blur-sm ${badgeColor}
            `}
          >
            {categoryConfig?.icon} {categoryConfig?.label || article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Source + time */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide truncate">
            {article.source}
          </span>
          <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo}</span>
        </div>

        {/* Title */}
        <h3
          className={`
            font-semibold text-white leading-snug group-hover:text-blue-300 transition-colors
            ${featured ? 'text-xl line-clamp-3' : 'text-sm line-clamp-2'}
          `}
        >
          {article.title}
        </h3>

        {/* Description */}
        {article.description && (
          <p className={`text-gray-400 text-xs leading-relaxed ${featured ? 'line-clamp-3' : 'line-clamp-2'}`}>
            {article.description}
          </p>
        )}

        {/* Read more */}
        <div className="mt-auto pt-2">
          <span className="text-xs text-blue-400 group-hover:text-blue-300 font-medium">
            Read more →
          </span>
        </div>
      </div>
    </a>
  )
}
