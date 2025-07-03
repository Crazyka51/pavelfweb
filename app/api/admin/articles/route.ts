import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { ArticleService } from "@/lib/services/article-service"

const articleService = new ArticleService()

export async function GET(request: NextRequest) {
  try {
    requireAuth(request)

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const published = searchParams.get("published")
    const search = searchParams.get("search")

    // Základní filtrování
    const filters: any = {
      limit,
      offset: (page - 1) * limit
    }

    if (category && category !== "all") {
      filters.category = category
    }

    if (published !== null && published !== undefined) {
      filters.published = published === "true"
    }

    let articles = await articleService.getArticles(filters)

    // Client-side filtrování pro vyhledávání (dokud nenastavíme full-text search)
    if (search) {
      const searchLower = search.toLowerCase()
      articles = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchLower) ||
          article.content.toLowerCase().includes(searchLower) ||
          (article.tags && article.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)))
      )
    }

    // Získání celkového počtu pro paginaci
    const total = articles.length // Zjednodušení - v produkci by bylo lepší počítat v DB

    return NextResponse.json({
      articles,
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

    // Příprava dat pro vytvoření článku
    const newArticleData = {
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt || articleData.content.replace(/<[^>]*>/g, "").substring(0, 150) + "...",
      category: articleData.category || "Aktuality",
      tags: articleData.tags || [],
      published: articleData.published || false,
      image_url: articleData.imageUrl,
      published_at: articleData.publishedAt,
      created_by: "admin" // Momentálně hardcoded, v budoucnu z auth tokenu
    }

    const savedArticle = await articleService.createArticle(newArticleData)

    return NextResponse.json({
      success: true,
      article: savedArticle,
    })
  } catch (error) {
    console.error("Articles POST error:", error)
    return NextResponse.json({ error: "Chyba při vytváření článku" }, { status: 500 })
  }
}
