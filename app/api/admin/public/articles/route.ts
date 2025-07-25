import { NextResponse } from "next/server"
import { getArticles } from "@/lib/services/article-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const category = searchParams.get("category") || undefined
  const query = searchParams.get("query") || undefined

  try {
    // Only fetch published articles for public API
    const { articles, total, hasMore } = await getArticles({
      page,
      limit,
      published: true,
      category,
      search: query,
    })
    return NextResponse.json({ articles, total, hasMore })
  } catch (error) {
    console.error("Error fetching public articles:", error)
    return NextResponse.json({ message: "Error fetching articles" }, { status: 500 })
  }
}
