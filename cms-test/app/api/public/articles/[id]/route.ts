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

// GET /api/public/articles/[id] - Get single published article (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articles = await loadArticles()
    const article = articles.find(a => a.id === params.id && a.published)
    
    if (!article) {
      return NextResponse.json(
        { message: 'Článek nenalezen nebo není publikován' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(article)
  } catch (error) {
    console.error('Error loading public article:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání článku' },
      { status: 500 }
    )
  }
}
