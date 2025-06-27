import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'

// Force dynamic rendering pro API článků
export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const ARTICLES_FILE = path.join(process.cwd(), 'data', 'articles.json')

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
  publishedAt?: string
}

// Helper function to verify JWT token
async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided')
  }

  const token = authHeader.substring(7)
  return jwt.verify(token, JWT_SECRET)
}

// Helper function to read articles
async function readArticles(): Promise<Article[]> {
  try {
    const data = await fs.readFile(ARTICLES_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

// Helper function to write articles
async function writeArticles(articles: Article[]): Promise<void> {
  await fs.writeFile(ARTICLES_FILE, JSON.stringify(articles, null, 2))
}

// GET - Get single article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyToken(request)
    const articles = await readArticles()
    const article = articles.find(a => a.id === params.id)
    
    if (!article) {
      return NextResponse.json(
        { message: 'Článek nebyl nalezen' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(article)
  } catch (error) {
    return NextResponse.json(
      { message: 'Neautorizovaný přístup' },
      { status: 401 }
    )
  }
}

// PUT - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyToken(request)
    const updateData = await request.json()
    const articles = await readArticles()
    const articleIndex = articles.findIndex(a => a.id === params.id)
    
    if (articleIndex === -1) {
      return NextResponse.json(
        { message: 'Článek nebyl nalezen' },
        { status: 404 }
      )
    }
    
    const updatedArticle = {
      ...articles[articleIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    
    articles[articleIndex] = updatedArticle
    await writeArticles(articles)
    
    return NextResponse.json(updatedArticle)
  } catch (error) {
    return NextResponse.json(
      { message: 'Chyba při aktualizaci článku' },
      { status: 500 }
    )
  }
}

// DELETE - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyToken(request)
    const articles = await readArticles()
    const articleIndex = articles.findIndex(a => a.id === params.id)
    
    if (articleIndex === -1) {
      return NextResponse.json(
        { message: 'Článek nebyl nalezen' },
        { status: 404 }
      )
    }
    
    articles.splice(articleIndex, 1)
    await writeArticles(articles)
    
    return NextResponse.json({ message: 'Článek byl smazán' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Chyba při mazání článku' },
      { status: 500 }
    )
  }
}
