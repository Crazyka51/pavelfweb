import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Types
interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  published: boolean
  createdAt: string
  updatedAt: string
  imageUrl?: string
}

async function getDataPath() {
  const dataDir = path.join(process.cwd(), 'data')
  
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
  
  return path.join(dataDir, 'articles.json')
}

async function loadArticles(): Promise<Article[]> {
  try {
    const dataPath = await getDataPath()
    const data = await fs.readFile(dataPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

// GET /api/public/articles - Get published articles (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const articles = await loadArticles()
    
    // Only return published articles
    const publishedArticles = articles
      .filter(article => article.published)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    
    let filteredArticles = publishedArticles
    
    // Filter by category if specified
    if (category && category !== 'all') {
      filteredArticles = filteredArticles.filter(article => article.category === category)
    }
    
    // Apply pagination
    const startIndex = offset ? parseInt(offset) : 0
    const endIndex = limit ? startIndex + parseInt(limit) : undefined
    
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex)
    
    const response = NextResponse.json({
      articles: paginatedArticles,
      total: filteredArticles.length,
      hasMore: endIndex ? endIndex < filteredArticles.length : false
    })
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    
    return response
  } catch (error) {
    console.error('Error loading public articles:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání článků' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
