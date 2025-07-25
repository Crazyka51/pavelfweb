import { type NextRequest, NextResponse } from "next/server"
import { articleService } from "@/lib/article-service"
import { getFacebookPostsAsArticles } from "@/lib/services/facebook-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const published = searchParams.get("published") === "true"
    const category = searchParams.get("category")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 5
    const offset = searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : undefined
    const search = searchParams.get("search")

    let articles

    if (search) {
      // Použijeme getArticles s parametrem search místo searchArticles
      articles = await articleService.getArticles({
        isPublished: published,
        search,
        limit,
        offset,
      })
    } else {
      articles = await articleService.getArticles({
        isPublished: published,
        category: category || undefined,
        limit,
        offset,
      })
    }

    // Fetch Facebook posts as articles if needed
    if (searchParams.get("fetchFacebook") === "true") {
      const facebookArticles = await getFacebookPostsAsArticles(limit)
      articles = [...articles, ...facebookArticles]
    }

    return NextResponse.json({
      success: true,
      data: articles,
      count: articles.length,
    })
  } catch (error) {
    console.error("Error fetching articles:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch articles" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.content || !body.category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, content, category" },
        { status: 400 },
      )
    }

    const articleData = {
      title: body.title,
      content: body.content,
      excerpt: body.excerpt || "",
      category: body.category,
      tags: body.tags || [],
      isPublished: body.published || false, // Změněno z published na isPublished
      imageUrl: body.image_url || null, // Změněno z image_url na imageUrl
      publishedAt: body.published && body.published_at ? new Date(body.published_at) : null, // Změněno z published_at na publishedAt
      createdBy: body.created_by || "admin", // Změněno z created_by na createdBy
    }

    const article = await articleService.createArticle(articleData)

    return NextResponse.json(
      {
        success: true,
        data: article,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating article:", error)
    return NextResponse.json({ success: false, error: "Failed to create article" }, { status: 500 })
  }
}
