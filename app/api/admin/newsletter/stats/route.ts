import { NextResponse } from "next/server"

export async function GET() {
  try {
    // This would normally query the newsletter_subscribers table
    // For now, return mock data since we need to check the schema
    
    return NextResponse.json({
      total: 750,
      last30Days: 45,
      campaigns: 22,
    })
  } catch (error) {
    console.error("Error fetching newsletter stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch newsletter statistics" },
      { status: 500 }
    )
  }
}