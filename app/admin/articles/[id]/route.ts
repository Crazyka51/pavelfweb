import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
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

// Helper functions
function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Neplatný token')
  }

  const token = authHeader.substring(7)
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error('Chyba konfigurace serveru')
  }

  try {
    return jwt.verify(token, jwtSecret)
  } catch (error) {
    throw new Error('Neplatný token')
  }
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

async function saveArticles(articles: Article[]): Promise<void> {
  const dataPath = await getDataPath()
  await fs.writeFile(dataPath, JSON.stringify(articles, null, 2))
}

// GET /api/articles/[id] - Get single article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAuth(request)
    const articles = await loadArticles()
    const article = articles.find(a => a.id === params.id)
    
    if (!article) {
      return NextResponse.json(
        { message: 'Článek nenalezen' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(article)
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Chyba při načítání článku' },
      { status: 401 }
    )
  }
}

// PUT /api/articles/[id] - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAuth(request)
    const articles = await loadArticles()
    const articleIndex = articles.findIndex(a => a.id === params.id)
    
    if (articleIndex === -1) {
      return NextResponse.json(
        { message: 'Článek nenalezen' },
        { status: 404 }
      )
    }
    
    const articleData = await request.json()
    
    // Validate required fields
    if (!articleData.title || !articleData.content) {
      return NextResponse.json(
        { message: 'Název a obsah jsou povinné' },
        { status: 400 }
      )
    }
    
    // Update article
    const updatedArticle: Article = {
      ...articles[articleIndex],
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt || '',
      category: articleData.category || 'Aktuality',
      tags: articleData.tags || [],
      published: articleData.published || false,
      updatedAt: new Date().toISOString(),
      imageUrl: articleData.imageUrl
    }
    
    articles[articleIndex] = updatedArticle
    await saveArticles(articles)
    
    return NextResponse.json(updatedArticle)
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Chyba při aktualizaci článku' },
      { status: error instanceof Error && error.message === 'Neplatný token' ? 401 : 500 }
    )
  }
}

// DELETE /api/articles/[id] - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAuth(request)
    const articles = await loadArticles()
    const articleIndex = articles.findIndex(a => a.id === params.id)
    
    if (articleIndex === -1) {
      return NextResponse.json(
        { message: 'Článek nenalezen' },
        { status: 404 }
      )
    }
    
    articles.splice(articleIndex, 1)
    await saveArticles(articles)
    
    return NextResponse.json({ message: 'Článek byl smazán' })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Chyba při mazání článku' },
      { status: error instanceof Error && error.message === 'Neplatný token' ? 401 : 500 }
    )
  }
}
