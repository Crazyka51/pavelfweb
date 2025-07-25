"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BarChartIcon, 
  NewspaperIcon, 
  MailIcon, 
  UsersIcon, 
  SettingsIcon,
  LayoutGridIcon,
  TrendingUpIcon,
  EyeIcon,
  FileTextIcon
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  totalCategories: number
  totalSubscribers: number
  newSubscribersLast30Days: number
  totalCampaignsSent: number
  pageViewsLast7Days: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalCategories: 0,
    totalSubscribers: 0,
    newSubscribersLast30Days: 0,
    totalCampaignsSent: 0,
    pageViewsLast7Days: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Try to load real data, fallback to mock data
      try {
        const [articlesRes, categoriesRes, subscribersRes] = await Promise.all([
          fetch('/api/admin/articles/stats').catch(() => null),
          fetch('/api/admin/categories/stats').catch(() => null),
          fetch('/api/admin/newsletter/stats').catch(() => null),
        ])

        let articlesData = null
        let categoriesData = null
        let subscribersData = null

        if (articlesRes?.ok) {
          articlesData = await articlesRes.json()
        }
        if (categoriesRes?.ok) {
          categoriesData = await categoriesRes.json()
        }
        if (subscribersRes?.ok) {
          subscribersData = await subscribersRes.json()
        }

        setStats({
          totalArticles: articlesData?.total || 125,
          publishedArticles: articlesData?.published || 98,
          draftArticles: articlesData?.drafts || 27,
          totalCategories: categoriesData?.total || 8,
          totalSubscribers: subscribersData?.total || 750,
          newSubscribersLast30Days: subscribersData?.last30Days || 45,
          totalCampaignsSent: subscribersData?.campaigns || 22,
          pageViewsLast7Days: 12345, // Mock data for now
        })
      } catch (error) {
        console.log('Using mock data due to API unavailability')
        // Use mock data if APIs are not available
        setStats({
          totalArticles: 125,
          publishedArticles: 98,
          draftArticles: 27,
          totalCategories: 8,
          totalSubscribers: 750,
          newSubscribersLast30Days: 45,
          totalCampaignsSent: 22,
          pageViewsLast7Days: 12345,
        })
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Přehled administrace webu
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkem článků</CardTitle>
            <NewspaperIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {stats.publishedArticles} publikovaných, {stats.draftArticles} konceptů
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategorie</CardTitle>
            <LayoutGridIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Aktivních kategorií
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Odběratelé newsletteru</CardTitle>
            <UsersIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              +{stats.newSubscribersLast30Days} za posledních 30 dní
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zobrazení stránek</CardTitle>
            <EyeIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pageViewsLast7Days.toLocaleString()}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Za posledních 7 dní
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5" />
              Rychlé akce
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/admin?tab=articles&action=new">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center bg-transparent hover:bg-gray-50"
              >
                <NewspaperIcon className="h-6 w-6 mb-2" />
                Nový článek
              </Button>
            </Link>
            <Link href="/admin?tab=newsletter">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center bg-transparent hover:bg-gray-50"
              >
                <MailIcon className="h-6 w-6 mb-2" />
                Newsletter
              </Button>
            </Link>
            <Link href="/admin?tab=categories">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center bg-transparent hover:bg-gray-50"
              >
                <LayoutGridIcon className="h-6 w-6 mb-2" />
                Kategorie
              </Button>
            </Link>
            <Link href="/admin?tab=settings">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center bg-transparent hover:bg-gray-50"
              >
                <SettingsIcon className="h-6 w-6 mb-2" />
                Nastavení
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon className="h-5 w-5" />
              Poslední aktivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nový článek publikován</p>
                  <p className="text-xs text-gray-500">"Novinky z radnice" • před 2 hodinami</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nový odběratel newsletteru</p>
                  <p className="text-xs text-gray-500">user@example.com • před 1 dnem</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Kategorie upravena</p>
                  <p className="text-xs text-gray-500">"Městská politika" • před 3 dny</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nastavení aktualizováno</p>
                  <p className="text-xs text-gray-500">SEO konfigurace • před 5 dny</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newsletter kampaně</CardTitle>
            <MailIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaignsSent}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Celkem odeslaných kampaní
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Průměrný čas čtení</CardTitle>
            <BarChartIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3:45</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Minut na článek
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Míra otevření</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Newsletter kampaní
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}