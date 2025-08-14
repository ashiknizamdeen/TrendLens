'use client'

import { ArrowLeft, Clock, BookmarkPlus, ExternalLink, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Article } from '@/types/article'
import { useNewsStore } from '@/store/news-store'

interface ArticleViewProps {
  article: Article
  onBack: () => void
  onArticleSelect?: (article: Article) => void
}

export default function ArticleView({ article, onBack, onArticleSelect }: ArticleViewProps) {
  const { savedArticles, toggleSavedArticle, articles } = useNewsStore()
  const isSaved = savedArticles.includes(article.id)
  
  // Get related articles from same category or similar topics
  const getRelatedArticles = () => {
    return articles
      .filter(a => a.id !== article.id && a.category === article.category)
      .slice(0, 3)
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#059669'
      case 'negative': return '#dc2626'
      default: return '#d97706'
    }
  }

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'rgba(34, 197, 94, 0.1)'
      case 'negative': return 'rgba(239, 68, 68, 0.1)'
      default: return 'rgba(245, 158, 11, 0.1)'
    }
  }

  const getFallbackImage = (category: string) => {
    const gradients = {
      ai: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      security: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      cloud: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      mobile: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      devtools: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      gaming: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      crypto: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      startup: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
    return gradients[category as keyof typeof gradients] || gradients.default
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-text)'}
          style={{ color: 'var(--muted-text)' }}
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          <span className="leading-none">Back to articles</span>
        </button>
      </div>

      {/* Article Image */}
      {article.image && (
        <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-80 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        </div>
      )}

      {/* Article Header */}
      <div className="mb-8">
        {/* Article Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span 
            className="text-sm font-medium px-4 py-2 rounded-full"
            style={{ 
              color: 'white',
              backgroundColor: 'var(--primary)'
            }}
          >
            {article.source}
          </span>
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ 
              backgroundColor: getSentimentBg(article.sentiment),
              color: getSentimentColor(article.sentiment)
            }}
          >
            <TrendingUp className="w-4 h-4" />
            {article.sentiment}
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-text)' }}>
            <Clock className="w-4 h-4" />
            <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Article Title */}
        <h1 className="text-4xl font-bold mb-6 leading-tight" style={{ color: 'var(--foreground)' }}>
          {article.title}
        </h1>

        {/* Article Summary */}
        <p className="text-xl mb-8 leading-relaxed" style={{ color: 'var(--muted-text)' }}>
          {article.summary}
        </p>

        {/* Article Actions */}
        <div className="flex flex-wrap gap-4 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => toggleSavedArticle(article.id)}
            className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors hover:scale-105"
            style={{ 
              backgroundColor: isSaved ? 'var(--primary)' : 'var(--muted)',
              color: isSaved ? 'white' : 'var(--foreground)'
            }}
            onMouseEnter={(e) => {
              if (!isSaved) {
                e.currentTarget.style.backgroundColor = 'var(--primary)'
                e.currentTarget.style.color = 'white'
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaved) {
                e.currentTarget.style.backgroundColor = 'var(--muted)'
                e.currentTarget.style.color = 'var(--foreground)'
              }
            }}
          >
            <BookmarkPlus className="w-4 h-4 flex-shrink-0" />
            <span className="leading-none">{isSaved ? 'Saved' : 'Save for later'}</span>
          </button>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors border"
            style={{ 
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
          >
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
            <span className="leading-none">Read original article</span>
          </a>
        </div>
      </div>

      {/* Article Content */}
      <div className="prose prose-lg max-w-none">
        <h2 className="text-2xl font-semibold mb-6 mt-8" style={{ color: 'var(--foreground)' }}>
          Key Takeaways
        </h2>
        <div className="text-lg leading-relaxed" style={{ color: 'var(--foreground)' }}>
          {article.content}
        </div>
      </div>

      {/* Related Articles */}
      {getRelatedArticles().length > 0 && (
        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
            More {article.category} stories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getRelatedArticles().map((relatedArticle, index) => (
              <div
                key={relatedArticle.id}
                className="p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 animate-slide-up"
                style={{ 
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border)',
                  animationDelay: `${index * 0.1}s`
                }}
                onClick={() => {
                  if (onArticleSelect) {
                    onArticleSelect(relatedArticle)
                  }
                }}
              >
                <div className="aspect-video overflow-hidden rounded mb-3">
                  {relatedArticle.image ? (
                    <img 
                      src={relatedArticle.image} 
                      alt={relatedArticle.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-full h-full flex items-center justify-center text-white font-semibold text-lg ${relatedArticle.image ? 'hidden' : ''}`}
                    style={{ background: getFallbackImage(relatedArticle.category) }}
                  >
                    {relatedArticle.category.toUpperCase()}
                  </div>
                </div>
                <h4 className="font-medium mb-2 line-clamp-2" style={{ color: 'var(--foreground)' }}>
                  {relatedArticle.title}
                </h4>
                <p className="text-sm line-clamp-2" style={{ color: 'var(--muted-text)' }}>
                  {relatedArticle.summary}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span 
                    className="text-xs px-2 py-1 rounded"
                    style={{ 
                      backgroundColor: 'var(--primary)',
                      color: 'white'
                    }}
                  >
                    {relatedArticle.source}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--muted-text)' }}>
                    {formatDistanceToNow(new Date(relatedArticle.publishedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}