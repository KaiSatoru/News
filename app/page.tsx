'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Article, Category, NewsResponse } from '@/types/news'
import CategoryFilter from '@/components/CategoryFilter'
import NewsCard from '@/components/NewsCard'

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [category, setCategory] = useState<Category>('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000)
  const countdownRef = useRef<NodeJS.Timeout>()
  const refreshRef = useRef<NodeJS.Timeout>()

  const fetchNews = useCallback(
    async (reset = false) => {
      const currentPage = reset ? 1 : page

      if (reset) {
        setLoading(true)
        setPage(1)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      try {
        const params = new URLSearchParams({
          category,
          page: String(currentPage),
          ...(search ? { q: search } : {}),
        })
        const res = await fetch(`/api/news?${params}`)
        if (!res.ok) throw new Error('Failed to fetch news')
        const data: NewsResponse = await res.json()

        if (reset || currentPage === 1) {
          setArticles(data.articles)
        } else {
          setArticles((prev) => [...prev, ...data.articles])
        }
        setTotalPages(data.totalPages)
        setTotal(data.total)
        setLastUpdated(new Date())
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [category, search, page]
  )

  // Reset & fetch when category or search changes
  useEffect(() => {
    fetchNews(true)
  }, [category, search]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh every 5 minutes
  useEffect(() => {
    setCountdown(REFRESH_INTERVAL / 1000)

    // Countdown timer
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return REFRESH_INTERVAL / 1000
        return prev - 1
      })
    }, 1000)

    // Actual refresh
    refreshRef.current = setInterval(() => {
      fetchNews(true)
    }, REFRESH_INTERVAL)

    return () => {
      clearInterval(countdownRef.current)
      clearInterval(refreshRef.current)
    }
  }, [category, search]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    // Fetch with next page
    const params = new URLSearchParams({
      category,
      page: String(nextPage),
      ...(search ? { q: search } : {}),
    })
    setLoadingMore(true)
    fetch(`/api/news?${params}`)
      .then((r) => r.json())
      .then((data: NewsResponse) => {
        setArticles((prev) => [...prev, ...data.articles])
        setTotalPages(data.totalPages)
      })
      .finally(() => setLoadingMore(false))
  }

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const featuredArticle = articles[0]
  const gridArticles = articles.slice(1)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1f1f1f] bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌍</span>
                <div>
                  <h1 className="text-lg font-bold text-white leading-none">World News</h1>
                  <p className="text-xs text-gray-500">Live updates from global sources</p>
                </div>
              </div>
              {/* Live indicator */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-red-400 font-medium">LIVE</span>
              </div>
            </div>

            {/* Right: stats + search */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {lastUpdated && (
                <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                  <span>Refreshes in</span>
                  <span className="font-mono text-blue-400">{formatCountdown(countdown)}</span>
                </div>
              )}
              <div className="relative flex-1 sm:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="sticky top-[73px] z-40 border-b border-[#1f1f1f] bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <CategoryFilter
            selected={category}
            onChange={(cat) => {
              setCategory(cat)
              setPage(1)
            }}
          />
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Status bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {!loading && (
              <span className="text-sm text-gray-400">
                <span className="text-white font-medium">{total.toLocaleString()}</span> articles
                {search && (
                  <span>
                    {' '}
                    for <span className="text-blue-400">"{search}"</span>
                  </span>
                )}
              </span>
            )}
          </div>
          <button
            onClick={() => fetchNews(true)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg transition-all disabled:opacity-50"
          >
            <span className={loading ? 'animate-spin' : ''}>↻</span>
            Refresh
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
            <span className="text-red-400 text-lg">⚠️</span>
            <div>
              <p className="text-red-300 font-medium text-sm">Failed to load news</p>
              <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => fetchNews(true)}
              className="ml-auto text-xs text-red-400 hover:text-red-300 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            <div className="h-52 bg-[#1a1a1a] rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-[#1a1a1a] rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* Articles */}
        {!loading && articles.length > 0 && (
          <div className="space-y-6">
            {/* Featured article */}
            {featuredArticle && <NewsCard article={featuredArticle} featured />}

            {/* Article grid */}
            {gridArticles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gridArticles.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {/* Load more */}
            {page < totalPages && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-blue-500/50 hover:bg-[#1f1f1f] text-sm text-gray-300 hover:text-white rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <span className="w-4 h-4 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>Load more articles</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && articles.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="text-6xl">📭</span>
            <h3 className="text-lg font-medium text-gray-300">No articles found</h3>
            <p className="text-sm text-gray-500 text-center max-w-xs">
              {search
                ? `No results for "${search}". Try a different keyword.`
                : 'No articles yet. The cron job will populate news every hour.'}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f1f1f] mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <span>🌍 World News — Powered by RSS feeds</span>
          <span>
            Sources: BBC, Reuters, Al Jazeera, CNN, Guardian, TechCrunch, Wired & more
          </span>
          {lastUpdated && (
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>
      </footer>
    </div>
  )
}
