import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Force dynamic rendering pro veřejné API článků
export const dynamic = 'force-dynamic'

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

// Helper function to read articles
async function readArticles(): Promise<Article[]> {
  try {
    const data = await fs.readFile(ARTICLES_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

// GET - Get all published articles (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const articles = await readArticles()
    
    // Filter only published articles and sort by date
    const publishedArticles = articles
      .filter(article => article.published)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return NextResponse.json(publishedArticles)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání článků' },
      { status: 500 }
    )
  }
}
