"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChartIcon, UsersIcon, ClockIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"

interface AnalyticsSummary {
  totalViews: number
  uniqueVisitors: number
  avgTimeOnPage: string
  viewsChange: number
  visitorsChange: number
  timeChange: number
}

export function AnalyticsWidget() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      setError(null)
      try {
        // In a real application, you'd fetch this from your backend API
        // const response = await fetch('/api/admin/analytics/summary');
        // if (!response.ok) {
        //   throw new Error('Failed to fetch analytics summary');
        // }
        // const data = await response.json();
        // setSummary(data);

        // Mock data for demonstration
        const mockData: AnalyticsSummary = {
          totalViews: 2350,
          uniqueVisitors: 1890,
          avgTimeOnPage: "03:45",
          viewsChange: 20.1,
          visitorsChange: 15.5,
          timeChange: 5.2,
        }
        setSummary(mockData)
      } catch (err: any) {
        console.error("Error fetching analytics summary:", err)
        setError("Nepodařilo se načíst souhrn analytiky.")
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-[100px]" />
            </CardTitle>
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[150px] mb-2" />
            <Skeleton className="h-4 w-[200px]" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-[100px]" />
            </CardTitle>
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[150px] mb-2" />
            <Skeleton className="h-4 w-[200px]" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-[100px]" />
            </CardTitle>
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[150px] mb-2" />
            <Skeleton className="h-4 w-[200px]" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Chyba při načítání analytiky: {error}</div>
  }

  if (!summary) {
    return null // Or a message indicating no data
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Celkový počet zobrazení</CardTitle>
          <BarChartIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalViews.toLocaleString()}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">+{summary.viewsChange}% od minulého měsíce</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unikátní návštěvníci</CardTitle>
          <UsersIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.uniqueVisitors.toLocaleString()}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">+{summary.visitorsChange}% od minulého měsíce</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Průměrná doba na stránce</CardTitle>
          <ClockIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.avgTimeOnPage}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">+{summary.timeChange}% od minulého měsíce</p>
        </CardContent>
      </Card>
    </div>
  )
}
