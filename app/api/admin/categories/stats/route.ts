import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { categories } from "@/lib/schema"
import { count } from "drizzle-orm"

export async function GET() {
  try {
    // Get total count of categories
    const totalResult = await db.select({ count: count() }).from(categories)
    const total = totalResult[0]?.count || 0

    return NextResponse.json({
      total,
    })
  } catch (error) {
    console.error("Error fetching category stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch category statistics" },
      { status: 500 }
    )
  }
}