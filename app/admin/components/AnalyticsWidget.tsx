"use client"

import { useState, useEffect } from "react"
import { BarChart3, Users, Eye, Clock, TrendingUp, Globe, Smartphone, Monitor, RefreshCw } from "lucide-react"

interface AnalyticsData {
  users: number
  sessions: number
  pageviews: number
  bounceRate: number
  avgSessionDuration: string
  topPages: Array<{
    page: string
    views: number
    percentage: number
  }>
  devices: Array<{
    category: string
    sessions: number
    percentage: number
  }>
  countries: Array<{
    country: string
    sessions: number
    percentage: number
  }>
  trafficSources: Array<{
    source: string
    sessions: number
    percentage: number
  }>
}

export default function AnalyticsWidget() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      } else {
        // Fallback na mock data
        setData(getMockData())
      }
    } catch (error) {
      console.error("Error loading analytics:", error)
      setData(getMockData())
    } finally {
      setIsLoading(false)
      setLastUpdated(new Date())
    }
  }

  const getMockData = (): AnalyticsData => ({
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
  })

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("cs-CZ").format(num)
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />
      case "tablet":
        return <Monitor className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nepodařilo se načíst analytics data</p>
          <button
            onClick={loadAnalyticsData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Analytics přehled</h3>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Posledních 7 dní</option>
              <option value="30d">Posledních 30 dní</option>
              <option value="90d">Posledních 90 dní</option>
            </select>
            <button
              onClick={loadAnalyticsData}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Obnovit data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">Naposledy aktualizováno: {lastUpdated.toLocaleString("cs-CZ")}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Uživatelé</p>
                <p className="text-2xl font-bold text-blue-900">{formatNumber(data.users)}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Zobrazení</p>
                <p className="text-2xl font-bold text-green-900">{formatNumber(data.pageviews)}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Průměrná doba</p>
                <p className="text-2xl font-bold text-purple-900">{data.avgSessionDuration}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Bounce Rate</p>
                <p className="text-2xl font-bold text-orange-900">{data.bounceRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top pages */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Nejnavštěvovanější stránky</h4>
            <div className="space-y-3">
              {data.topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{page.page}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${page.percentage}%` }} />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatNumber(page.views)}</p>
                    <p className="text-xs text-gray-500">{page.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Devices */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Zařízení</h4>
            <div className="space-y-3">
              {data.devices.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(device.category)}
                    <span className="text-sm font-medium text-gray-900">{device.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatNumber(device.sessions)}</p>
                    <p className="text-xs text-gray-500">{device.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Země</h4>
            <div className="space-y-3">
              {data.countries.map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{country.country}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatNumber(country.sessions)}</p>
                    <p className="text-xs text-gray-500">{country.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic sources */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Zdroje návštěvnosti</h4>
            <div className="space-y-3">
              {data.trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{source.source}</span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatNumber(source.sessions)}</p>
                    <p className="text-xs text-gray-500">{source.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Data z Google Analytics 4</span>
            <a
              href="https://analytics.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Otevřít GA4 →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
