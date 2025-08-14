import { create } from 'zustand'
import { Article } from '@/types/article'

interface NewsStore {
  articles: Article[]
  filteredArticles: Article[]
  trendingArticles: Article[]
  selectedCategory: string
  selectedTopic: string | null
  searchQuery: string
  timeFilter: string
  loading: boolean
  savedArticles: string[]
  selectedArticle: Article | null
  trendingTopics: string[]
  analytics: any
  showSavedView: boolean
  currentPage: number
  articlesPerPage: number
  hasMoreArticles: boolean
  isAutoRefreshEnabled: boolean
  refreshInterval: NodeJS.Timeout | null
  
  setArticles: (articles: Article[]) => void
  setSelectedCategory: (category: string) => void
  setSelectedTopic: (topic: string | null) => void
  setSearchQuery: (query: string) => void
  setTimeFilter: (filter: string) => void
  setLoading: (loading: boolean) => void
  toggleSavedArticle: (articleId: string) => void
  setSelectedArticle: (article: Article | null) => void
  fetchNews: () => Promise<void>
  filterArticles: () => void
  extractTrendingTopics: (articles: Article[]) => void
  getCategoryDisplayName: (category: string) => string
  setShowSavedView: (show: boolean) => void
  getSavedArticles: () => Article[]
  clearSavedArticles: () => void
  loadMoreArticles: () => void
  resetPagination: () => void
  getCurrentPageArticles: () => Article[]
  startAutoRefresh: () => void
  stopAutoRefresh: () => void
}

// Mock data for development
const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Fortify discloses breach impacting 2.1M developer accounts',
    summary: 'Compromised OAuth tokens enabled repo cloning; company rotates keys and launches investigation.',
    content: 'Security firm Fortify has disclosed a data breach affecting 2.1 million developer accounts...',
    link: 'https://example.com/fortify-breach',
    source: 'SecOps Daily',
    publishedAt: '2025-08-12T17:23:57.000Z',
    category: 'security',
    sentiment: 'neutral',
    image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&h=200&fit=crop'
  },
  {
    id: '2',
    title: 'AI startup raises $120M Series B funding round',
    summary: 'AuroraAI secures major funding to expand its autonomous agents platform across enterprise workflows.',
    content: 'Artificial intelligence startup AuroraAI has announced a significant $120M Series B funding round...',
    link: 'https://example.com/ai-startup-funding',
    source: 'TechBeat',
    publishedAt: '2025-08-12T20:23:00.000Z',
    category: 'ai',
    sentiment: 'positive',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop'
  },
  {
    id: '3',
    title: 'Cloud giant reports intermittent service disruptions',
    summary: 'Engineers point to a network control plane regression; customers report elevated error rates.',
    content: 'Major cloud service provider experienced widespread service disruptions affecting multiple regions...',
    link: 'https://example.com/cloud-outage',
    source: 'CloudWatch',
    publishedAt: '2025-08-12T19:23:00.000Z',
    category: 'cloud',
    sentiment: 'negative',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop'
  },
  {
    id: '4',
    title: 'DevTools 13 ships AI code completion features',
    summary: 'Latest release includes intelligent autocomplete, refactoring suggestions, and performance optimizations.',
    content: 'Popular development environment DevTools has released version 13 with enhanced AI capabilities...',
    link: 'https://example.com/devtools-ai',
    source: 'DevLog',
    publishedAt: '2025-08-12T18:23:00.000Z',
    category: 'devtools',
    sentiment: 'positive',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop'
  },
  {
    id: '5',
    title: 'Mobile chipmaker unveils 3nm processor architecture',
    summary: 'New silicon promises 40% better performance per watt with advanced AI acceleration capabilities.',
    content: 'Leading mobile processor manufacturer announced breakthrough 3nm chip architecture...',
    link: 'https://example.com/mobile-chip',
    source: 'MobileWire',
    publishedAt: '2025-08-12T16:23:00.000Z',
    category: 'mobile',
    sentiment: 'positive',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop'
  },
  {
    id: '6',
    title: 'Game studio adopts generative AI for asset creation',
    summary: 'Major gaming company implements AI workflows to accelerate texture and model generation.',
    content: 'Renowned game development studio has integrated generative AI tools into their production pipeline...',
    link: 'https://example.com/game-ai',
    source: 'GamePulse',
    publishedAt: '2025-08-12T15:23:00.000Z',
    category: 'gaming',
    sentiment: 'positive',
    image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=200&fit=crop'
  }
]

