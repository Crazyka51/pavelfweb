import { type NextRequest, NextResponse } from "next/server"
import { getPublishedArticles } from "@/lib/services/article-service"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)

    const { articles, total, hasMore } = await getPublishedArticles(page, limit)

    return NextResponse.json({ articles, total, hasMore }, { status: 200 })
  } catch (error) {
    console.error("Error fetching public articles:", error)
    // Return an empty array and false for hasMore on error to prevent client crashes
    return NextResponse.json(
      { articles: [], total: 0, hasMore: false, message: "Failed to load articles." },
      { status: 500 },
    )
  }
}
