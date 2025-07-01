import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { DataManager } from "@/lib/data-persistence"

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

const articlesManager = new DataManager<Article>("articles.json")

export async function GET(request: NextRequest) {
  try {
    requireAuth(request)

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const published = searchParams.get("published")
    const search = searchParams.get("search")

    let articles = await articlesManager.read()

    // Filtrování
    if (category && category !== "all") {
      articles = articles.filter((article) => article.category === category)
    }

    if (published !== null && published !== undefined) {
      const isPublished = published === "true"
      articles = articles.filter((article) => article.published === isPublished)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      articles = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchLower) ||
          article.content.toLowerCase().includes(searchLower) ||
          article.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    // Řazení podle data vytvoření (nejnovější první)
    articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Paginace
    const total = articles.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedArticles = articles.slice(startIndex, endIndex)

    return NextResponse.json({
      articles: paginatedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Articles GET error:", error)
    return NextResponse.json({ error: "Chyba při načítání článků" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAuth(request)

    const articleData = await request.json()

    // Validace povinných polí
    if (!articleData.title || !articleData.content) {
      return NextResponse.json({ error: "Název a obsah jsou povinné" }, { status: 400 })
    }

    // Vytvoření nového článku
    const newArticle: Article = {
      id: `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt || articleData.content.replace(/<[^>]*>/g, "").substring(0, 150) + "...",
      category: articleData.category || "Aktuality",
      tags: articleData.tags || [],
      published: articleData.published || false,
      imageUrl: articleData.imageUrl,
      publishedAt: articleData.publishedAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const savedArticle = await articlesManager.create(newArticle)

    return NextResponse.json({
      success: true,
      article: savedArticle,
    })
  } catch (error) {
    console.error("Articles POST error:", error)
    return NextResponse.json({ error: "Chyba při vytváření článku" }, { status: 500 })
  }
}
