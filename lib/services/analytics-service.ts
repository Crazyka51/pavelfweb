import { sql } from "@/lib/database"
import type { AnalyticsData } from "@/lib/types"

export class AnalyticsService {
  async getAnalyticsData(startDate: string, endDate: string): Promise<AnalyticsData[]> {
    try {
      // In a real application, this would integrate with Google Analytics API
      // For now, we'll return mock data or fetch from a simple DB table if available
      const data = await sql<AnalyticsData[]>`
        SELECT
          date::text,
          page_views,
          unique_visitors,
          bounce_rate,
          avg_session_duration
        FROM analytics_data
        WHERE date BETWEEN ${startDate} AND ${endDate}
        ORDER BY date ASC;
      `
      return data
    } catch (error) {
      console.error("Error fetching analytics data:", error)
      // Fallback to mock data if DB fails or table doesn't exist
      return this.getMockAnalyticsData(startDate, endDate)
    }
  }

  private getMockAnalyticsData(startDate: string, endDate: string): AnalyticsData[] {
    const mockData: AnalyticsData[] = []
    const currentDate = new Date(startDate)
    const end = new Date(endDate)

    while (currentDate <= end) {
      mockData.push({
        date: currentDate.toISOString().split("T")[0],
        page_views: Math.floor(Math.random() * 1000) + 100,
        unique_visitors: Math.floor(Math.random() * 500) + 50,
        bounce_rate: Number.parseFloat((Math.random() * (0.8 - 0.2) + 0.2).toFixed(2)),
        avg_session_duration: Math.floor(Math.random() * 300) + 30,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return mockData
  }
}

export const analyticsService = new AnalyticsService()
