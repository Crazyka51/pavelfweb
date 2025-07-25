import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { articles } from "@/lib/schema"
import { count, eq, sql } from "drizzle-orm"

export async function GET() {
  try {
    // Get total count of articles
    const totalResult = await db.select({ count: count() }).from(articles)
    const total = totalResult[0]?.count || 0

    // Get count of published articles
    const publishedResult = await db
      .select({ count: count() })
      .from(articles)
      .where(eq(articles.isPublished, true))
    const published = publishedResult[0]?.count || 0

    // Calculate drafts
    const drafts = total - published

    return NextResponse.json({
      total,
      published,
      drafts,
    })
  } catch (error) {
    console.error("Error fetching article stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch article statistics" },
      { status: 500 }
    )
  }
}