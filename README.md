# 🌍 World News — Auto-Update System

RSS-powered world news aggregator deployed on Vercel, backed by Supabase. Fetches from 19 global sources every hour — no AI, no API keys needed.

## Tech Stack

- **Next.js 14** (App Router) — Framework
- **Supabase** (PostgreSQL) — Database
- **Vercel Cron Jobs** — Auto-fetch every hour
- **RSS Parser** — Parse 19 free RSS feeds
- **Tailwind CSS** — Styling

## Sources Covered

| Category | Sources |
|---|---|
| 🗺️ World | BBC World, Al Jazeera, The Guardian, CNN, Reuters |
| 💻 Technology | TechCrunch, Wired, Ars Technica, The Verge |
| 📈 Business | BBC Business, Wall Street Journal, Bloomberg |
| 🔬 Science | BBC Science, Science Daily, New Scientist |
| ❤️ Health | BBC Health, WHO |
| ⚽ Sports | BBC Sport, ESPN |

---

## Setup Guide

### Step 1 — Create Supabase Table

Go to your Supabase project → **SQL Editor** → Run this SQL:

```sql
-- Create articles table
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT UNIQUE NOT NULL,
  image_url TEXT,
  source TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'world',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX articles_category_idx ON articles (category);
CREATE INDEX articles_published_at_idx ON articles (published_at DESC);
CREATE INDEX articles_title_idx ON articles USING gin(to_tsvector('english', title));

-- Cleanup function (keeps latest 1500 articles)
CREATE OR REPLACE FUNCTION cleanup_old_articles()
RETURNS VOID AS $$
BEGIN
  DELETE FROM articles
  WHERE id NOT IN (
    SELECT id FROM articles
    ORDER BY published_at DESC NULLS LAST
    LIMIT 1500
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access"
  ON articles FOR SELECT
  USING (true);

-- Allow service role to insert/update/delete
CREATE POLICY "Service role full access"
  ON articles FOR ALL
  USING (auth.role() = 'service_role');
```

### Step 2 — Get Supabase Credentials

Go to Supabase → **Project Settings** → **API**:

- `NEXT_PUBLIC_SUPABASE_URL` → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `anon` / `public` key
- `SUPABASE_SERVICE_ROLE_KEY` → `service_role` key (**keep secret!**)

### Step 3 — Deploy to Vercel

#### Option A: Via GitHub (Recommended)

1. Push this project to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Add environment variables (Step 4)
5. Deploy!

#### Option B: Via Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

### Step 4 — Set Environment Variables in Vercel

Go to Vercel → Your Project → **Settings** → **Environment Variables**:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `CRON_SECRET` | Any random string (e.g. run `openssl rand -base64 32`) |

### Step 5 — Trigger First Fetch

After deploying, manually trigger the first news fetch:

```
GET https://your-app.vercel.app/api/cron/fetch-news
Authorization: Bearer YOUR_CRON_SECRET
```

Or use curl:
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/fetch-news
```

After this, **Vercel Cron** will automatically run it every hour at `0 * * * *`.

---

## Project Structure

```
world-news/
├── app/
│   ├── page.tsx                    # Main dashboard (client)
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   └── api/
│       ├── cron/fetch-news/        # Cron job — fetch RSS → Supabase
│       └── news/                   # Query articles API
├── components/
│   ├── NewsCard.tsx                # Article card (featured + regular)
│   └── CategoryFilter.tsx          # Category tab bar
├── lib/
│   ├── supabase.ts                 # Supabase client
│   └── rss-sources.ts             # 19 RSS feed sources
├── types/
│   └── news.ts                    # TypeScript types + category config
├── vercel.json                     # Cron: every hour
└── .env.local.example             # Env variables template
```

## Features

- ✅ **Auto-fetch** every 1 hour via Vercel Cron
- ✅ **Auto-refresh** in browser every 5 minutes with countdown
- ✅ **19 RSS sources** across 6 categories
- ✅ **Search** across article titles
- ✅ **Category filtering** with article count
- ✅ **Featured article** hero card
- ✅ **Load more** pagination
- ✅ **No duplicates** — upsert by URL
- ✅ **Auto-cleanup** — keeps latest 1500 articles
- ✅ **Dark mode** dashboard
- ✅ **Zero AI, zero paid APIs**

## Local Development

```bash
npm install
cp .env.local.example .env.local
# fill in your credentials in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
