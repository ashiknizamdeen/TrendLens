'use client'

import { 
  Zap, 
  Cpu, 
  Rocket, 
  Shield, 
  Smartphone, 
  Code, 
  Gamepad2, 
  Coins,
  Cloud,
  Database
} from 'lucide-react'
import { useNewsStore } from '@/store/news-store'

const categories = [
  { id: 'all', name: 'All', icon: Zap },
  { id: 'ai', name: 'AI/ML', icon: Cpu },
  { id: 'startup', name: 'Startups', icon: Rocket },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'mobile', name: 'Mobile', icon: Smartphone },
  { id: 'devtools', name: 'DevTools', icon: Code },
  { id: 'gaming', name: 'Gaming', icon: Gamepad2 },
  { id: 'crypto', name: 'Crypto', icon: Coins },
  { id: 'cloud', name: 'Cloud', icon: Cloud },
  { id: 'data', name: 'Data', icon: Database },
]

export default function Sidebar() {
  const { selectedCategory, setSelectedCategory, trendingTopics } = useNewsStore()

  return (
    <aside className="sidebar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style jsx>{`
        .sidebar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      <div>
        <h2 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Categories</h2>
        <div className="space-y-2">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = selectedCategory === category.id
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`category-btn ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="leading-none">{category.name}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-8">
          <h3 className="font-semibold mb-4 transition-colors duration-300" style={{ color: 'var(--foreground)' }}>Trending Topics</h3>
          <div className="space-y-2">
            {trendingTopics.map((topic, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                <span className="text-xs font-medium leading-none transition-colors duration-200" style={{ color: 'var(--accent)' }}>#{topic}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}