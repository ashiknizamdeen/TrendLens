'use client'

import { Search, Moon, Sun, Filter, ChevronDown, Bookmark, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '@/components/providers/theme-provider'
import { useNewsStore } from '@/store/news-store'
import TrendingAnalytics from '@/components/analytics/trending-analytics'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const { searchQuery, setSearchQuery, timeFilter, setTimeFilter, savedArticles, showSavedView, setShowSavedView, isAutoRefreshEnabled, startAutoRefresh, stopAutoRefresh } = useNewsStore()
  const [showFilters, setShowFilters] = useState(false)

  return (
    <header className="header">
      <div className="flex items-center justify-between w-full">
        {/* Left: Logo */}
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-3 transition-all duration-200 hover:scale-105"
        >
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <span className="text-white font-bold text-sm leading-none">T</span>
          </div>
          <h1 className="text-xl font-bold leading-none" style={{ color: 'var(--foreground)' }}>TrendLens</h1>
        </button>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-text)' }} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input w-full"
            />
          </div>
        </div>

        {/* Right: Saved Articles + Analytics + Filter + Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Saved Articles Button */}
          <button
            onClick={() => setShowSavedView(!showSavedView)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 relative ${
              showSavedView ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-text)]'
            }`}
            style={{ 
              backgroundColor: showSavedView ? 'var(--primary)' : 'var(--muted)',
              color: showSavedView ? 'white' : 'var(--muted-text)',
              border: '1px solid var(--border)'
            }}
          >
            <Bookmark className="w-4 h-4" />
            <span className="text-sm font-medium">Saved</span>
            {savedArticles.length > 0 && (
              <span 
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ 
                  backgroundColor: 'var(--accent)',
                  color: 'var(--foreground)'
                }}
              >
                {savedArticles.length}
              </span>
            )}
          </button>

          <TrendingAnalytics />

          {/* Auto Refresh Button */}
          <button
            onClick={() => isAutoRefreshEnabled ? stopAutoRefresh() : startAutoRefresh()}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
              isAutoRefreshEnabled ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-[var(--muted)] text-[var(--muted-text)]'
            }`}
            style={{ 
              border: '1px solid var(--border)'
            }}
            title={isAutoRefreshEnabled ? 'Auto-refresh enabled (2min)' : 'Enable auto-refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${isAutoRefreshEnabled ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border"
              style={{ 
                backgroundColor: 'var(--muted)',
                color: 'var(--muted-text)',
                borderColor: 'var(--border)'
              }}
            >
              <Filter className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium leading-none">{timeFilter}</span>
              <ChevronDown className="w-3 h-3 flex-shrink-0" />
            </button>
            
            {showFilters && (
              <div 
                className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg py-2 z-20"
                style={{ 
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border)'
                }}
              >
                {['All time', 'Today', 'This week', 'This month'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setTimeFilter(filter)
                      setShowFilters(false)
                    }}
                    className="w-full px-4 py-2 text-left transition-colors text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    style={{ color: timeFilter === filter ? 'var(--accent)' : 'inherit' }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="theme-toggle"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}