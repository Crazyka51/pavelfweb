import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'

// Force dynamic rendering pro API články
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
    // If file doesn't exist, return empty array
    return []
  }
}

// Helper function to write articles
async function writeArticles(articles: Article[]): Promise<void> {
  await fs.writeFile(ARTICLES_FILE, JSON.stringify(articles, null, 2))
}

// GET - Get all articles
export async function GET(request: NextRequest) {
  try {
    await verifyToken(request)
    const articles = await readArticles()
    return NextResponse.json(articles)
  } catch (error) {
    return NextResponse.json(
      { message: 'Neautorizovaný přístup' },
      { status: 401 }
    )
  }
}

// POST - Create new article
export async function POST(request: NextRequest) {
  try {
    await verifyToken(request)
    const articleData = await request.json()
    
    const newArticle: Article = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: articleData.title || 'Nový článek',
      content: articleData.content || '',
      excerpt: articleData.excerpt || '',
      category: articleData.category || 'Obecné',
      tags: articleData.tags || [],
      published: articleData.published || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: articleData.imageUrl,
      publishedAt: articleData.publishedAt
    }

    const articles = await readArticles()
    articles.push(newArticle)
    await writeArticles(articles)

    return NextResponse.json(newArticle, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Chyba při vytváření článku' },
      { status: 500 }
    )
  }
}
