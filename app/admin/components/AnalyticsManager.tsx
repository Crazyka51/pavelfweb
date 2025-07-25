"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { getAnalyticsData, type AnalyticsData } from "@/lib/services/analytics-service"
import { useToast } from "@/components/ui/use-toast"

export function AnalyticsManager() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getAnalyticsData()
        setAnalyticsData(data)
      } catch (err: any) {
        console.error("Error fetching analytics data:", err)
        setError(err.message || "Nepodařilo se načíst analytická data.")
        toast({
          title: "Chyba",
          description: err.message || "Nepodařilo se načíst analytická data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [toast])

  if (loading) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Zobrazení stránek a návštěvníci za poslední týden</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              views: { label: "Zobrazení", color: "hsl(var(--chart-1))" },
              visitors: { label: "Návštěvníci", color: "hsl(var(--chart-2))" },
            }}
            className="min-h-[300px]"
          >
            <BarChart accessibilityLayer data={analyticsData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("cs-CZ", { day: "numeric", month: "short" })
                }
              />
              <YAxis tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="views" fill="var(--color-views)" radius={4} />
              <Bar dataKey="visitors" fill="var(--color-visitors)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nejnavštěvovanější články</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">Zde se zobrazí seznam nejnavštěvovanějších článků.</p>
        </CardContent>
      </Card>
    </div>
  )
}
