import { type NextRequest, NextResponse } from "next/server"
import { getArticles, createArticle } from "@/lib/services/article-service"
import { verifyAuth } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category") || undefined
    const status = searchParams.get("status") || undefined
    const query = searchParams.get("query") || undefined

    const { articles, total, hasMore } = await getArticles({ page, limit, category, status, query })
    return NextResponse.json({ articles, total, hasMore })
  } catch (error) {
    console.error("Error fetching articles:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }

    const body = await request.json()
    const newArticle = await createArticle(body)
    return NextResponse.json(newArticle, { status: 201 })
  } catch (error) {
    console.error("Error creating article:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
