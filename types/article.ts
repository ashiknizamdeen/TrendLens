export interface Article {
    id: string
    title: string
    summary: string
    content: string
    link: string
    source: string
    publishedAt: string
    category: string
    sentiment: 'positive' | 'negative' | 'neutral'
    image?: string
  }
  
  export interface NewsSource {
    name: string
    url: string
    rssUrl?: string
    category: string
  }