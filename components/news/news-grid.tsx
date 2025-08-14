'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, Trash2 } from 'lucide-react'
import { useNewsStore } from '@/store/news-store'
import { Article } from '@/types/article'
import NewsCard from './news-card'
import NewsCardSkeleton from './news-card-skeleton'
import ArticleView from './article-view'

export default function NewsGrid() {
  const { 
    filteredArticles, 
    trendingArticles, 
    loading, 
    selectedCategory, 
    selectedTopic,
    searchQuery,
    showSavedView,
    trendingTopics, 
    setSelectedTopic,
    getCategoryDisplayName,
    getSavedArticles,
    getCurrentPageArticles,
    loadMoreArticles,
    hasMoreArticles,
    setShowSavedView,
    clearSavedArticles
  } = useNewsStore()
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showArticle, setShowArticle] = useState(false)
  const [trendingScrollPosition, setTrendingScrollPosition] = useState(0)

  const handleArticleClick = (article: Article) => {
    setIsTransitioning(true)
    setSelectedArticle(article)
    
    setTimeout(() => {
      setShowArticle(true)
      setIsTransitioning(false)
      // Scroll to top when article loads
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 150)
  }

  const handleTrendingScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('trending-scroll-container')
    if (!container) return
    
    const scrollAmount = 400
    const newPosition = direction === 'right' 
      ? trendingScrollPosition + scrollAmount 
      : trendingScrollPosition - scrollAmount
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' })
    setTrendingScrollPosition(newPosition)
  }

  const handleTopicClick = (topic: string) => {
    setSelectedTopic(selectedTopic === topic ? null : topic)
  }

  const handleBackToGrid = () => {
    setShowArticle(false)
    
    setTimeout(() => {
      setSelectedArticle(null)
    }, 150)
  }

  return (
    <div className="main-content">
      {selectedArticle ? (
        <div className={`transition-all duration-300 ease-out ${showArticle ? 'animate-slide-in-right opacity-100' : 'animate-slide-out-left opacity-0'}`}>
          <ArticleView 
            article={selectedArticle} 
            onBack={handleBackToGrid}
            onArticleSelect={handleArticleClick}
          />
        </div>
      ) : (
        <div className="animate-fade-in-up">
          {/* Back Button and Clear Button for Saved Articles */}
          {showSavedView && (
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setShowSavedView(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 group hover:bg-gray-50 dark:hover:bg-gray-800"
                style={{ 
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)'
                }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </div>
                <span className="font-medium">Back to Articles</span>
              </button>

              {getSavedArticles().length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all saved articles?')) {
                      clearSavedArticles()
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 group text-red-600 hover:text-red-700"
                  style={{ 
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-medium text-sm">Clear All</span>
                </button>
              )}
            </div>
          )}

          {/* Dynamic Header */}
          <div className="mb-4 transition-all duration-500">
            <h1 className="text-4xl font-bold tracking-tight mb-2 transition-colors duration-300" style={{ color: 'var(--foreground)' }}>
              {showSavedView 
                ? "Saved Articles"
                : searchQuery 
                  ? `Search results for "${searchQuery}"` 
                  : selectedTopic 
                    ? `"${selectedTopic}" stories`
                    : `${getCategoryDisplayName(selectedCategory)} stories`
              }
            </h1>
            <p className="text-lg leading-relaxed max-w-2xl mb-4" style={{ color: 'var(--muted-text)' }}>
              {showSavedView 
                ? `${getSavedArticles().length} articles saved for later reading`
                : searchQuery 
                  ? `Found ${filteredArticles.length} articles matching your search`
                  : selectedTopic 
                    ? `Showing articles related to ${selectedTopic}`
                    : "Stay updated with the latest technology news and discuss them with our AI assistant"
              }
            </p>
          </div>

          {/* Trending Topics Section - Only show for 'All' category, no search, and not saved view */}
          {selectedCategory === 'all' && !searchQuery && !showSavedView && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                  Trending Topics
                </h3>
              </div>
            
            {/* Horizontal Hashtag Labels */}
            <div className="trending-topics-mobile flex gap-2 flex-wrap mb-6">
              {trendingTopics.map((topic, index) => (
                <button
                  key={topic}
                  onClick={() => handleTopicClick(topic)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 
                    hover:scale-105 animate-slide-up
                    ${selectedTopic === topic 
                      ? 'bg-[var(--primary)] text-white shadow-lg' 
                      : 'bg-[var(--muted)] text-[var(--muted-text)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]'
                    }
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  #{topic}
                </button>
              ))}
            </div>

            {/* Trending Stories Horizontal Scroll */}
            {!selectedTopic && (
              <div className="relative mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium" style={{ color: 'var(--foreground)' }}>
                    Trending Stories
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTrendingScroll('left')}
                      className="p-2 rounded-full transition-all duration-200 hover:scale-110"
                      style={{ 
                        backgroundColor: 'var(--muted)', 
                        color: 'var(--muted-text)',
                        opacity: trendingScrollPosition > 0 ? 1 : 0.5
                      }}
                      disabled={trendingScrollPosition <= 0}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleTrendingScroll('right')}
                      className="p-2 rounded-full transition-all duration-200 hover:scale-110"
                      style={{ 
                        backgroundColor: 'var(--muted)', 
                        color: 'var(--muted-text)',
                        opacity: 0.8
                      }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div 
                  id="trending-scroll-container"
                  className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-80">
                        <NewsCardSkeleton />
                      </div>
                    ))
                  ) : (
                    trendingArticles.map((article, index) => (
                      <div
                        key={article.id}
                        className="flex-shrink-0 w-80 animate-slide-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <NewsCard 
                          article={article} 
                          onClick={() => handleArticleClick(article)}
                        />
                      </div>
                    ))
                  )}
                </div>
                
                {/* Blur line separator */}
                <div 
                  className="h-px mt-8 mb-8"
                  style={{ 
                    background: `linear-gradient(90deg, transparent, var(--border), transparent)`,
                    backdropFilter: 'blur(1px)'
                  }}
                />
              </div>
            )}
            </div>
          )}

          {/* Main News Grid */}
          <div className="news-grid">
            {loading ? (
              Array.from({ length: 9 }).map((_, i) => (
                <NewsCardSkeleton key={i} />
              ))
            ) : (
              (showSavedView ? getSavedArticles() : getCurrentPageArticles()).map((article, index) => (
                <div
                  key={article.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <NewsCard 
                    article={article} 
                    onClick={() => handleArticleClick(article)}
                  />
                </div>
              ))
            )}
          </div>

          {/* Load More Button */}
          {!loading && !showSavedView && hasMoreArticles && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMoreArticles}
                className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'white'
                }}
              >
                Load More Articles
              </button>
            </div>
          )}

          {!loading && (showSavedView ? getSavedArticles().length === 0 : filteredArticles.length === 0) && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                <div 
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: 'var(--muted-text)', opacity: 0.2 }}
                ></div>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                {showSavedView ? 'No saved articles yet' : 'No articles found'}
              </h3>
              <p style={{ color: 'var(--muted-text)' }}>
                {showSavedView ? 'Start saving articles by clicking the bookmark icon' : 'Try adjusting your search or filters'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}