import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Force dynamic rendering pro Analytics API
export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Pomocné funkce pro autentifikaci
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // Ověření autentifikace
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ message: 'Neautorizovaný přístup' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const dateRange = searchParams.get('dateRange') || '7d'
    
    // Prozatím používáme mock data s lepší simulací reálných GA4 dat
    // V budoucnu zde bude integrace s Google Analytics Data API v4
    const mockAnalyticsData = {
      totalPageViews: generateRandomMetric(5000, 15000, dateRange),
      uniqueVisitors: generateRandomMetric(1500, 5000, dateRange),
      averageSessionDuration: generateSessionDuration(),
      bounceRate: generateBounceRate(),
      topPages: [
        { page: '/', views: generateRandomMetric(1000, 3000, dateRange), title: 'Domovská stránka' },
        { page: '/aktuality', views: generateRandomMetric(400, 1200, dateRange), title: 'Aktuality' },
        { page: '/o-mne', views: generateRandomMetric(300, 800, dateRange), title: 'O mně' },
        { page: '/kontakt', views: generateRandomMetric(200, 600, dateRange), title: 'Kontakt' },
        { page: '/projekty', views: generateRandomMetric(150, 400, dateRange), title: 'Projekty' }
      ],
      geographicData: [
        { country: 'Česká republika', visitors: generateRandomMetric(800, 2000, dateRange) },
        { country: 'Slovensko', visitors: generateRandomMetric(50, 150, dateRange) },
        { country: 'Německo', visitors: generateRandomMetric(20, 80, dateRange) },
        { country: 'Rakousko', visitors: generateRandomMetric(15, 60, dateRange) },
        { country: 'Ostatní', visitors: generateRandomMetric(30, 100, dateRange) }
      ],
      deviceData: [
        { device: 'Desktop', percentage: Math.floor(Math.random() * 20) + 45 },
        { device: 'Mobile', percentage: Math.floor(Math.random() * 15) + 35 },
        { device: 'Tablet', percentage: Math.floor(Math.random() * 10) + 10 }
      ],
      trafficSources: [
        { source: 'Organic Search', percentage: Math.floor(Math.random() * 15) + 40 },
        { source: 'Direct', percentage: Math.floor(Math.random() * 10) + 25 },
        { source: 'Social Media', percentage: Math.floor(Math.random() * 8) + 15 },
        { source: 'Referral', percentage: Math.floor(Math.random() * 5) + 8 },
        { source: 'Email', percentage: Math.floor(Math.random() * 3) + 2 }
      ],
      realTimeUsers: Math.floor(Math.random() * 50) + 10,
      conversions: generateRandomMetric(5, 25, dateRange),
      pageLoadTime: `${(Math.random() * 2 + 1).toFixed(2)}s`
    }

    return NextResponse.json(mockAnalyticsData)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání analytics dat' },
      { status: 500 }
    )
  }
}

// Pomocné funkce pro generování realistických dat
function generateRandomMetric(min: number, max: number, dateRange: string): number {
  const multiplier = dateRange === '30d' ? 4 : dateRange === '7d' ? 1 : 0.5
  return Math.floor((Math.random() * (max - min) + min) * multiplier)
}

function generateSessionDuration(): string {
  const minutes = Math.floor(Math.random() * 8) + 2
  const seconds = Math.floor(Math.random() * 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function generateBounceRate(): string {
  return `${Math.floor(Math.random() * 25) + 25}%`
}
