import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Mock analytics data generator
function generateMockAnalytics(range: string) {
  const baseMultiplier = range === "7d" ? 1 : range === "30d" ? 4 : 12

  return {
    overview: {
      users: Math.floor(1200 * baseMultiplier + Math.random() * 200),
      sessions: Math.floor(1800 * baseMultiplier + Math.random() * 300),
      pageviews: Math.floor(4300 * baseMultiplier + Math.random() * 500),
      bounceRate: Math.round((40 + Math.random() * 20) * 10) / 10,
      avgSessionDuration: Math.floor(180 + Math.random() * 60),
      usersChange: Math.round((Math.random() * 30 - 10) * 10) / 10,
      sessionsChange: Math.round((Math.random() * 25 - 5) * 10) / 10,
      pageviewsChange: Math.round((Math.random() * 35 - 5) * 10) / 10,
    },
    topPages: [
      {
        path: "/",
        views: Math.floor(1200 * baseMultiplier + Math.random() * 200),
        change: Math.round((Math.random() * 20 - 5) * 10) / 10,
      },
      {
        path: "/aktuality",
        views: Math.floor(850 * baseMultiplier + Math.random() * 150),
        change: Math.round((Math.random() * 15 - 8) * 10) / 10,
      },
      {
        path: "/aktuality/nova-tramvajova-trat",
        views: Math.floor(430 * baseMultiplier + Math.random() * 100),
        change: Math.round((Math.random() * 25 + 5) * 10) / 10,
      },
      {
        path: "/aktuality/komunitni-zahrada",
        views: Math.floor(300 * baseMultiplier + Math.random() * 80),
        change: Math.round((Math.random() * 20 - 2) * 10) / 10,
      },
      {
        path: "/kontakt",
        views: Math.floor(190 * baseMultiplier + Math.random() * 50),
        change: Math.round((Math.random() * 10 - 5) * 10) / 10,
      },
    ],
    devices: [
      {
        category: "Desktop",
        users: Math.floor(680 * baseMultiplier + Math.random() * 100),
        percentage: Math.round((55 + Math.random() * 10) * 10) / 10,
      },
      {
        category: "Mobile",
        users: Math.floor(430 * baseMultiplier + Math.random() * 80),
        percentage: Math.round((35 + Math.random() * 8) * 10) / 10,
      },
      {
        category: "Tablet",
        users: Math.floor(120 * baseMultiplier + Math.random() * 30),
        percentage: Math.round((10 + Math.random() * 5) * 10) / 10,
      },
    ],
    countries: [
      {
        country: "Česká republika",
        users: Math.floor(1080 * baseMultiplier + Math.random() * 150),
        percentage: Math.round((87 + Math.random() * 5) * 10) / 10,
      },
      {
        country: "Slovensko",
        users: Math.floor(90 * baseMultiplier + Math.random() * 20),
        percentage: Math.round((7 + Math.random() * 2) * 10) / 10,
      },
      {
        country: "Německo",
        users: Math.floor(35 * baseMultiplier + Math.random() * 10),
        percentage: Math.round((2.5 + Math.random() * 1) * 10) / 10,
      },
      {
        country: "Rakousko",
        users: Math.floor(25 * baseMultiplier + Math.random() * 8),
        percentage: Math.round((2 + Math.random() * 0.5) * 10) / 10,
      },
      {
        country: "Ostatní",
        users: Math.floor(15 * baseMultiplier + Math.random() * 5),
        percentage: Math.round((1 + Math.random() * 0.5) * 10) / 10,
      },
    ],
    sources: [
      {
        source: "Organic Search",
        users: Math.floor(620 * baseMultiplier + Math.random() * 100),
        percentage: Math.round((50 + Math.random() * 8) * 10) / 10,
      },
      {
        source: "Direct",
        users: Math.floor(370 * baseMultiplier + Math.random() * 80),
        percentage: Math.round((30 + Math.random() * 6) * 10) / 10,
      },
      {
        source: "Social Media",
        users: Math.floor(150 * baseMultiplier + Math.random() * 40),
        percentage: Math.round((12 + Math.random() * 4) * 10) / 10,
      },
      {
        source: "Referral",
        users: Math.floor(85 * baseMultiplier + Math.random() * 25),
        percentage: Math.round((7 + Math.random() * 2) * 10) / 10,
      },
      {
        source: "Email",
        users: Math.floor(15 * baseMultiplier + Math.random() * 8),
        percentage: Math.round((1 + Math.random() * 1) * 10) / 10,
      },
    ],
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    try {
      jwt.verify(token, process.env.ADMIN_TOKEN || "fallback-secret")
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get time range from query params
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "7d"

    // In a real implementation, you would fetch data from Google Analytics API
    // For now, we'll return mock data
    const analyticsData = generateMockAnalytics(range)

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
