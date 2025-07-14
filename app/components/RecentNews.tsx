"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
<<<<<<< HEAD
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Article } from "@/lib/article-service" // Import Article type from service

interface ArticlesResponse {
  articles: Article[]
  total: number
  hasMore: boolean
}
=======
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Article } from "@/lib/database" // Import Article type
>>>>>>> e2ce699b71320c848c521e54fad10a96370f4230

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
<<<<<<< HEAD
    loadRecentArticles(1)
  }, [])

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1)
    loadRecentArticles(page + 1)
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
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
                      src={article.imageUrl || "/placeholder.svg"}
                      width={350}
                    />
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Badge variant="secondary">{article.category}</Badge>
                    <span>
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString("cs-CZ", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : new Date(article.createdAt).toLocaleDateString("cs-CZ", {
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
=======
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
>>>>>>> e2ce699b71320c848c521e54fad10a96370f4230
      </div>
    </section>
  )
}
