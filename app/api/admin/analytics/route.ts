import { type NextRequest, NextResponse } from "next/server"
import { getAnalyticsData } from "@/lib/google-analytics"

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    if (token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate") || "7daysAgo"
    const endDate = searchParams.get("endDate") || "today"

    // Get GA4 property ID from environment
    const propertyId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.replace("G-", "") || ""

    // Fetch analytics data
    const analyticsData = await getAnalyticsData(propertyId, startDate, endDate)

    return NextResponse.json({
      success: true,
      data: analyticsData,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
