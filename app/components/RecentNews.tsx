"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Article } from "@/lib/database" // Import Article type

export default function RecentNews() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRecentArticles() {
      try {
        setLoading(true)
        const response = await fetch("/api/admin/public/articles?limit=3") // Fetch only published articles
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Chyba při načítání článků: ${response.status} ${errorText}`)
        }
        const data = await response.json()
        setArticles(data.articles)
      } catch (err: any) {
        console.error("Error loading articles:", err)
        setError(err.message || "Nepodařilo se načíst nejnovější články.")
      } finally {
        setLoading(false)
      }
    }
    loadRecentArticles()
  }, [])

  if (loading) {
    return (
      <section id="recent-news" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Nejnovější aktuality</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Načítání nejnovějších zpráv a událostí...
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mt-2"></div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
                <div className="p-6 pt-0">
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="recent-news" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Chyba při načítání aktualit</h2>
              <p className="max-w-[900px] text-red-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-red-400">
                {error}
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="recent-news" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Nejnovější aktuality</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Zde najdete nejnovější zprávy, události a oznámení.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
          {articles.length > 0 ? (
            articles.map((article) => (
              <Card key={article.id} className="flex flex-col">
                {article.image_url && (
                  <img
                    src={article.image_url || "/placeholder.svg"}
                    alt={article.title}
                    width={400}
                    height={225}
                    className="aspect-video object-cover rounded-t-lg"
                  />
                )}
                <CardHeader>
                  <CardTitle>{article.title}</CardTitle>
                  <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(article.published_at || article.created_at).toLocaleDateString("cs-CZ", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-3">{article.excerpt || article.content}</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Link href={`/aktuality/${article.id}`} passHref>
                    <Button variant="outline" className="w-full bg-transparent">
                      Číst více
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 dark:text-gray-400">Žádné články k zobrazení.</p>
          )}
        </div>
        {articles.length > 0 && (
          <div className="flex justify-center mt-8">
            <Link href="/aktuality" passHref>
              <Button>Zobrazit všechny aktuality</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
