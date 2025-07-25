"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChartIcon, NewspaperIcon, MailIcon, UsersIcon, SettingsIcon } from "lucide-react"
import Link from "next/link"
import Button from "@/components/ui/button"

export function Dashboard() {
  // Mock data for demonstration
  const stats = {
    totalArticles: 125,
    publishedArticles: 98,
    totalSubscribers: 750,
    newSubscribersLast30Days: 45,
    totalCampaignsSent: 22,
    pageViewsLast7Days: 12345,
  }

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">Přehled administrace</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkem článků</CardTitle>
            <NewspaperIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stats.publishedArticles} publikovaných</p>
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
            <CardTitle className="text-sm font-medium">Odeslané kampaně</CardTitle>
            <MailIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaignsSent}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Celkem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zobrazení stránek</CardTitle>
            <BarChartIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pageViewsLast7Days}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Za posledních 7 dní</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rychlé akce</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/admin/articles/new">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center bg-transparent"
              >
                <NewspaperIcon className="h-6 w-6 mb-2" />
                Nový článek
              </Button>
            </Link>
            <Link href="/admin?tab=newsletter">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center bg-transparent"
              >
                <MailIcon className="h-6 w-6 mb-2" />
                Odeslat newsletter
              </Button>
            </Link>
            <Link href="/admin?tab=analytics">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center bg-transparent"
              >
                <BarChartIcon className="h-6 w-6 mb-2" />
                Zobrazit analytiku
              </Button>
            </Link>
            <Link href="/admin?tab=settings">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center bg-transparent"
              >
                <SettingsIcon className="h-6 w-6 mb-2" />
                Nastavení
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Poslední aktivity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <span className="font-medium">Admin</span> publikoval článek "Novinky z radnice"{" "}
                <span className="text-gray-500 text-xs">před 2 hodinami</span>
              </li>
              <li>
                <span className="font-medium">Uživatel</span> se přihlásil k newsletteru{" "}
                <span className="text-gray-500 text-xs">před 1 dnem</span>
              </li>
              <li>
                <span className="font-medium">Admin</span> upravil nastavení webu{" "}
                <span className="text-gray-500 text-xs">před 3 dny</span>
              </li>
              <li>
                <span className="font-medium">Admin</span> vytvořil novou kategorii "Kultura"{" "}
                <span className="text-gray-500 text-xs">před 5 dny</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
