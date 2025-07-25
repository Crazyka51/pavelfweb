import { type NextRequest, NextResponse } from "next/server"
import { getArticleById, updateArticle, deleteArticle } from "@/lib/services/article-service"
import { verifyAuth } from "@/lib/auth-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAuth(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }

    const { id } = params
    const article = await getArticleById(id)

    if (!article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 })
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error("Error fetching article:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAuth(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }

    const { id } = params
    const body = await request.json()

    const updatedArticle = await updateArticle(id, body)

    if (!updatedArticle) {
      return NextResponse.json({ message: "Article not found or update failed" }, { status: 404 })
    }

    return NextResponse.json(updatedArticle)
  } catch (error) {
    console.error("Error updating article:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAuth(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }

    const { id } = params
    await deleteArticle(id)

    return NextResponse.json({ message: "Article deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting article:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
