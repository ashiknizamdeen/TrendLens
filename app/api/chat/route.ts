import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Rate limiting for chat API
const chatRateLimitMap = new Map<string, { count: number; timestamp: number }>()
const CHAT_RATE_LIMIT = 20 // messages per minute
const CHAT_RATE_WINDOW = 60 * 1000 // 1 minute

function checkChatRateLimit(ip: string): boolean {
  const now = Date.now()
  const userLimit = chatRateLimitMap.get(ip)
  
  if (!userLimit) {
    chatRateLimitMap.set(ip, { count: 1, timestamp: now })
    return true
  }
  
  if (now - userLimit.timestamp > CHAT_RATE_WINDOW) {
    chatRateLimitMap.set(ip, { count: 1, timestamp: now })
    return true
  }
  
  if (userLimit.count >= CHAT_RATE_LIMIT) {
    return false
  }
  
  userLimit.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    if (!checkChatRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please slow down.' },
        { status: 429 }
      )
    }

    const { message, article, allArticles, conversation } = await req.json()

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found in environment variables')
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please check your .env.local file.' },
        { status: 500 }
      )
    }

    // Build context for the AI
    let systemPrompt = `You are TrendLens AI, an intelligent assistant specialized in discussing technology news articles.

Core Functions:
1. SUMMARIZE articles when asked - provide clear, concise summaries
2. ANSWER QUESTIONS about specific news stories using article content
3. PROVIDE CONTEXT and background on tech topics mentioned in articles
4. COMPARE related stories or developments when multiple articles are discussed

Response Guidelines:
- When asked to summarize, provide a clear 2-3 sentence summary
- Answer questions directly using the article content provided
- Give relevant background context for technical topics
- Compare stories by highlighting similarities, differences, and implications
- Always reference specific details from the article content
- Be conversational but factual`

    if (article) {
      systemPrompt += `

CURRENT ARTICLE CONTEXT:
Title: ${article.title}
Summary: ${article.summary}
Source: ${article.source}
Category: ${article.category}
Published: ${article.publishedAt}
Content: ${article.content}
Link: ${article.link}

The user is asking about this specific article. Use this context to provide relevant and specific answers.`
    }

    // Add recent articles for comparison if available
    if (allArticles && allArticles.length > 0) {
      systemPrompt += `

RECENT ARTICLES FOR COMPARISON (use only when user asks to compare or needs context):
${allArticles.map((art: { title: string; source: string; category: string }, index: number) => 
  `${index + 1}. ${art.title} (${art.source}, ${art.category})`
).join('\n')}

Use these articles when the user asks to compare stories, find related news, or needs broader context.`
    }

    // Convert conversation history to OpenAI format
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversation.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json({ response })
  } catch (error: unknown) {
    console.error('Chat API error:', error)
    
    // Handle specific OpenAI errors
    const apiError = error as { status?: number; message?: string }
    
    if (apiError?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key. Please check your API key configuration.' },
        { status: 401 }
      )
    }
    
    if (apiError?.status === 429) {
      return NextResponse.json(
        { error: 'OpenAI API rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }
    
    if (apiError?.status === 404) {
      return NextResponse.json(
        { error: 'OpenAI model not found. Please check your model configuration.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: `Chat service error: ${apiError?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}