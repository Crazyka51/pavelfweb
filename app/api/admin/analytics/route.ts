import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { sql, type AnalyticsEvent } from "@/lib/database"
import { getAnalyticsData } from "@/lib/services/analytics-service"

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
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  try {
    const data = await getAnalyticsData(from ? new Date(from) : undefined, to ? new Date(to) : undefined)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json({ message: "Error fetching analytics data" }, { status: 500 })
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

    const newEvent: Omit<AnalyticsEvent, "id" | "timestamp"> = {
      type,
      path,
      title: title || null,
      user_id: userId || null,
      session_id: sessionId,
      user_agent: userAgent,
      referrer: referrer || null,
      metadata: metadata || null,
    }

    await sql`
      INSERT INTO analytics_events (type, path, title, user_id, session_id, user_agent, referrer, metadata)
      VALUES (
        ${newEvent.type},
        ${newEvent.path},
        ${newEvent.title},
        ${newEvent.user_id},
        ${newEvent.session_id},
        ${newEvent.user_agent},
        ${newEvent.referrer},
        ${newEvent.metadata ? JSON.stringify(newEvent.metadata) : null}
      )
    `

    return NextResponse.json({ message: "Událost byla zaznamenána" }, { status: 201 })
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
