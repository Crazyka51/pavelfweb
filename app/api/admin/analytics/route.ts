import { type NextRequest, NextResponse } from "next/server"
import { getAnalyticsData } from "@/lib/google-analytics"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    // Ověření autentifikace
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Neautorizovaný přístup" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    try {
      jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
    } catch {
      return NextResponse.json({ error: "Neplatný token" }, { status: 401 })
    }

    // Získání parametrů
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate") || "7daysAgo"
    const endDate = searchParams.get("endDate") || "today"
    const format = searchParams.get("format") || "json"

    // Načtení analytics dat
    const analyticsData = await getAnalyticsData(startDate, endDate)

    // Export do různých formátů
    if (format === "csv") {
      const csv = convertToCSV(analyticsData)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="analytics-export.csv"',
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
      period: { startDate, endDate },
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chyba v analytics API:", error)
    return NextResponse.json({ error: "Chyba při načítání analytics dat" }, { status: 500 })
  }
}

function convertToCSV(data: any): string {
  const headers = ["Metrika", "Hodnota"]
  const rows = [
    ["Celkem uživatelů", data.totalUsers],
    ["Celkem relací", data.totalSessions],
    ["Zobrazení stránek", data.totalPageViews],
    ["Bounce rate", `${(data.bounceRate * 100).toFixed(1)}%`],
    ["Průměrná doba relace", `${Math.round(data.averageSessionDuration)}s`],
    ["Aktivní uživatelé", data.activeUsers],
  ]

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
    "",
    "Top stránky:",
    "Stránka,Zobrazení,Uživatelé",
    ...data.topPages.map((page: any) => `"${page.page}",${page.views},${page.users}`),
  ].join("\n")

  return csvContent
}
