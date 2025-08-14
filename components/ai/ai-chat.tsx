'use client'

import { useState, useEffect } from 'react'
import { Sparkles, X, Send } from 'lucide-react'
import { useNewsStore } from '@/store/news-store'
import { useChatStore } from '@/store/chat-store'

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isExtended, setIsExtended] = useState(false)
  const { selectedArticle } = useNewsStore()
  const { messages, isLoading, sendMessage } = useChatStore()

  // Auto-extend animation when viewing an article with delay
  useEffect(() => {
    if (selectedArticle && !isOpen) {
      const delayTimer = setTimeout(() => {
        setIsExtended(true)
        const hideTimer = setTimeout(() => {
          setIsExtended(false)
        }, 3000)
        return () => clearTimeout(hideTimer)
      }, 1500)
      return () => clearTimeout(delayTimer)
    } else {
      setIsExtended(false)
    }
  }, [selectedArticle, isOpen])

  const handleSendMessage = async () => {
    if (!message.trim()) return
    
    await sendMessage(message, selectedArticle)
    setMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="chat-button gradient-bg group transition-all duration-700 ease-in-out"
        style={{ 
          width: isExtended ? '192px' : '48px',
          opacity: 0.9,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 47, 92, 0.3)'
        }}
      >
        <div className="flex items-center justify-center w-full h-full relative overflow-hidden">
          <Sparkles 
            className="w-5 h-5 text-white flex-shrink-0 transition-all duration-700 ease-in-out absolute"
            style={{
              opacity: isExtended ? 0 : 1,
              transform: isExtended ? 'scale(0.8)' : 'scale(1)',
              visibility: isExtended ? 'hidden' : 'visible'
            }}
          />
          <span 
            className="text-white font-medium text-sm transition-all duration-700 ease-in-out whitespace-nowrap absolute"
            style={{
              opacity: isExtended ? 1 : 0,
              transform: isExtended ? 'scale(1)' : 'scale(0.8)',
              visibility: isExtended ? 'visible' : 'hidden'
            }}
          >
            {selectedArticle ? 'Chat with AI' : 'TrendLens AI'}
          </span>
        </div>
        
        {/* Enhanced Tooltip */}
        <div className="chat-tooltip absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium opacity-0 visibility-hidden transition-all duration-300 whitespace-nowrap pointer-events-none z-50">
          {selectedArticle ? 'Discuss this article with AI' : 'Chat with TrendLens AI'}
        </div>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
          <div 
            className="w-96 h-[600px] rounded-lg shadow-2xl flex flex-col"
            style={{ 
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border)',
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b gradient-bg rounded-t-lg" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <h3 className="font-semibold text-white">TrendLens AI</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {selectedArticle && (
              <div 
                className="p-3 border-b"
                style={{ 
                  backgroundColor: 'var(--muted)',
                  borderColor: 'var(--border)'
                }}
              >
                <p className="text-xs mb-1" style={{ color: 'var(--muted-text)' }}>Discussing:</p>
                <p className="text-sm font-medium line-clamp-2" style={{ color: 'var(--foreground)' }}>{selectedArticle.title}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              
              {messages.length === 0 && (
                <div className="text-center" style={{ color: 'var(--muted-text)' }}>
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm mb-2">
                    {selectedArticle 
                      ? "Ask me anything about this article!" 
                      : "Ask me about any tech news topic!"}
                  </p>
                  {selectedArticle && (
                    <div className="text-xs opacity-75">
                      Currently discussing: {selectedArticle.title.substring(0, 50)}...
                    </div>
                  )}
                  <div className="text-xs mt-3 space-y-1">
                    <div>Try asking:</div>
                    <div>"Summarize this article"</div>
                    <div>"What's the background on this topic?"</div>
                    <div>"How does this compare to similar stories?"</div>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className="max-w-[80%] rounded-lg px-3 py-2 text-sm"
                    style={{
                      backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'var(--muted)',
                      color: msg.role === 'user' ? 'white' : 'var(--foreground)'
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div 
                    className="rounded-lg px-3 py-2 text-sm"
                    style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
                  >
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'currentColor' }}></div>
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'currentColor', animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'currentColor', animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedArticle ? "Ask about this article..." : "Ask about tech news..."}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50"
                  style={{ 
                    backgroundColor: 'var(--muted)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  className="p-2 gradient-bg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}