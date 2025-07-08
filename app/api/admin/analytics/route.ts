import { type NextRequest, NextResponse } from "next/server"
import { DataManager } from "@/lib/data-persistence"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

interface AnalyticsData {
  pageViews: {
    total: number
    thisMonth: number
    thisWeek: number
    today: number
    trend: number // percentage change from previous period
  }
  visitors: {
    total: number
    unique: number
    returning: number
    newVisitors: number
  }
  topPages: Array<{
    path: string
    title: string
    views: number
    uniqueViews: number
  }>
  referrers: Array<{
    source: string
    visits: number
    percentage: number
  }>
  devices: {
    desktop: number
    mobile: number
    tablet: number
  }
  locations: Array<{
    country: string
    city?: string
    visits: number
  }>
  timeRange: {
    from: string
    to: string
  }
}

interface AnalyticsEvent {
  id: string
  type: "pageview" | "click" | "form_submit" | "download"
  path: string
  title?: string
  userId?: string
  sessionId: string
  userAgent: string
  referrer?: string
  timestamp: string
  metadata?: Record<string, any>
}

const analyticsManager = new DataManager<AnalyticsEvent>("analytics-events.json")

// Helper function to verify admin token
function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }

  const token = authHeader.substring(7)
  try {
    jwt.verify(token, JWT_SECRET)
    return true
  } catch (error) {
    return false
  }
}

// Helper function to get date ranges
function getDateRanges() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  return {
    today,
    thisWeek,
    thisMonth,
    lastMonth,
    lastMonthEnd,
  }
}

// Helper function to detect device type from user agent
function getDeviceType(userAgent: string): "desktop" | "mobile" | "tablet" {
  const ua = userAgent.toLowerCase()

  if (ua.includes("tablet") || ua.includes("ipad")) {
    return "tablet"
  }

  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    return "mobile"
  }

  return "desktop"
}

// Helper function to extract referrer domain
function getReferrerDomain(referrer: string): string {
  if (!referrer) return "Direct"

  try {
    const url = new URL(referrer)
    return url.hostname
  } catch {
    return "Unknown"
  }
}

// GET - Get analytics data
export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Neautorizovaný přístup" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const events = await analyticsManager.read()
    const dateRanges = getDateRanges()

    // Filter events by date range if provided
    let filteredEvents = events
    if (from && to) {
      const fromDate = new Date(from)
      const toDate = new Date(to)
      filteredEvents = events.filter((event) => {
        const eventDate = new Date(event.timestamp)
        return eventDate >= fromDate && eventDate <= toDate
      })
    }

    // Calculate page views
    const pageViewEvents = filteredEvents.filter((event) => event.type === "pageview")
    const totalPageViews = pageViewEvents.length

    const thisMonthViews = pageViewEvents.filter((event) => new Date(event.timestamp) >= dateRanges.thisMonth).length

    const thisWeekViews = pageViewEvents.filter((event) => new Date(event.timestamp) >= dateRanges.thisWeek).length

    const todayViews = pageViewEvents.filter((event) => new Date(event.timestamp) >= dateRanges.today).length

    // Calculate last month views for trend
    const lastMonthViews = pageViewEvents.filter((event) => {
      const eventDate = new Date(event.timestamp)
      return eventDate >= dateRanges.lastMonth && eventDate <= dateRanges.lastMonthEnd
    }).length

    const trend = lastMonthViews > 0 ? ((thisMonthViews - lastMonthViews) / lastMonthViews) * 100 : 0

    // Calculate unique visitors
    const uniqueSessions = new Set(pageViewEvents.map((event) => event.sessionId))
    const uniqueVisitors = uniqueSessions.size

    // Calculate top pages
    const pageStats: Record<string, { views: number; uniqueViews: Set<string>; title?: string }> = {}

    pageViewEvents.forEach((event) => {
      if (!pageStats[event.path]) {
        pageStats[event.path] = {
          views: 0,
          uniqueViews: new Set(),
          title: event.title,
        }
      }
      pageStats[event.path].views++
      pageStats[event.path].uniqueViews.add(event.sessionId)
    })

    const topPages = Object.entries(pageStats)
      .map(([path, stats]) => ({
        path,
        title: stats.title || path,
        views: stats.views,
        uniqueViews: stats.uniqueViews.size,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Calculate referrers
    const referrerStats: Record<string, number> = {}
    pageViewEvents.forEach((event) => {
      const domain = getReferrerDomain(event.referrer || "")
      referrerStats[domain] = (referrerStats[domain] || 0) + 1
    })

    const totalReferrerVisits = Object.values(referrerStats).reduce((sum, count) => sum + count, 0)
    const referrers = Object.entries(referrerStats)
      .map(([source, visits]) => ({
        source,
        visits,
        percentage: totalReferrerVisits > 0 ? (visits / totalReferrerVisits) * 100 : 0,
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10)

    // Calculate device types
    const deviceStats = { desktop: 0, mobile: 0, tablet: 0 }
    pageViewEvents.forEach((event) => {
      const deviceType = getDeviceType(event.userAgent)
      deviceStats[deviceType]++
    })

    // Mock location data (would need IP geolocation service in real implementation)
    const locations = [
      { country: "Czech Republic", city: "Prague", visits: Math.floor(uniqueVisitors * 0.6) },
      { country: "Czech Republic", city: "Brno", visits: Math.floor(uniqueVisitors * 0.2) },
      { country: "Slovakia", city: "Bratislava", visits: Math.floor(uniqueVisitors * 0.1) },
      { country: "Germany", city: "Berlin", visits: Math.floor(uniqueVisitors * 0.05) },
      { country: "Austria", city: "Vienna", visits: Math.floor(uniqueVisitors * 0.05) },
    ]

    const analyticsData: AnalyticsData = {
      pageViews: {
        total: totalPageViews,
        thisMonth: thisMonthViews,
        thisWeek: thisWeekViews,
        today: todayViews,
        trend: Math.round(trend * 100) / 100,
      },
      visitors: {
        total: uniqueVisitors,
        unique: uniqueVisitors,
        returning: Math.floor(uniqueVisitors * 0.3), // Mock data
        newVisitors: Math.floor(uniqueVisitors * 0.7), // Mock data
      },
      topPages,
      referrers,
      devices: deviceStats,
      locations,
      timeRange: {
        from: from || dateRanges.thisMonth.toISOString(),
        to: to || new Date().toISOString(),
      },
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      {
        message: "Chyba při načítání analytických dat",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST - Track analytics event
export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()
    const { type, path, title, userId, sessionId, referrer, metadata } = eventData

    if (!type || !path || !sessionId) {
      return NextResponse.json({ message: "Chybí povinné údaje (type, path, sessionId)" }, { status: 400 })
    }

    const userAgent = request.headers.get("user-agent") || ""

    const newEvent: AnalyticsEvent = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      path,
      title,
      userId,
      sessionId,
      userAgent,
      referrer,
      timestamp: new Date().toISOString(),
      metadata,
    }

    await analyticsManager.create(newEvent)

    return NextResponse.json({ message: "Událost byla zaznamenána", eventId: newEvent.id }, { status: 201 })
  } catch (error) {
    console.error("Error tracking analytics event:", error)
    return NextResponse.json(
      {
        message: "Chyba při zaznamenávání události",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
