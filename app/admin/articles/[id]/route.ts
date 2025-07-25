import { NextResponse } from "next/server"
import { getArticleById, updateArticle, deleteArticle } from "@/lib/services/article-service"
import { verifyAuth } from "@/lib/auth-utils"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = params
  try {
    const article = await getArticleById(id)
    if (!article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 })
    }
    return NextResponse.json(article)
  } catch (error) {
    console.error("Error fetching article:", error)
    return NextResponse.json({ message: "Error fetching article" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = params
  try {
    const body = await request.json()
    const updated = await updateArticle(id, body)
    if (!updated) {
      return NextResponse.json({ message: "Article not found or failed to update" }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating article:", error)
    return NextResponse.json({ message: "Error updating article" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = params
  try {
    const success = await deleteArticle(id)
    if (!success) {
      return NextResponse.json({ message: "Article not found or failed to delete" }, { status: 404 })
    }
    return NextResponse.json({ message: "Article deleted successfully" })
  } catch (error) {
    console.error("Error deleting article:", error)
    return NextResponse.json({ message: "Error deleting article" }, { status: 500 })
  }
}
