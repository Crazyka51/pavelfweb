import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { ArticleService } from "@/lib/services/article-service"

const articleService = new ArticleService()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAuth(request)

    const article = await articleService.getArticleById(params.id)

    if (!article) {
      return NextResponse.json({ error: "Článek nenalezen" }, { status: 404 })
    }

    return NextResponse.json({ article })
  } catch (error) {
    console.error("Article GET error:", error)
    return NextResponse.json({ error: "Chyba při načítání článku" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAuth(request)

    const updates = await request.json()

    const updatedArticle = await articleService.updateArticle(params.id, updates)

    if (!updatedArticle) {
      return NextResponse.json({ error: "Článek nenalezen" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      article: updatedArticle,
    })
  } catch (error) {
    console.error("Article PUT error:", error)
    return NextResponse.json({ error: "Chyba při aktualizaci článku" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAuth(request)

    const deleted = await articleService.deleteArticle(params.id)

    if (!deleted) {
      return NextResponse.json({ error: "Článek nenalezen" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Článek byl smazán",
    })
  } catch (error) {
    console.error("Article DELETE error:", error)
    return NextResponse.json({ error: "Chyba při mazání článku" }, { status: 500 })
  }
}
