'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Eye, Globe, Clock } from 'lucide-react'

interface AnalyticsData {
  totalPageViews: number
  uniqueVisitors: number
  averageSessionDuration: string
  bounceRate: string
  realTimeUsers: number
  conversions: number
  pageLoadTime: string
  topPages: Array<{ page: string; views: number; title: string }>
  geographicData: Array<{ country: string; visitors: number }>
  deviceData: Array<{ device: string; percentage: number }>
  trafficSources: Array<{ source: string; percentage: number }>
}

export default function AnalyticsManager() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalPageViews: 0,
    uniqueVisitors: 0,
    averageSessionDuration: '0:00',
    bounceRate: '0%',
    realTimeUsers: 0,
    conversions: 0,
    pageLoadTime: '0s',
    topPages: [],
    geographicData: [],
    deviceData: [],
    trafficSources: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7d')

  useEffect(() => {
    loadAnalyticsData()
  }, [dateRange])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/analytics?dateRange=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        console.error('Failed to load analytics data')
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Přehled návštěvnosti a chování uživatelů na vašich stránkách
          </p>
        </div>
        <div className="flex gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Posledních 7 dní</option>
            <option value="30d">Posledních 30 dní</option>
            <option value="90d">Posledních 90 dní</option>
          </select>
          <button 
            onClick={loadAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Obnovit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Celkem zobrazení</p>
              <p className="text-xl font-bold text-gray-900">{analyticsData.totalPageViews.toLocaleString()}</p>
            </div>
            <Eye className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Unikátní návštěvníci</p>
              <p className="text-xl font-bold text-gray-900">{analyticsData.uniqueVisitors.toLocaleString()}</p>
            </div>
            <Users className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Aktuálně online</p>
              <p className="text-xl font-bold text-gray-900">{analyticsData.realTimeUsers}</p>
            </div>
            <Globe className="h-6 w-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Průměrná relace</p>
              <p className="text-xl font-bold text-gray-900">{analyticsData.averageSessionDuration}</p>
            </div>
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Bounce Rate</p>
              <p className="text-xl font-bold text-gray-900">{analyticsData.bounceRate}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Konverze</p>
              <p className="text-xl font-bold text-gray-900">{analyticsData.conversions}</p>
            </div>
            <BarChart3 className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Nejnavštěvovanější stránky
          </h3>
          <div className="space-y-3">
            {analyticsData.topPages.map((page, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{page.title}</span>
                  <span className="text-xs text-gray-500">{page.page}</span>
                </div>
                <span className="font-semibold text-blue-600">{page.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Data */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Návštěvníci podle zemí
          </h3>
          <div className="space-y-3">
            {analyticsData.geographicData.map((country, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{country.country}</span>
                <span className="font-semibold">{country.visitors.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Device Data */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Zařízení návštěvníků</h3>
          <div className="space-y-3">
            {analyticsData.deviceData.map((device, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{device.device}</span>
                <span className="font-semibold">{device.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Zdroje návštěvnosti</h3>
          <div className="space-y-3">
            {analyticsData.trafficSources.map((source, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{source.source}</span>
                <span className="font-semibold">{source.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Rychlost načítání</p>
              <p className="text-2xl font-bold">{analyticsData.pageLoadTime}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Celkové konverze</p>
              <p className="text-2xl font-bold">{analyticsData.conversions}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Uživatelé nyní</p>
              <p className="text-2xl font-bold">{analyticsData.realTimeUsers}</p>
            </div>
            <Globe className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 rounded-full p-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 text-lg">Google Analytics 4 Integration</h4>
            <p className="text-blue-700 mt-2">
              Administrace je připojena k Google Analytics a zobrazuje aktuální metriky z vašich stránek. 
              Data se aktualizují automaticky a poskytují přehled o návštěvnosti a chování uživatelů.
            </p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Tracking ID:</span>
                <br />
                <span className="text-blue-600 font-mono">G-LNF9PDP1RH</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Posledně aktualizováno:</span>
                <br />
                <span className="text-blue-600">Před chvílí</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Stav:</span>
                <br />
                <span className="text-green-600 font-medium">✓ Aktivní</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Období:</span>
                <br />
                <span className="text-blue-600">{dateRange === '7d' ? '7 dní' : dateRange === '30d' ? '30 dní' : '90 dní'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
