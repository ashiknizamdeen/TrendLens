import { create } from 'zustand'
import { Article } from '@/types/article'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatStore {
  messages: ChatMessage[]
  isLoading: boolean
  
  sendMessage: (content: string, article?: Article | null) => Promise<void>
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isLoading: false,

  sendMessage: async (content: string, article?: Article | null) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    set({ 
      messages: [...get().messages, userMessage],
      isLoading: true 
    })

    try {
      // Get recent articles for context if needed for comparison
      const allArticlesResponse = await fetch('/api/news')
      const allArticles = allArticlesResponse.ok ? await allArticlesResponse.json() : []

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          article: article ? {
            title: article.title,
            summary: article.summary,
            content: article.content,
            source: article.source,
            category: article.category,
            link: article.link,
            publishedAt: article.publishedAt
          } : null,
          allArticles: allArticles.slice(0, 20), // Send recent 20 articles for context
          conversation: get().messages
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      set({
        messages: [...get().messages, assistantMessage],
        isLoading: false
      })
    } catch (error) {
      console.error('Chat error:', error)
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure your OpenAI API key is configured correctly.',
        timestamp: new Date()
      }

      set({
        messages: [...get().messages, errorMessage],
        isLoading: false
      })
    }
  },

  clearMessages: () => set({ messages: [] })
}))