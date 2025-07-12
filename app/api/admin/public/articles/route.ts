import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

// Force dynamic rendering pro veřejné API článků
export const dynamic = "force-dynamic"

const ARTICLES_FILE = path.join(process.cwd(), "data", "articles.json")

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
    const data = await fs.readFile(ARTICLES_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading articles file:", error)
    return []
  }
}

// GET - Get published articles with optional pagination
export async function GET(request: NextRequest) {
  // ------------------------------------------------------------------
  // read query params ?page=1&limit=3  (default: page 1, limit 10)
  // ------------------------------------------------------------------
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get("page") || 1))
  const limit = Math.max(1, Number(searchParams.get("limit") || 10))
  const offset = (page - 1) * limit

  try {
    const articles = await readArticles()

    // only published + newest first
    const published = articles
      .filter((a) => a.published)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const paginated = published.slice(offset, offset + limit)

    return NextResponse.json({
      articles: paginated,
      total: published.length,
      hasMore: offset + paginated.length < published.length,
    })
  } catch (error) {
    // ----------------------------------------------------------------
    // instead of crashing with a 500, return an empty list so the
    // front-end can show the “no articles” UI.
    // The error is still logged for troubleshooting.
    // ----------------------------------------------------------------
    console.error("Error fetching articles:", error)

    return NextResponse.json({ articles: [], total: 0, hasMore: false }, { status: 200 })
  }
}
