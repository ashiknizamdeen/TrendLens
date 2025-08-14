'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp, Eye, MessageCircle, Share, Users } from 'lucide-react'
import { useNewsStore } from '@/store/news-store'

export default function TrendingAnalytics() {
  const [isOpen, setIsOpen] = useState(false)
  const [, setIsClosing] = useState(false)
  const { trendingTopics, articles } = useNewsStore()

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 300)
  }

  const getTopicAnalytics = (topic: string) => {
    const articlesWithTopic = articles.filter(article => 
      article.title.toLowerCase().includes(topic.toLowerCase()) ||
      article.summary.toLowerCase().includes(topic.toLowerCase())
    )
    
    return {
      articleCount: articlesWithTopic.length,
      views: Math.floor(Math.random() * 1000) + 100,
      engagement: Math.floor(Math.random() * 50) + 10,
      sentiment: Math.random() > 0.5 ? 'positive' : 'neutral'
    }
  }

  const getCategoryStats = () => {
    const categories = ['ai', 'startup', 'security', 'mobile', 'devtools', 'gaming', 'crypto', 'cloud', 'data']
    return categories.map(category => ({
      name: category,
      count: articles.filter(article => article.category === category).length,
      growth: Math.floor(Math.random() * 30) - 10 // -10 to +20
    }))
  }

  const getSentimentDistribution = () => {
    const sentiments = articles.reduce((acc, article) => {
      acc[article.sentiment] = (acc[article.sentiment] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const total = articles.length
    return Object.entries(sentiments).map(([sentiment, count]) => ({
      sentiment,
      count,
      percentage: Math.round((count / total) * 100)
    }))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
          isOpen ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-text)]'
        }`}
        style={{ 
          backgroundColor: isOpen ? 'var(--primary)' : 'var(--muted)',
          color: isOpen ? 'white' : 'var(--muted-text)',
          border: '1px solid var(--border)'
        }}
      >
        <BarChart3 className="w-4 h-4" />
        <span className="text-sm font-medium">Analytics</span>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-96 max-h-[80vh] rounded-xl shadow-2xl z-50 animate-scale-in"
          style={{ 
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0" 
               style={{ 
                 borderColor: 'var(--border)',
                 backgroundColor: 'var(--card-bg)'
               }}>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                Analytics Overview
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full transition-all duration-200 hover:bg-[var(--muted)] hover:scale-110 group"
              style={{ backgroundColor: 'transparent' }}
            >
              <svg 
                className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" 
                style={{ color: 'var(--muted-text)' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <div 
            className="overflow-y-auto p-4 space-y-4" 
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              maxHeight: 'calc(80vh - 80px)'
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
              {/* Overview Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--muted-text)' }}>Total Articles</span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{articles.length}</div>
                </div>
                
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--muted-text)' }}>Trending Topics</span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{trendingTopics.length}</div>
                </div>
                
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--muted-text)' }}>Engagement</span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {Math.floor(Math.random() * 500) + 200}
                  </div>
                </div>
                
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Share className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--muted-text)' }}>Shares</span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {Math.floor(Math.random() * 150) + 50}
                  </div>
                </div>
              </div>

              {/* Trending Topics Analytics */}
              <div className="space-y-4">
                <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                    <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    Topic Performance
                  </h4>
                  <div className="space-y-2">
                    {trendingTopics.slice(0, 3).map((topic) => {
                      const analytics = getTopicAnalytics(topic)
                      return (
                        <div key={topic} className="flex items-center justify-between p-2 rounded" 
                             style={{ backgroundColor: 'var(--muted)' }}>
                          <div>
                            <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>#{topic}</div>
                            <div className="text-xs" style={{ color: 'var(--muted-text)' }}>
                              {analytics.articleCount} articles
                            </div>
                          </div>
                          <div className="text-xs font-medium text-green-500">
                            +{analytics.engagement}%
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Category Distribution */}
                <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                    <BarChart3 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    Categories
                  </h4>
                  <div className="space-y-2">
                    {getCategoryStats().slice(0, 4).map((category) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <span className="text-sm capitalize" style={{ color: 'var(--foreground)' }}>
                          {category.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: 'var(--muted)' }}>
                            <div 
                              className="h-full rounded-full"
                              style={{ 
                                backgroundColor: 'var(--primary)',
                                width: `${Math.min((category.count / articles.length) * 100, 100)}%`
                              }}
                            />
                          </div>
                          <span className="text-xs w-4 text-right" style={{ color: 'var(--muted-text)' }}>
                            {category.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sentiment Analysis */}
              <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                  <MessageCircle className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  Sentiment
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {getSentimentDistribution().map((item) => (
                    <div key={item.sentiment} className="text-center p-2 rounded" style={{ backgroundColor: 'var(--muted)' }}>
                      <div className={`text-lg font-bold ${
                        item.sentiment === 'positive' ? 'text-green-500' :
                        item.sentiment === 'negative' ? 'text-red-500' : 'text-yellow-500'
                      }`}>
                        {item.percentage}%
                      </div>
                      <div className="text-xs capitalize" style={{ color: 'var(--muted-text)' }}>
                        {item.sentiment}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }