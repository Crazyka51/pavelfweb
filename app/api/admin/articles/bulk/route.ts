import { NextResponse } from "next/server"
import { updateArticle, deleteArticle } from "@/lib/services/article-service"
import { verifyAuth } from "@/lib/auth-utils"

export async function POST(request: Request) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { action, articleIds, updates } = await request.json()

    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return NextResponse.json({ message: "No article IDs provided" }, { status: 400 })
    }

    const results: any[] = []

    switch (action) {
      case "delete":
        for (const id of articleIds) {
          const success = await deleteArticle(id)
          results.push({ id, success, action: "delete" })
        }
        break
      case "update":
        if (!updates) {
          return NextResponse.json({ message: "No updates provided for bulk update" }, { status: 400 })
        }
        for (const id of articleIds) {
          const updatedArticle = await updateArticle(id, updates)
          results.push({ id, success: !!updatedArticle, action: "update", updatedArticle })
        }
        break
      default:
        return NextResponse.json({ message: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Error performing bulk action on articles:", error)
    return NextResponse.json({ message: "Error performing bulk action" }, { status: 500 })
  }
}
