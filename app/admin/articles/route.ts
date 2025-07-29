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
    // If file doesn't exist, return empty array
    return []
  }
}

async function saveArticles(articles: Article[]): Promise<void> {
  const dataPath = await getDataPath()
  await fs.writeFile(dataPath, JSON.stringify(articles, null, 2))
}

// GET /api/articles - Get all articles
export async function GET(request: NextRequest) {
  try {
    verifyAuth(request)
    const articles = await loadArticles()
    
    // Sort by updated date (newest first)
    articles.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    
    return NextResponse.json(articles)
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Chyba při načítání článků' },
      { status: 401 }
    )
  }
}

// POST /api/articles - Create new article
export async function POST(request: NextRequest) {
  try {
    verifyAuth(request)
    const articles = await loadArticles()
    const articleData = await request.json()
    
    // Validate required fields
    if (!articleData.title || !articleData.content) {
      return NextResponse.json(
        { message: 'Název a obsah jsou povinné' },
        { status: 400 }
      )
    }

    // Create new article
    const newArticle: Article = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt || '',
      category: articleData.category || 'Aktuality',
      tags: articleData.tags || [],
      published: articleData.published || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: articleData.imageUrl
    }

    articles.push(newArticle)
    await saveArticles(articles)
    
    return NextResponse.json(newArticle, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Chyba při vytváření článku' },
      { status: error instanceof Error && error.message === 'Neplatný token' ? 401 : 500 }
    )
  }
}
