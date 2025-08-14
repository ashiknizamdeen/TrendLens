import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { Article } from '@/types/article'

const parser = new Parser()

// Rate limiting - simple in-memory store (use Redis in production)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT = 60 // requests per minute
const RATE_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(ip)
  
  if (!userLimit) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return true
  }
  
  if (now - userLimit.timestamp > RATE_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return true
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false
  }
  
  userLimit.count++
  return true
}

// Cache for articles (5 minutes)
let articlesCache: { data: Article[]; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const newsSources = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'startup'
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'all'
  },
  {
    name: 'Hacker News',
    url: 'https://feeds.feedburner.com/hacker-news-feed-50',
    category: 'all'
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'all'
  },
  {
    name: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    category: 'all'
  },
  {
    name: 'Krebs on Security',
    url: 'https://krebsonsecurity.com/feed/',
    category: 'security'
  },
  {
    name: 'DevOps.com',
    url: 'https://devops.com/feed/',
    category: 'devtools'
  },
  {
    name: 'VentureBeat',
    url: 'https://feeds.feedburner.com/venturebeat/SZYF',
    category: 'startup'
  },
  {
    name: 'ZDNet',
    url: 'https://www.zdnet.com/news/rss.xml',
    category: 'all'
  },
  {
    name: 'TechRadar',
    url: 'https://www.techradar.com/rss',
    category: 'all'
  }
]

// Simple sentiment analysis (in production, need to use a proper ML service)
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['launch', 'funding', 'breakthrough', 'success', 'growth', 'innovation', 'improve']
  const negativeWords = ['breach', 'hack', 'fail', 'problem', 'issue', 'outage', 'down', 'crisis']
  
  const lowerText = text.toLowerCase()
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

function categorizeArticle(title: string, content: string): string {
  const text = (title + ' ' + content).toLowerCase()
  
  // AI/ML - highest priority for AI-related terms
  if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('machine learning') || 
      text.includes('deep learning') || text.includes('neural network') || text.includes('chatgpt') || 
      text.includes('openai') || text.includes('llm') || text.includes('gpt')) return 'ai'
  
  // Security - cybersecurity terms
  if (text.includes('security') || text.includes('breach') || text.includes('hack') || 
      text.includes('cyber') || text.includes('vulnerability') || text.includes('malware') || 
      text.includes('ransomware') || text.includes('phishing')) return 'security'
  
  // Startups - funding and business terms
  if (text.includes('startup') || text.includes('funding') || text.includes('investment') || 
      text.includes('series a') || text.includes('series b') || text.includes('venture') || 
      text.includes('ipo') || text.includes('acquisition')) return 'startup'
  
  // DevTools/DevOps - development and operations
  if (text.includes('devops') || text.includes('kubernetes') || text.includes('docker') || 
      text.includes('ci/cd') || text.includes('deployment') || text.includes('dev') || 
      text.includes('code') || text.includes('programming') || text.includes('api') || 
      text.includes('framework') || text.includes('open source')) return 'devtools'
  
  // Mobile - mobile platforms
  if (text.includes('mobile') || text.includes('ios') || text.includes('android') || 
      text.includes('iphone') || text.includes('smartphone') || text.includes('app store')) return 'mobile'
  
  // Cloud - cloud computing
  if (text.includes('cloud') || text.includes('aws') || text.includes('azure') || 
      text.includes('google cloud') || text.includes('saas') || text.includes('paas')) return 'cloud'
  
  // Gaming
  if (text.includes('game') || text.includes('gaming') || text.includes('esports') || 
      text.includes('playstation') || text.includes('xbox') || text.includes('nintendo')) return 'gaming'
  
  // Crypto
  if (text.includes('crypto') || text.includes('bitcoin') || text.includes('blockchain') || 
      text.includes('ethereum') || text.includes('web3') || text.includes('nft')) return 'crypto'
  
  // Data - databases and data science
  if (text.includes('database') || text.includes('data') || text.includes('analytics') || 
      text.includes('big data') || text.includes('sql') || text.includes('nosql')) return 'data'
  
  return 'all'
}

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Check cache first
    const now = Date.now()
    if (articlesCache && (now - articlesCache.timestamp) < CACHE_DURATION) {
      return NextResponse.json(articlesCache.data)
    }

    const articles: Article[] = []
    const promises = newsSources.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.url)
        
        const sourceArticles = feed.items.slice(0, 10).filter((item) => item.title && item.link).map((item) => {
          // Clean and process content
          const cleanContent = item.content?.replace(/<[^>]*>/g, '').trim() || ''
          const cleanSummary = item.contentSnippet?.replace(/<[^>]*>/g, '').trim() || ''

          return {
            id: generateUniqueId(source.name, item.link!, item.title!),
            title: item.title!.trim(),
            summary: cleanSummary || cleanContent.substring(0, 200) + '...',
            content: cleanContent || cleanSummary,
            link: item.link!,
            source: source.name,
            publishedAt: item.pubDate || new Date().toISOString(),
            category: categorizeArticle(item.title!, cleanSummary),
            sentiment: analyzeSentiment(item.title! + ' ' + cleanSummary),
            image: item.enclosure?.url || extractImageFromContent(item.content)
          } as Article
        })

        return sourceArticles
      } catch (sourceError) {
        console.error(`Error fetching from ${source.name}:`, sourceError)
        return []
      }
    })

    // Wait for all sources with timeout
    const results = await Promise.allSettled(promises)
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        articles.push(...result.value)
      }
    })

    // Sort by publish date and deduplicate
    const uniqueArticles = Array.from(
      new Map(articles.map(article => [article.link, article])).values()
    )
    uniqueArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    // Cache the results
    articlesCache = { data: uniqueArticles, timestamp: now }

    return NextResponse.json(uniqueArticles)
  } catch (error) {
    console.error('News API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}

function generateUniqueId(sourceName: string, link: string, title: string): string {
  // Create a simple hash from the link and title
  const hashString = (link + title).replace(/[^a-zA-Z0-9]/g, '')
  let hash = 0
  for (let i = 0; i < hashString.length; i++) {
    const char = hashString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Create unique ID with timestamp and random component
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  
  return `${sourceName.replace(/[^a-zA-Z0-9]/g, '')}-${Math.abs(hash).toString(36)}-${timestamp}-${random}`
}

function extractImageFromContent(content: string | undefined): string | undefined {
  if (!content) return undefined
  
  const imgRegex = /<img[^>]+src="([^">]+)"/i
  const match = content.match(imgRegex)
  return match ? match[1] : undefined
}