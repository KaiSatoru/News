export interface RSSSource {
  url: string
  name: string
  category: string
}

export const RSS_SOURCES: RSSSource[] = [
  // === WORLD ===
  {
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    name: 'BBC World',
    category: 'world',
  },
  {
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    name: 'Al Jazeera',
    category: 'world',
  },
  {
    url: 'https://feeds.theguardian.com/theguardian/world/rss',
    name: 'The Guardian',
    category: 'world',
  },
  {
    url: 'http://rss.cnn.com/rss/edition_world.rss',
    name: 'CNN World',
    category: 'world',
  },
  {
    url: 'https://feeds.reuters.com/reuters/topNews',
    name: 'Reuters',
    category: 'world',
  },

  // === TECHNOLOGY ===
  {
    url: 'https://techcrunch.com/feed/',
    name: 'TechCrunch',
    category: 'technology',
  },
  {
    url: 'https://www.wired.com/feed/rss',
    name: 'Wired',
    category: 'technology',
  },
  {
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    name: 'Ars Technica',
    category: 'technology',
  },
  {
    url: 'https://www.theverge.com/rss/index.xml',
    name: 'The Verge',
    category: 'technology',
  },

  // === BUSINESS ===
  {
    url: 'http://feeds.bbci.co.uk/news/business/rss.xml',
    name: 'BBC Business',
    category: 'business',
  },
  {
    url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
    name: 'Wall Street Journal',
    category: 'business',
  },
  {
    url: 'https://feeds.bloomberg.com/markets/news.rss',
    name: 'Bloomberg Markets',
    category: 'business',
  },

  // === SCIENCE ===
  {
    url: 'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
    name: 'BBC Science',
    category: 'science',
  },
  {
    url: 'https://www.sciencedaily.com/rss/top.xml',
    name: 'Science Daily',
    category: 'science',
  },
  {
    url: 'https://www.newscientist.com/feed/home/',
    name: 'New Scientist',
    category: 'science',
  },

  // === HEALTH ===
  {
    url: 'http://feeds.bbci.co.uk/news/health/rss.xml',
    name: 'BBC Health',
    category: 'health',
  },
  {
    url: 'https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml',
    name: 'WHO',
    category: 'health',
  },

  // === SPORTS ===
  {
    url: 'http://feeds.bbci.co.uk/sport/rss.xml',
    name: 'BBC Sport',
    category: 'sports',
  },
  {
    url: 'https://www.espn.com/espn/rss/news',
    name: 'ESPN',
    category: 'sports',
  },
]
