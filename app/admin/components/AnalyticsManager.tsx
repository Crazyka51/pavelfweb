'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Eye, Globe, Clock } from 'lucide-react'

interface AnalyticsData {
  totalPageViews: number
  uniqueVisitors: number
  averageSessionDuration: string
  bounceRate: string
  topPages: Array<{ page: string; views: number }>
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
    
    // Simulace načítání dat - zde by v budoucnu bylo volání GA4 API
    setTimeout(() => {
      const mockData: AnalyticsData = {
        totalPageViews: Math.floor(Math.random() * 10000) + 5000,
        uniqueVisitors: Math.floor(Math.random() * 3000) + 1500,
        averageSessionDuration: `${Math.floor(Math.random() * 5) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        bounceRate: `${Math.floor(Math.random() * 30) + 25}%`,
        topPages: [
          { page: '/', views: Math.floor(Math.random() * 2000) + 1000 },
          { page: '/aktuality', views: Math.floor(Math.random() * 800) + 400 },
          { page: '/o-mne', views: Math.floor(Math.random() * 600) + 300 },
          { page: '/kontakt', views: Math.floor(Math.random() * 400) + 200 },
          { page: '/projekty', views: Math.floor(Math.random() * 300) + 150 }
        ],
        geographicData: [
          { country: 'Česká republika', visitors: Math.floor(Math.random() * 2000) + 1000 },
          { country: 'Slovensko', visitors: Math.floor(Math.random() * 300) + 100 },
          { country: 'Německo', visitors: Math.floor(Math.random() * 200) + 50 },
          { country: 'Rakousko', visitors: Math.floor(Math.random() * 150) + 30 },
          { country: 'Polsko', visitors: Math.floor(Math.random() * 100) + 20 }
        ],
        deviceData: [
          { device: 'Desktop', percentage: Math.floor(Math.random() * 20) + 50 },
          { device: 'Mobile', percentage: Math.floor(Math.random() * 20) + 30 },
          { device: 'Tablet', percentage: Math.floor(Math.random() * 10) + 10 }
        ],
        trafficSources: [
          { source: 'Organické vyhledávání', percentage: Math.floor(Math.random() * 20) + 40 },
          { source: 'Přímý přístup', percentage: Math.floor(Math.random() * 15) + 25 },
          { source: 'Sociální sítě', percentage: Math.floor(Math.random() * 10) + 15 },
          { source: 'Odkazy z jiných stránek', percentage: Math.floor(Math.random() * 10) + 10 },
          { source: 'Email', percentage: Math.floor(Math.random() * 5) + 5 }
        ]
      }
      
      setAnalyticsData(mockData)
      setIsLoading(false)
    }, 1000)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Celkem zobrazení</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalPageViews.toLocaleString()}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unikátní návštěvníci</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.uniqueVisitors.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Průměrná délka relace</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.averageSessionDuration}</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bounce Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.bounceRate}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
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
                <span className="text-sm text-gray-600">{page.page}</span>
                <span className="font-semibold">{page.views.toLocaleString()}</span>
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

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 rounded-full p-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900">Google Analytics připojeno</h4>
            <p className="text-sm text-blue-700 mt-1">
              Data se aktualizují automaticky z Google Analytics 4. 
              V současnosti zobrazujeme simulovaná data - pro reálná data je potřeba dokončit propojení s GA4 API.
            </p>
            <p className="text-xs text-blue-600 mt-2">
              Tracking ID: G-LNF9PDP1RH
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
