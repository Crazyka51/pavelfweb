import { BetaAnalyticsDataClient } from "@google-analytics/data"

// Initialize the Analytics Data API client
let analyticsDataClient: BetaAnalyticsDataClient | null = null

function getAnalyticsClient() {
  if (!analyticsDataClient) {
    try {
      // Parse the service account JSON from environment variable
      const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
      if (credentials) {
        const parsedCredentials = JSON.parse(credentials)
        analyticsDataClient = new BetaAnalyticsDataClient({
          credentials: parsedCredentials,
        })
      }
    } catch (error) {
      console.error("Failed to initialize Google Analytics client:", error)
    }
  }
  return analyticsDataClient
}

export interface AnalyticsData {
  totalUsers: number
  totalPageViews: number
  totalSessions: number
  bounceRate: number
  averageSessionDuration: number
  activeUsers: number
  topPages: Array<{
    page: string
    views: number
    users: number
  }>
  topCountries: Array<{
    country: string
    users: number
  }>
  deviceCategories: Array<{
    device: string
    users: number
    percentage: number
  }>
  trafficSources: Array<{
    source: string
    users: number
    percentage: number
  }>
}

export async function getAnalyticsData(
  propertyId: string,
  startDate = "7daysAgo",
  endDate = "today",
): Promise<AnalyticsData> {
  const client = getAnalyticsClient()

  if (!client || !propertyId) {
    // Return mock data if GA4 API is not configured
    return getMockAnalyticsData()
  }

  try {
    // Get basic metrics
    const [basicMetrics] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "totalUsers" },
        { name: "screenPageViews" },
        { name: "sessions" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
    })

    // Get active users (real-time)
    const [activeUsersReport] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: "activeUsers" }],
    })

    // Get top pages
    const [topPagesReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    })

    // Get top countries
    const [topCountriesReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 10,
    })

    // Get device categories
    const [deviceReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "totalUsers" }],
    })

    // Get traffic sources
    const [trafficSourcesReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
    })

    // Parse the data
    const totalUsers = Number.parseInt(basicMetrics.rows?.[0]?.metricValues?.[0]?.value || "0")
    const totalPageViews = Number.parseInt(basicMetrics.rows?.[0]?.metricValues?.[1]?.value || "0")
    const totalSessions = Number.parseInt(basicMetrics.rows?.[0]?.metricValues?.[2]?.value || "0")
    const bounceRate = Number.parseFloat(basicMetrics.rows?.[0]?.metricValues?.[3]?.value || "0")
    const averageSessionDuration = Number.parseFloat(basicMetrics.rows?.[0]?.metricValues?.[4]?.value || "0")
    const activeUsers = Number.parseInt(activeUsersReport.rows?.[0]?.metricValues?.[0]?.value || "0")

    // Parse top pages
    const topPages =
      topPagesReport.rows?.map((row) => ({
        page: row.dimensionValues?.[0]?.value || "",
        views: Number.parseInt(row.metricValues?.[0]?.value || "0"),
        users: Number.parseInt(row.metricValues?.[1]?.value || "0"),
      })) || []

    // Parse top countries
    const topCountries =
      topCountriesReport.rows?.map((row) => ({
        country: row.dimensionValues?.[0]?.value || "",
        users: Number.parseInt(row.metricValues?.[0]?.value || "0"),
      })) || []

    // Parse device categories
    const deviceData =
      deviceReport.rows?.map((row) => ({
        device: row.dimensionValues?.[0]?.value || "",
        users: Number.parseInt(row.metricValues?.[0]?.value || "0"),
      })) || []

    const totalDeviceUsers = deviceData.reduce((sum, item) => sum + item.users, 0)
    const deviceCategories = deviceData.map((item) => ({
      ...item,
      percentage: totalDeviceUsers > 0 ? (item.users / totalDeviceUsers) * 100 : 0,
    }))

    // Parse traffic sources
    const trafficData =
      trafficSourcesReport.rows?.map((row) => ({
        source: row.dimensionValues?.[0]?.value || "",
        users: Number.parseInt(row.metricValues?.[0]?.value || "0"),
      })) || []

    const totalTrafficUsers = trafficData.reduce((sum, item) => sum + item.users, 0)
    const trafficSources = trafficData.map((item) => ({
      ...item,
      percentage: totalTrafficUsers > 0 ? (item.users / totalTrafficUsers) * 100 : 0,
    }))

    return {
      totalUsers,
      totalPageViews,
      totalSessions,
      bounceRate,
      averageSessionDuration,
      activeUsers,
      topPages,
      topCountries,
      deviceCategories,
      trafficSources,
    }
  } catch (error) {
    console.error("Error fetching Google Analytics data:", error)
    return getMockAnalyticsData()
  }
}

function getMockAnalyticsData(): AnalyticsData {
  return {
    totalUsers: 1234,
    totalPageViews: 5678,
    totalSessions: 987,
    bounceRate: 45.2,
    averageSessionDuration: 180,
    activeUsers: 23,
    topPages: [
      { page: "/", views: 1500, users: 800 },
      { page: "/aktuality", views: 890, users: 450 },
      { page: "/kontakt", views: 340, users: 200 },
      { page: "/sluzby", views: 280, users: 150 },
      { page: "/o-nas", views: 220, users: 120 },
    ],
    topCountries: [
      { country: "Czech Republic", users: 800 },
      { country: "Slovakia", users: 200 },
      { country: "Germany", users: 150 },
      { country: "Austria", users: 84 },
    ],
    deviceCategories: [
      { device: "desktop", users: 650, percentage: 52.7 },
      { device: "mobile", users: 480, percentage: 38.9 },
      { device: "tablet", users: 104, percentage: 8.4 },
    ],
    trafficSources: [
      { source: "Organic Search", users: 600, percentage: 48.6 },
      { source: "Direct", users: 350, percentage: 28.4 },
      { source: "Social", users: 180, percentage: 14.6 },
      { source: "Referral", users: 104, percentage: 8.4 },
    ],
  }
}
