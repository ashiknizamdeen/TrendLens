'use client'

import { Clock, BookmarkPlus, ExternalLink, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Article } from '@/types/article'
import { useNewsStore } from '@/store/news-store'

interface NewsCardProps {
  article: Article
  onClick?: () => void
}

export default function NewsCard({ article, onClick }: NewsCardProps) {
  const { savedArticles, toggleSavedArticle, setSelectedArticle } = useNewsStore()
  const isSaved = savedArticles.includes(article.id)

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setSelectedArticle(article)
    if (onClick) {
      onClick()
    }
  }

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleSavedArticle(article.id)
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(article.link, '_blank', 'noopener,noreferrer')
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#10b981'
      case 'negative': return '#ef4444'
      default: return '#f59e0b'
    }
  }

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'rgba(16, 185, 129, 0.1)'
      case 'negative': return 'rgba(239, 68, 68, 0.1)'
      default: return 'rgba(245, 158, 11, 0.1)'
    }
  }

  const generatePlaceholderImage = (title: string, category: string) => {
    const gradients = {
      'ai': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'startup': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'security': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'mobile': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'devtools': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'gaming': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'crypto': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'cloud': 'linear-gradient(135deg, #a8caba 0%, #5d4e75 100%)',
      'data': 'linear-gradient(135deg, #667db6 0%, #0082c8 100%)',
      'default': 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)'
    }
    
    return gradients[category as keyof typeof gradients] || gradients.default
  }

  return (
    <article 
      className="news-card transition-smooth hover:scale-105 cursor-pointer min-h-[400px] flex flex-col"
      onClick={handleCardClick}
    >
      <div className="aspect-video overflow-hidden flex-shrink-0">
        {article.image ? (
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              // Show placeholder when image fails
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center text-white font-semibold text-lg"
                       style="background: ${generatePlaceholderImage(article.title, article.category)}">
                    <div class="text-center p-4">
                      <div class="text-2xl mb-2">${article.category.toUpperCase()}</div>
                      <div class="text-sm opacity-75">Tech News</div>
                    </div>
                  </div>
                `
              }
            }}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center text-white font-semibold text-lg"
            style={{ background: generatePlaceholderImage(article.title, article.category) }}
          >
            <div className="text-center p-4">
              <div className="text-2xl mb-2">{article.category.toUpperCase()}</div>
              <div className="text-sm opacity-75">Tech News</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span 
              className="text-xs font-medium px-2 py-1 rounded"
              style={{ 
                color: 'var(--primary-foreground)',
                backgroundColor: 'var(--primary)'
              }}
            >
              {article.source}
            </span>
            <div 
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
              style={{ 
                backgroundColor: getSentimentBg(article.sentiment),
                color: getSentimentColor(article.sentiment)
              }}
            >
              <TrendingUp className="w-3 h-3 flex-shrink-0" />
              <span className="leading-none">{article.sentiment}</span>
            </div>
          </div>
          
          <button
            onClick={handleSaveClick}
            className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
            style={{ 
              color: isSaved ? 'var(--primary)' : 'var(--muted-text)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              if (!isSaved) {
                e.currentTarget.style.backgroundColor = 'var(--muted)'
                e.currentTarget.style.color = 'var(--primary)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaved) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--muted-text)'
              }
            }}
          >
            <BookmarkPlus className="w-4 h-4" />
          </button>
        </div>
        
        <h3 
          className="font-semibold mb-3 line-clamp-2 leading-tight transition-colors cursor-pointer"
          style={{ color: 'var(--foreground)' }}
        >
          {article.title}
        </h3>
        
        <p 
          className="text-sm mb-4 line-clamp-3 leading-relaxed flex-grow"
          style={{ color: 'var(--muted-text)' }}
        >
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between text-xs mt-auto" style={{ color: 'var(--muted-text)' }}>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="leading-none">{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
          </div>
          
          <button 
            onClick={handleLinkClick}
            className="flex items-center gap-1 transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-text)'}
            style={{ color: 'var(--muted-text)' }}
          >
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
            <span className="leading-none">Read full story</span>
          </button>
        </div>
      </div>
    </article>
  )
}