import { type NextRequest, NextResponse } from "next/server"

// Mock analytics data - v produkci by se načítala z Google Analytics API
const getMockAnalyticsData = (range: string) => {
  const baseData = {
    users: 1247,
    sessions: 1856,
    pageviews: 4321,
    bounceRate: 42.3,
    avgSessionDuration: "2m 34s",
    topPages: [
      { page: "/", views: 1234, percentage: 28.5 },
      { page: "/aktuality", views: 856, percentage: 19.8 },
      { page: "/aktuality/novy-web-design", views: 432, percentage: 10.0 },
      { page: "/kontakt", views: 321, percentage: 7.4 },
      { page: "/sluzby", views: 298, percentage: 6.9 },
    ],
    devices: [
      { category: "Desktop", sessions: 1112, percentage: 59.9 },
      { category: "Mobile", sessions: 632, percentage: 34.1 },
      { category: "Tablet", sessions: 112, percentage: 6.0 },
    ],
    countries: [
      { country: "Česká republika", sessions: 1456, percentage: 78.4 },
      { country: "Slovensko", sessions: 234, percentage: 12.6 },
      { country: "Německo", sessions: 89, percentage: 4.8 },
      { country: "Rakousko", sessions: 45, percentage: 2.4 },
      { country: "Ostatní", sessions: 32, percentage: 1.8 },
    ],
    trafficSources: [
      { source: "Organic Search", sessions: 834, percentage: 44.9 },
      { source: "Direct", sessions: 567, percentage: 30.5 },
      { source: "Social Media", sessions: 234, percentage: 12.6 },
      { source: "Referral", sessions: 156, percentage: 8.4 },
      { source: "Email", sessions: 65, percentage: 3.6 },
    ],
  }

  // Adjust data based on time range
  const multiplier = range === "7d" ? 1 : range === "30d" ? 4.2 : 12.8

  return {
    ...baseData,
    users: Math.round(baseData.users * multiplier),
    sessions: Math.round(baseData.sessions * multiplier),
    pageviews: Math.round(baseData.pageviews * multiplier),
    topPages: baseData.topPages.map((page) => ({
      ...page,
      views: Math.round(page.views * multiplier),
    })),
    devices: baseData.devices.map((device) => ({
      ...device,
      sessions: Math.round(device.sessions * multiplier),
    })),
    countries: baseData.countries.map((country) => ({
      ...country,
      sessions: Math.round(country.sessions * multiplier),
    })),
    trafficSources: baseData.trafficSources.map((source) => ({
      ...source,
      sessions: Math.round(source.sessions * multiplier),
    })),
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminToken = process.env.ADMIN_TOKEN

    if (!adminToken || token !== adminToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get time range from query params
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "7d"

    // In production, this would call Google Analytics API
    // For now, return mock data
    const analyticsData = getMockAnalyticsData(range)

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
