import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, getAuthUser } from "@/lib/auth-utils"
import { articleService } from "@/lib/article-service"

export const GET = requireAuth(async (request: NextRequest, authResult: any) => {

  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const published = searchParams.get("published")
    const search = searchParams.get("search")

    const filters: any = {
      limit,
      offset: (page - 1) * limit,
    }

    if (category && category !== "all") {
      filters.category = category
    }

    if (published !== null && published !== undefined) {
      filters.isPublished = published === "true"
    }

    if (search) {
      filters.search = search
    }

    const articles = await articleService.getArticles(filters)
    const total = await articleService.getTotalArticleCount(filters) // Získání celkového počtu z DB

    return NextResponse.json({
      success: true,
      data: {
        articles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Articles GET error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Chyba při načítání článků",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
})

export const POST = requireAuth(async (request: NextRequest, authResult: any) => {
  try {
    // Nyní máme autentizovaného uživatele v authResult
    if (authResult.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Nedostatečná oprávnění",
        },
        { status: 403 },
      )
    }

    const articleData = await request.json()

    // Validace povinných polí
    if (!articleData.title || !articleData.content) {
      return NextResponse.json(
        {
          success: false,
          error: "Název a obsah jsou povinné",
        },
        { status: 400 },
      )
    }

    // Příprava dat pro vytvoření článku
    const newArticleData = {
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt || articleData.content.replace(/<[^>]*>/g, "").substring(0, 150) + "...",
      category: articleData.category || "Aktuality",
      tags: articleData.tags || [],
      isPublished: articleData.published || false, // Upraveno na isPublished
      imageUrl: articleData.imageUrl, // Mapped to imageUrl
      publishedAt: articleData.publishedAt ? new Date(articleData.publishedAt) : null, // Konverze na Date
      createdBy: authResult.username, // Použití authResult místo user
    }

    const savedArticle = await articleService.createArticle(newArticleData)

    return NextResponse.json({
      success: true,
      message: "Článek byl úspěšně vytvořen",
      data: savedArticle,
    })
  } catch (error) {
    console.error("Articles POST error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Chyba při vytváření článku",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
})
