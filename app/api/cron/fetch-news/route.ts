import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { supabaseAdmin } from '@/lib/supabase'
import { RSS_SOURCES } from '@/lib/rss-sources'

type CustomItem = {
  'media:content'?: { $: { url: string } }
  'media:thumbnail'?: { $: { url: string } }
  enclosure?: { url: string }
}

const parser = new Parser<Record<string, unknown>, CustomItem>({
  timeout: 10000,
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      'enclosure',
    ],
  },
})

function extractImageUrl(item: Parser.Item & CustomItem): string | null {
  if (item['media:content']?.$.url) return item['media:content'].$.url
  if (item['media:thumbnail']?.$.url) return item['media:thumbnail'].$.url
  if (item.enclosure?.url) return item.enclosure.url
  // Try to parse image from content
  const content = item.content || ''
  const match = content.match(/<img[^>]+src="([^"]+)"/i)
  if (match) return match[1]
  return null
}

export async function GET(request: NextRequest) {
  // Vercel automatically passes CRON_SECRET as Bearer token
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = supabaseAdmin()
  const results: { source: string; count: number; error?: string }[] = []

  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url)

      const articles = feed.items
        .slice(0, 20)
        .map((item) => ({
          title: (item.title || '').trim().slice(0, 500),
          description: (item.contentSnippet || item.summary || '').trim().slice(0, 1000) || null,
          url: item.link || '',
          image_url: extractImageUrl(item),
          source: source.name,
          category: source.category,
          published_at: item.isoDate || null,
        }))
        .filter((a) => a.url && a.title)

      if (articles.length > 0) {
        const { error } = await db
          .from('articles')
          .upsert(articles, { onConflict: 'url', ignoreDuplicates: true })

        if (error) {
          results.push({ source: source.name, count: 0, error: error.message })
        } else {
          results.push({ source: source.name, count: articles.length })
        }
      }
    } catch (err) {
      results.push({
        source: source.name,
        count: 0,
        error: (err as Error).message,
      })
    }
  }

  // Cleanup: keep only the latest 1500 articles to prevent DB bloat
  await db.rpc('cleanup_old_articles')

  const totalFetched = results.reduce((sum, r) => sum + r.count, 0)
  const errors = results.filter((r) => r.error)

  return NextResponse.json({
    success: true,
    totalFetched,
    sources: results,
    errors: errors.length,
    timestamp: new Date().toISOString(),
  })
}
