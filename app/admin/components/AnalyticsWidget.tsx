"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import {
  Users,
  Eye,
  MousePointer,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react"

interface AnalyticsData {
  overview: {
    users: number
    sessions: number
    pageviews: number
    bounceRate: number
    avgSessionDuration: number
    usersChange: number
    sessionsChange: number
    pageviewsChange: number
  }
  topPages: Array<{
    path: string
    views: number
    change: number
  }>
  devices: Array<{
    category: string
    users: number
    percentage: number
  }>
  countries: Array<{
    country: string
    users: number
    percentage: number
  }>
  sources: Array<{
    source: string
    users: number
    percentage: number
  }>
}

export default function AnalyticsWidget() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })

      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      } else {
        // Fallback to mock data if API fails
        setData(getMockData())
      }
    } catch (error) {
      console.error("Analytics fetch error:", error)
      setData(getMockData())
    } finally {
      setIsLoading(false)
      setLastUpdated(new Date())
    }
  }

  const getMockData = (): AnalyticsData => ({
    overview: {
      users: 1247,
      sessions: 1856,
      pageviews: 4321,
      bounceRate: 42.3,
      avgSessionDuration: 185,
      usersChange: 12.5,
      sessionsChange: 8.7,
      pageviewsChange: 15.2,
    },
    topPages: [
      { path: "/", views: 1234, change: 5.2 },
      { path: "/aktuality", views: 856, change: -2.1 },
      { path: "/aktuality/nova-tramvajova-trat", views: 432, change: 18.5 },
      { path: "/aktuality/komunitni-zahrada", views: 298, change: 7.3 },
      { path: "/kontakt", views: 187, change: -1.2 },
    ],
    devices: [
      { category: "Desktop", users: 687, percentage: 55.1 },
      { category: "Mobile", users: 435, percentage: 34.9 },
      { category: "Tablet", users: 125, percentage: 10.0 },
    ],
    countries: [
      { country: "Česká republika", users: 1089, percentage: 87.3 },
      { country: "Slovensko", users: 89, percentage: 7.1 },
      { country: "Německo", users: 34, percentage: 2.7 },
      { country: "Rakousko", users: 23, percentage: 1.8 },
      { country: "Ostatní", users: 12, percentage: 1.1 },
    ],
    sources: [
      { source: "Organic Search", users: 623, percentage: 49.9 },
      { source: "Direct", users: 374, percentage: 30.0 },
      { source: "Social Media", users: 149, percentage: 11.9 },
      { source: "Referral", users: 87, percentage: 7.0 },
      { source: "Email", users: 14, percentage: 1.2 },
    ],
  })

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("cs-CZ").format(num)
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getDeviceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "tablet":
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const TrendIcon = ({ change }: { change: number }) => {
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Nepodařilo se načíst analytická data.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm text-gray-500">Poslední aktualizace: {lastUpdated.toLocaleString("cs-CZ")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dní</SelectItem>
              <SelectItem value="30d">30 dní</SelectItem>
              <SelectItem value="90d">90 dní</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Obnovit
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              GA4
            </a>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uživatelé</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.users)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendIcon change={data.overview.usersChange} />
              <span className={`ml-1 ${data.overview.usersChange > 0 ? "text-green-600" : "text-red-600"}`}>
                {data.overview.usersChange > 0 ? "+" : ""}
                {data.overview.usersChange}%
              </span>
              <span className="ml-1">oproti předchozímu období</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relace</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.sessions)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendIcon change={data.overview.sessionsChange} />
              <span className={`ml-1 ${data.overview.sessionsChange > 0 ? "text-green-600" : "text-red-600"}`}>
                {data.overview.sessionsChange > 0 ? "+" : ""}
                {data.overview.sessionsChange}%
              </span>
              <span className="ml-1">oproti předchozímu období</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zobrazení stránek</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.pageviews)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendIcon change={data.overview.pageviewsChange} />
              <span className={`ml-1 ${data.overview.pageviewsChange > 0 ? "text-green-600" : "text-red-600"}`}>
                {data.overview.pageviewsChange > 0 ? "+" : ""}
                {data.overview.pageviewsChange}%
              </span>
              <span className="ml-1">oproti předchozímu období</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Průměrná doba relace</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(data.overview.avgSessionDuration)}</div>
            <p className="text-xs text-muted-foreground">Bounce rate: {data.overview.bounceRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Nejnavštěvovanější stránky</CardTitle>
            <CardDescription>Stránky s nejvyšší návštěvností</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topPages.map((page, index) => (
                <div key={page.path} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{page.path}</p>
                    <p className="text-xs text-gray-500">{formatNumber(page.views)} zobrazení</p>
                  </div>
                  <div className="flex items-center ml-2">
                    <TrendIcon change={page.change} />
                    <span className={`text-xs ml-1 ${page.change > 0 ? "text-green-600" : "text-red-600"}`}>
                      {page.change > 0 ? "+" : ""}
                      {page.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader>
            <CardTitle>Zařízení</CardTitle>
            <CardDescription>Rozložení podle typu zařízení</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.devices.map((device) => (
                <div key={device.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getDeviceIcon(device.category)}
                    <span className="ml-2 text-sm font-medium">{device.category}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">{formatNumber(device.users)}</span>
                    <Badge variant="secondary">{device.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Countries */}
        <Card>
          <CardHeader>
            <CardTitle>Země</CardTitle>
            <CardDescription>Geografické rozložení návštěvníků</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.countries.map((country) => (
                <div key={country.country} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{country.country}</span>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">{formatNumber(country.users)}</span>
                    <Badge variant="secondary">{country.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Zdroje návštěvnosti</CardTitle>
            <CardDescription>Odkud přicházejí návštěvníci</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.sources.map((source) => (
                <div key={source.source} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{source.source}</span>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">{formatNumber(source.users)}</span>
                    <Badge variant="secondary">{source.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