export const useNewsStore = create<NewsStore>((set, get) => ({
  articles: [],
  filteredArticles: [],
  trendingArticles: [],
  selectedCategory: 'all',
  selectedTopic: null,
  searchQuery: '',
  timeFilter: 'All time',
  loading: false,
  savedArticles: typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('trendlens-saved-articles') || '[]') 
    : [],
  selectedArticle: null,
  trendingTopics: ['startup', 'platform', 'agents', 'point', 'launches'],
  analytics: {},
  showSavedView: false,
  currentPage: 1,
  articlesPerPage: 12,
  hasMoreArticles: false,
  isAutoRefreshEnabled: false,
  refreshInterval: null,

  setArticles: (articles) => {
    set({ articles })
    get().filterArticles()
    get().extractTrendingTopics(articles)
  },

  extractTrendingTopics: (articles: Article[]) => {
    const topics = new Map<string, number>()
    
    articles.forEach(article => {
      const text = `${article.title} ${article.summary}`.toLowerCase()
      
      // Common tech keywords to track
      const keywords = [
        'ai', 'artificial intelligence', 'machine learning', 'ml',
        'startup', 'funding', 'investment', 'series',
        'cloud', 'aws', 'azure', 'kubernetes',
        'security', 'breach', 'hack', 'cyber',
        'mobile', 'ios', 'android', 'app',
        'crypto', 'bitcoin', 'blockchain', 'web3',
        'devtools', 'api', 'framework', 'open source',
        'gaming', 'vr', 'ar', 'metaverse', 'platform',
        'agents', 'automation', 'data', 'analytics'
      ]
      
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          topics.set(keyword, (topics.get(keyword) || 0) + 1)
        }
      })
    })
    
    // Get all available topics and shuffle them randomly
    const allTopics = Array.from(topics.keys())
    const fallbackTopics = ['ai', 'startup', 'cloud', 'security', 'mobile', 'platform', 'agents', 'devtools', 'crypto', 'data']
    const availableTopics = allTopics.length > 0 ? allTopics : fallbackTopics
    
    // Shuffle array and take first 5
    const shuffled = [...availableTopics].sort(() => Math.random() - 0.5)
    const trending = shuffled.slice(0, 5)
    
    set({ trendingTopics: trending })
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category, selectedTopic: null })
    get().resetPagination()
    get().filterArticles()
  },

  setSelectedTopic: (topic) => {
    set({ selectedTopic: topic })
    get().resetPagination()
    get().filterArticles()
  },

  getCategoryDisplayName: (category: string) => {
    const categoryMap: Record<string, string> = {
      'all': 'Trending',
      'ai': 'AI/ML tech',
      'startup': 'Startup',
      'security': 'Security',
      'mobile': 'Mobile tech',
      'devtools': 'DevTools',
      'gaming': 'Gaming',
      'crypto': 'Crypto',
      'cloud': 'Cloud tech',
      'data': 'Data tech'
    }
    return categoryMap[category] || 'Tech'
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
    get().resetPagination()
    get().filterArticles()
  },

  setTimeFilter: (filter) => {
    set({ timeFilter: filter })
    get().resetPagination()
    get().filterArticles()
  },

  setShowSavedView: (show) => {
    set({ showSavedView: show, selectedArticle: null })
    if (!show) get().filterArticles()
  },

  getSavedArticles: () => {
    const { articles, savedArticles } = get()
    return articles.filter(article => savedArticles.includes(article.id))
  },

  clearSavedArticles: () => {
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('trendlens-saved-articles')
    }
    
    set({ savedArticles: [] })
  },

  setLoading: (loading) => set({ loading }),

  toggleSavedArticle: (articleId) => {
    const { savedArticles } = get()
    const newSavedArticles = savedArticles.includes(articleId)
      ? savedArticles.filter(id => id !== articleId)
      : [...savedArticles, articleId]
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('trendlens-saved-articles', JSON.stringify(newSavedArticles))
    }
    
    set({ savedArticles: newSavedArticles })
  },

  setSelectedArticle: (article) => set({ selectedArticle: article }),

  fetchNews: async () => {
    set({ loading: true })
    
    try {
      const response = await fetch('/api/news', {
        cache: 'no-store',
        next: { revalidate: 300 } // 5 minutes cache
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const articles = await response.json()
      
      // Fallback to mock data if API fails or returns empty
      if (!Array.isArray(articles) || articles.length === 0) {
        console.warn('No articles from API, using mock data')
        set({ articles: mockArticles })
      } else {
        set({ articles })
      }
      
      get().filterArticles()
    } catch (error) {
      console.error('Failed to fetch news:', error)
      // Use mock data as fallback
      set({ articles: mockArticles })
      get().filterArticles()
    } finally {
      set({ loading: false })
    }
  },

  filterArticles: () => {
    const { articles, selectedCategory, selectedTopic, searchQuery, timeFilter } = get()
    
    let filtered = articles
    let trending = articles.slice(0, 6) // Top 6 articles for trending

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory)
      trending = trending.filter(article => article.category === selectedCategory)
    }

    // Filter by topic hashtag
    if (selectedTopic) {
      const topicQuery = selectedTopic.toLowerCase()
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(topicQuery) ||
        article.summary.toLowerCase().includes(topicQuery)
      )
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.source.toLowerCase().includes(query)
      )
    }

    // Filter by time
    if (timeFilter !== 'All time') {
      const now = new Date()
      const timeThresholds: Record<string, number> = {
        'Today': 24 * 60 * 60 * 1000,
        'This week': 7 * 24 * 60 * 60 * 1000,
        'This month': 30 * 24 * 60 * 60 * 1000,
      }
      
      const threshold = timeThresholds[timeFilter]
      if (threshold) {
        filtered = filtered.filter(article => 
          now.getTime() - new Date(article.publishedAt).getTime() < threshold
        )
      }
    }

    // Update pagination state
    const { currentPage, articlesPerPage } = get()
    const totalPages = Math.ceil(filtered.length / articlesPerPage)
    const hasMore = currentPage < totalPages

    set({ 
      filteredArticles: filtered, 
      trendingArticles: trending,
      hasMoreArticles: hasMore
    })
  },

  loadMoreArticles: () => {
    const { currentPage, hasMoreArticles } = get()
    if (hasMoreArticles) {
      set({ currentPage: currentPage + 1 })
      get().filterArticles()
    }
  },

  resetPagination: () => {
    set({ currentPage: 1 })
  },

  getCurrentPageArticles: () => {
    const { filteredArticles, currentPage, articlesPerPage } = get()
    const startIndex = 0
    const endIndex = currentPage * articlesPerPage
    return filteredArticles.slice(startIndex, endIndex)
  },

  startAutoRefresh: () => {
    const { refreshInterval } = get()
    if (refreshInterval) return // Already running

    set({ isAutoRefreshEnabled: true })
    const interval = setInterval(() => {
      get().fetchNews()
    }, 2 * 60 * 1000) // 2 minutes

    set({ refreshInterval: interval })
  },

  stopAutoRefresh: () => {
    const { refreshInterval } = get()
    if (refreshInterval) {
      clearInterval(refreshInterval)
      set({ refreshInterval: null, isAutoRefreshEnabled: false })
    }
  }
}))