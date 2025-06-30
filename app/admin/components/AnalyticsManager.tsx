"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Eye,
  MousePointer,
  Clock,
  TrendingUp,
  Globe,
  Smartphone,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
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
  usersByCountry: Array<{
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
  dailyData: Array<{
    date: string
    users: number
    sessions: number
    pageViews: number
  }>
}

export default function AnalyticsManager() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState("7daysAgo")
  const [lastUpdated, setLastUpdated] = useState<string>("")

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("adminToken")
      if (!token) {
        throw new Error("Nejste přihlášeni")
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
      setError(err instanceof Error ? err.message : "Neznámá chyba")
      console.error("Chyba při načítání analytics:", err)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadAnalyticsData()

    // Auto-refresh každých 5 minut
    const interval = setInterval(loadAnalyticsData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadAnalyticsData])

  const handleExport = async (format: "json" | "csv") => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/admin/analytics?startDate=${period}&endDate=today&format=${format}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Chyba při exportu")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analytics-${period}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Chyba při exportu:", err)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatDate = (dateString: string) => {
    const year = dateString.substring(0, 4)
    const month = dateString.substring(4, 6)
    const day = dateString.substring(6, 8)
    return `${day}.${month}.${year}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Načítání...</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">Chyba: {error}</p>
              <Button onClick={loadAnalyticsData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Zkusit znovu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Přehled návštěvnosti webu
            {lastUpdated && (
              <span className="ml-2 text-xs">(aktualizováno: {new Date(lastUpdated).toLocaleString("cs-CZ")})</span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7daysAgo">Posledních 7 dní</SelectItem>
              <SelectItem value="30daysAgo">Posledních 30 dní</SelectItem>
              <SelectItem value="90daysAgo">Posledních 90 dní</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={loadAnalyticsData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Obnovit
          </Button>

          <Button variant="outline" onClick={() => handleExport("csv")}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Hlavní metriky */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkem uživatelů</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers.toLocaleString()}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Aktivní: {data.activeUsers}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zobrazení stránek</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(data.totalPageViews / data.totalSessions)} průměrně na relaci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data.bounceRate * 100).toFixed(1)}%</div>
            <Progress value={data.bounceRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Průměrná doba relace</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(data.averageSessionDuration)}</div>
            <p className="text-xs text-muted-foreground">{data.totalSessions.toLocaleString()} celkem relací</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailní analytics */}
      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pages">Top stránky</TabsTrigger>
          <TabsTrigger value="geography">Geografie</TabsTrigger>
          <TabsTrigger value="devices">Zařízení</TabsTrigger>
          <TabsTrigger value="sources">Zdroje</TabsTrigger>
          <TabsTrigger value="timeline">Časová osa</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Nejnavštěvovanější stránky</CardTitle>
              <CardDescription>Stránky s nejvyšší návštěvností</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topPages.map((page, index) => (
                  <div key={page.page} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{page.page}</p>
                        <p className="text-sm text-muted-foreground">{page.users.toLocaleString()} uživatelů</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{page.views.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">zobrazení</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography">
          <Card>
            <CardHeader>
              <CardTitle>Uživatelé podle zemí</CardTitle>
              <CardDescription>Geografické rozložení návštěvníků</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.usersByCountry.map((country) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{country.country}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Progress value={(country.users / data.totalUsers) * 100} className="w-20" />
                      <span className="font-bold w-16 text-right">{country.users.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Kategorie zařízení</CardTitle>
              <CardDescription>Rozložení podle typu zařízení</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.deviceCategories.map((device) => (
                  <div key={device.device} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium capitalize">{device.device}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Progress value={device.percentage} className="w-20" />
                      <span className="font-bold w-16 text-right">{device.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Zdroje návštěvnosti</CardTitle>
              <CardDescription>Odkud přicházejí návštěvníci</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.trafficSources.map((source) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{source.source}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Progress value={source.percentage} className="w-20" />
                      <span className="font-bold w-16 text-right">{source.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Denní přehled</CardTitle>
              <CardDescription>Vývoj návštěvnosti v čase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.dailyData.map((day) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatDate(day.date)}</span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <p className="font-bold">{day.users}</p>
                        <p className="text-muted-foreground">uživatelé</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">{day.sessions}</p>
                        <p className="text-muted-foreground">relace</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">{day.pageViews}</p>
                        <p className="text-muted-foreground">zobrazení</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
