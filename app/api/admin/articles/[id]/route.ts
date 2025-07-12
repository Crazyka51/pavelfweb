import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { ArticleService } from "@/lib/services/article-service"

const articleService = new ArticleService()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAuth(request)
  if (authError) {
    return authError
  }

  try {
    const article = await articleService.getArticleById(params.id)

    if (!article) {
      return NextResponse.json({ 
        success: false,
        error: "Článek nenalezen" 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      data: article 
    })
  } catch (error) {
    console.error("Article GET error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Chyba při načítání článku",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAuth(request)
  if (authError) {
    return authError
  }

  try {
    const updates = await request.json()

    const updatedArticle = await articleService.updateArticle(params.id, updates)

    if (!updatedArticle) {
      return NextResponse.json({ 
        success: false,
        error: "Článek nenalezen" 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Článek byl úspěšně aktualizován",
      data: updatedArticle,
    })
  } catch (error) {
    console.error("Article PUT error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Chyba při aktualizaci článku",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAuth(request)
  if (authError) {
    console.error("Autentizace selhala při mazání článku.");
    return authError
  }

  try {
    console.log(`Přijat požadavek na mazání článku s ID: ${params.id}`);
    const deleted = await articleService.deleteArticle(params.id)

    if (!deleted) {
      console.error(`Článek s ID ${params.id} nebyl nalezen.`);
      return NextResponse.json({ 
        success: false,
        error: "Článek nenalezen" 
      }, { status: 404 })
    }

    console.log(`Článek s ID ${params.id} byl úspěšně smazán.`);
    return NextResponse.json({
      success: true,
      message: "Článek byl úspěšně smazán",
    })
  } catch (error) {
    console.error("Chyba při mazání článku:", error);
    return NextResponse.json({ 
      success: false,
      error: "Chyba při mazání článku",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
