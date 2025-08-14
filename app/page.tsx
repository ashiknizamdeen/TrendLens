'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import NewsGrid from '@/components/news/news-grid'
import AIChat from '@/components/ai/ai-chat'
import { useNewsStore } from '@/store/news-store'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { fetchNews, loading } = useNewsStore()

  useEffect(() => {
    setMounted(true)
    fetchNews()
  }, [fetchNews])

  if (!mounted) {
    return null
  }

  return (
    <div className="main-layout" style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
      <Header />
      <Sidebar />
      <NewsGrid />
      <AIChat />
    </div>
  )
}