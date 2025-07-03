"use client"

import { useState, useEffect } from "react"
import { BarChart3, Users, Eye, Clock, TrendingUp, Globe, Smartphone, Monitor } from "lucide-react"

interface AnalyticsData {
  pageViews: {
    total: number
    thisMonth: number
    change: number
  }
  uniqueVisitors: {
    total: number
    thisMonth: number
    change: number
  }
  avgSessionDuration: {
    minutes: number
    change: number
  }
  bounceRate: {
    percentage: number
    change: number
  }
  topPages: Array<{
    path: string
    views: number
    title: string
  }>
  deviceTypes: Array<{
    type: string
    percentage: number
    count: number
  }>
  trafficSources: Array<{
    source: string
    percentage: number
    count: number
  }>
  dailyViews: Array<{
    date: string
    views: number
    visitors: number
  }>
}

export default function AnalyticsManager() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("30d")

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedPeriod])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // Mock data pro demonstraci
      const mockData: AnalyticsData = {
        pageViews: {
          total: 12547,
          thisMonth: 3421,
          change: 12.5,
        },
        uniqueVisitors: {
          total: 8934,
          thisMonth: 2156,
          change: 8.3,
        },
        avgSessionDuration: {
          minutes: 3.2,
          change: -5.1,
        },
        bounceRate: {
          percentage: 42.8,
          change: -2.3,
        },
        topPages: [
          { path: "/", views: 4521, title: "Hlavní stránka" },
          { path: "/aktuality", views: 2134, title: "Aktuality" },
          { path: "/aktuality/dopravni-opatreni", views: 1876, title: "Dopravní opatření" },
          { path: "/kontakt", views: 1234, title: "Kontakt" },
          { path: "/aktuality/mestska-politika", views: 987, title: "Městská politika" },
        ],
        deviceTypes: [
          { type: "Desktop", percentage: 58.3, count: 5208 },
          { type: "Mobile", percentage: 35.7, count: 3191 },
          { type: "Tablet", percentage: 6.0, count: 535 },
        ],
        trafficSources: [
          { source: "Přímý přístup", percentage: 45.2, count: 4038 },
          { source: "Google", percentage: 32.1, count: 2868 },
          { source: "Facebook", percentage: 12.4, count: 1108 },
          { source: "Ostatní", percentage: 10.3, count: 920 },
        ],
        dailyViews: [
          { date: "2024-02-01", views: 234, visitors: 187 },
          { date: "2024-02-02", views: 267, visitors: 201 },
          { date: "2024-02-03", views: 189, visitors: 156 },
          { date: "2024-02-04", views: 298, visitors: 234 },
          { date: "2024-02-05", views: 345, visitors: 267 },
          { date: "2024-02-06", views: 312, visitors: 245 },
          { date: "2024-02-07", views: 278, visitors: 221 },
        ],
      }

      // Simulace API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setAnalyticsData(mockData)
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("cs-CZ").format(num)
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : ""
    const color = change >= 0 ? "text-green-600" : "text-red-600"
    return (
      <span className={color}>
        {sign}
        {change.toFixed(1)}%
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nepodařilo se načíst analytická data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Přehledy návštěvnosti a výkonu webu</p>
        </div>
        <div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Posledních 7 dní</option>
            <option value="30d">Posledních 30 dní</option>
            <option value="90d">Posledních 90 dní</option>
          </select>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Zobrazení stránek</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.pageViews.total)}</p>
              <p className="text-sm">{formatChange(analyticsData.pageViews.change)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unikátní návštěvníci</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.uniqueVisitors.total)}</p>
              <p className="text-sm">{formatChange(analyticsData.uniqueVisitors.change)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Průměrná doba návštěvy</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.avgSessionDuration.minutes}m</p>
              <p className="text-sm">{formatChange(analyticsData.avgSessionDuration.change)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bounce rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.bounceRate.percentage}%</p>
              <p className="text-sm">{formatChange(analyticsData.bounceRate.change)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and detailed data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top pages */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Nejnavštěvovanější stránky</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.topPages.map((page, index) => (
                <div key={page.path} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{page.title}</p>
                    <p className="text-sm text-gray-500 truncate">{page.path}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatNumber(page.views)}</p>
                    <p className="text-xs text-gray-500">zobrazení</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device types */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Typy zařízení</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.deviceTypes.map((device) => {
                const Icon = device.type === "Desktop" ? Monitor : device.type === "Mobile" ? Smartphone : Globe
                return (
                  <div key={device.type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{device.type}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${device.percentage}%` }}></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{device.percentage}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Traffic sources */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Zdroje návštěvnosti</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.trafficSources.map((source) => (
                <div key={source.source} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{source.source}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${source.percentage}%` }}></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{source.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily views chart */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Denní návštěvnost</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {analyticsData.dailyViews.map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString("cs-CZ", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{day.views}</p>
                      <p className="text-xs text-gray-500">zobrazení</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{day.visitors}</p>
                      <p className="text-xs text-gray-500">návštěvníci</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900">Poznámka k analytickým datům</h4>
            <p className="text-sm text-blue-700 mt-1">
              Tato data jsou simulovaná pro demonstraci. V produkční verzi budou připojena skutečná analytická data z
              Google Analytics nebo jiného nástroje.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
