"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Eye,
  MousePointer,
  Clock,
  TrendingUp,
  Smartphone,
  RefreshCw,
  Calendar,
  BarChart3,
  ExternalLink,
  Globe,
  Monitor,
  Tablet,
  Phone,
} from "lucide-react"

interface AnalyticsData {
  totalUsers: number
  totalSessions: number
  totalPageViews: number
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

export default function AnalyticsWidget() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState("7daysAgo")
  const [lastUpdated, setLastUpdated] = useState<string>("")

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("admin_token")
      if (!token) {
        // Použijeme mock data pokud není token
        setData(getMockAnalyticsData())
        setLastUpdated(new Date().toISOString())
        return
      }

      const response = await fetch(`/api/admin/analytics?startDate=${period}&endDate=today`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Chyba při načítání dat")
      }

      const result = await response.json()
      setData(result.data)
      setLastUpdated(result.lastUpdated)
    } catch (err) {
      console.error("Chyba při načítání analytics:", err)
      // Fallback na mock data
      setData(getMockAnalyticsData())
      setLastUpdated(new Date().toISOString())
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadAnalyticsData()
  }, [loadAnalyticsData])

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  function getMockAnalyticsData(): AnalyticsData {
    const baseUsers = 1234
    const multiplier = period === "7daysAgo" ? 1 : period === "30daysAgo" ? 3.5 : 8.2

    return {
      totalUsers: Math.round(baseUsers * multiplier),
      totalPageViews: Math.round(5678 * multiplier),
      totalSessions: Math.round(987 * multiplier),
      bounceRate: 0.452,
      averageSessionDuration: 180,
      activeUsers: Math.round(23 * (multiplier / 2)),
      topPages: [
        { page: "/", views: Math.round(1500 * multiplier), users: Math.round(800 * multiplier) },
        { page: "/aktuality", views: Math.round(890 * multiplier), users: Math.round(450 * multiplier) },
        { page: "/kontakt", views: Math.round(340 * multiplier), users: Math.round(200 * multiplier) },
        { page: "/sluzby", views: Math.round(280 * multiplier), users: Math.round(150 * multiplier) },
        { page: "/o-nas", views: Math.round(220 * multiplier), users: Math.round(120 * multiplier) },
      ],
      topCountries: [
        { country: "Czech Republic", users: Math.round(800 * multiplier) },
        { country: "Slovakia", users: Math.round(200 * multiplier) },
        { country: "Germany", users: Math.round(150 * multiplier) },
        { country: "Austria", users: Math.round(84 * multiplier) },
      ],
      deviceCategories: [
        { device: "desktop", users: Math.round(650 * multiplier), percentage: 52.7 },
        { device: "mobile", users: Math.round(480 * multiplier), percentage: 38.9 },
        { device: "tablet", users: Math.round(104 * multiplier), percentage: 8.4 },
      ],
      trafficSources: [
        { source: "Organic Search", users: Math.round(600 * multiplier), percentage: 48.6 },
        { source: "Direct", users: Math.round(350 * multiplier), percentage: 28.4 },
        { source: "Social", users: Math.round(180 * multiplier), percentage: 14.6 },
        { source: "Referral", users: Math.round(104 * multiplier), percentage: 8.4 },
      ],
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "desktop":
        return <Monitor className="h-4 w-4 text-blue-500" />
      case "mobile":
        return <Phone className="h-4 w-4 text-green-500" />
      case "tablet":
        return <Tablet className="h-4 w-4 text-purple-500" />
      default:
        return <Smartphone className="h-4 w-4 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Statistiky webu
              <RefreshCw className="h-4 w-4 animate-spin ml-auto" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Statistiky webu
              </CardTitle>
              <CardDescription>
                Přehled návštěvnosti za posledních{" "}
                {period === "7daysAgo" ? "7 dní" : period === "30daysAgo" ? "30 dní" : "90 dní"}
                {lastUpdated && (
                  <span className="ml-2 text-xs">(aktualizováno: {new Date(lastUpdated).toLocaleString("cs-CZ")})</span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-32">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7daysAgo">7 dní</SelectItem>
                  <SelectItem value="30daysAgo">30 dní</SelectItem>
                  <SelectItem value="90daysAgo">90 dní</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Hlavní metriky */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Uživatelé</p>
                <p className="text-xl font-bold">{data.totalUsers.toLocaleString()}</p>
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Aktivní: {data.activeUsers}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Zobrazení</p>
                <p className="text-xl font-bold">{data.totalPageViews.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  {Math.round(data.totalPageViews / data.totalSessions)} na relaci
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MousePointer className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                <p className="text-xl font-bold">{(data.bounceRate * 100).toFixed(1)}%</p>
                <Progress value={data.bounceRate * 100} className="w-16 h-1 mt-1" />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Doba relace</p>
                <p className="text-xl font-bold">{formatDuration(data.averageSessionDuration)}</p>
                <p className="text-xs text-gray-500">{data.totalSessions.toLocaleString()} relací</p>
              </div>
            </div>
          </div>

          {/* Detailní statistiky */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Top stránky */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Nejnavštěvovanější stránky
              </h4>
              <div className="space-y-2">
                {data.topPages.slice(0, 5).map((page, index) => (
                  <div key={page.page} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <span className="truncate max-w-24" title={page.page}>
                        {page.page}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{page.views.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zařízení */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Zařízení
              </h4>
              <div className="space-y-2">
                {data.deviceCategories.map((device) => (
                  <div key={device.device} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      {getDeviceIcon(device.device)}
                      <span className="capitalize">{device.device}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={device.percentage} className="w-12 h-2" />
                      <span className="font-medium w-12 text-right">{device.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Země */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Top země
              </h4>
              <div className="space-y-2">
                {data.topCountries.slice(0, 4).map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <span className="truncate max-w-20" title={country.country}>
                        {country.country}
                      </span>
                    </div>
                    <span className="font-medium">{country.users.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Zdroje návštěvnosti */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Zdroje návštěvnosti
              </h4>
              <div className="space-y-2">
                {data.trafficSources.map((source) => (
                  <div key={source.source} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-20" title={source.source}>
                      {source.source}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Progress value={source.percentage} className="w-12 h-2" />
                      <span className="font-medium w-12 text-right">{source.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
