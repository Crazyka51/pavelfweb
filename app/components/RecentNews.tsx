"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Skeleton } from "../../components/ui/skeleton"
import type { Article } from "../../lib/article-service" // Import Article type from service

interface ArticlesResponse {
  articles: Article[]
  total: number
  hasMore: boolean
}

export default function RecentNews() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadRecentArticles = async (pageNumber: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/public/articles?page=${pageNumber}&limit=6`)
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Chyba při načítání článků: ${response.status} - ${errorText}`)
      }
      const data: ArticlesResponse = await response.json()

      // The Article type from lib/services/article-service.ts already handles mapping
      // from DB snake_case to camelCase, so we can use it directly.
      setArticles((prevArticles) => (pageNumber === 1 ? data.articles : [...prevArticles, ...data.articles]))
      setHasMore(data.hasMore)
    } catch (err: any) {
      console.error("Error loading articles:", err)
      setError(err.message || "Nepodařilo se načíst nejnovější články.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecentArticles(1)
  }, [])

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1)
    loadRecentArticles(page + 1)
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Nejnovější zprávy a články</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Zůstaňte informováni o nejnovějších událostech a poznatcích.
            </p>
          </div>
        </div>
        {loading && articles.length === 0 ? (
          <div className="grid gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="flex flex-col gap-4 p-4">
                  <Skeleton className="h-[200px] w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">
            <p>{error}</p>
            <Button onClick={() => loadRecentArticles(1)} className="mt-4">
              Zkusit znovu
            </Button>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p>Žádné články k zobrazení.</p>
          </div>
        ) : (
          <div className="grid gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {articles.map((article) => (
              <Card key={article.id}>
                <CardContent className="flex flex-col gap-4 p-4">
                  <Link className="block" href={`/aktuality/${article.id}`}>
                    <Image
                      alt={article.title}
                      className="aspect-video overflow-hidden rounded-md object-cover"
                      height={200}
                      src={article.image_url || "/placeholder.svg"}
                      width={350}
                    />
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Badge variant="secondary">{article.category}</Badge>
                    <span>
                      {article.published_at
                        ? new Date(article.published_at).toLocaleDateString("cs-CZ", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : new Date(article.created_at).toLocaleDateString("cs-CZ", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                    </span>
                  </div>
                  <Link className="block" href={`/aktuality/${article.id}`}>
                    <h3 className="text-xl font-bold tracking-tight">{article.title}</h3>
                  </Link>
                  <p className="text-gray-500 dark:text-gray-400">{article.excerpt}</p>
                  <Link className="block" href={`/aktuality/${article.id}`}>
                    <Button variant="outline">Číst více</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {hasMore && !loading && articles.length > 0 && (
          <div className="flex justify-center py-4">
            <Button onClick={handleLoadMore} disabled={loading}>
              {loading ? "Načítám..." : "Načíst další"}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
