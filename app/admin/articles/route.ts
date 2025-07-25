import { NextResponse } from "next/server"
import { getArticles, createArticle } from "@/lib/services/article-service"
import { verifyAuth } from "@/lib/auth-utils"

export async function GET(request: Request) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const category = searchParams.get("category") || undefined
  const status = searchParams.get("status") || undefined
  const query = searchParams.get("query") || undefined

  try {
    const { articles, total, hasMore } = await getArticles({
      page,
      limit,
      category,
      status,
      search: query,
    })
    return NextResponse.json({ articles, total, hasMore })
  } catch (error) {
    console.error("Error fetching articles:", error)
    return NextResponse.json({ message: "Error fetching articles" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    // Assuming createdBy comes from the authenticated user
    const newArticle = await createArticle({ ...body, createdBy: authResult.user?.username || "admin" })
    return NextResponse.json(newArticle, { status: 201 })
  } catch (error) {
    console.error("Error creating article:", error)
    return NextResponse.json({ message: "Error creating article" }, { status: 500 })
  }
}
