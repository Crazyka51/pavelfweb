"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, TagIcon, SearchIcon } from "lucide-react"
import { getArticles, type Article } from "@/lib/services/article-service"
import { getCategories, type Category } from "@/lib/services/category-service"
import { useToast } from "@/components/ui/use-toast"

interface ArticlesResponse {
  articles: Article[]
  total: number
  hasMore: boolean
}

export function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(6) // Display 6 articles per page
  const [hasMore, setHasMore] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)
  const [categories, setCategories] = useState<Category[]>([])

  const { toast } = useToast()

  const fetchArticlesData = async () => {
    setLoading(true)
    setError(null)
    try {
      const { articles, total, hasMore } = await getArticles({
        page,
        limit,
        published: true,
        category: filterCategory,
        search: searchQuery,
      })
      setArticles(articles)
      setHasMore(hasMore)
    } catch (err: any) {
      console.error("Error fetching articles:", err)
      setError(err.message || "Nepodařilo se načíst články.")
      toast({
        title: "Chyba",
        description: err.message || "Nepodařilo se načíst články.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoriesData = async () => {
    try {
      const data = await getCategories({ activeOnly: true })
      setCategories(data.categories)
    } catch (err) {
      console.error("Error fetching categories:", err)
      toast({
        title: "Chyba",
        description: "Nepodařilo se načíst kategorie.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchArticlesData()
    fetchCategoriesData()
  }, [page, limit, filterCategory, searchQuery])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value || undefined)
    setPage(1) // Reset to first page on search
  }

  const handleCategoryChange = (value: string) => {
    setFilterCategory(value === "all" ? undefined : value)
    setPage(1) // Reset to first page on category change
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("cs-CZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Aktuality</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Zde najdete nejnovější zprávy, oznámení a články týkající se Prahy 4 a mé práce.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl py-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Hledat články..."
                className="w-full pl-9 pr-4 py-2"
                value={searchQuery || ""}
                onChange={handleSearchChange}
              />
            </div>
            <Select value={filterCategory || "all"} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrovat dle kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny kategorie</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(limit)].map((_, i) => (
                <Card key={i} className="flex flex-col animate-pulse">
                  <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
                  <CardHeader>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                  </CardContent>
                  <div className="p-6 pt-0">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>{error}</p>
              <Button onClick={fetchArticlesData} className="mt-4">
                Zkusit znovu
              </Button>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Žádné články nenalezeny pro zadané filtry.</p>
            </div>
          ) : (
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {articles.map((article) => (
                <Card key={article.id} className="flex flex-col">
                  {article.imageUrl && (
                    <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
                      <Image
                        src={article.imageUrl || "/placeholder.svg"}
                        alt={article.title}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-lg"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <CalendarIcon className="h-4 w-4" />
                      {formatDate(article.publishedAt?.toISOString() || article.createdAt.toISOString())}
                      <TagIcon className="h-4 w-4 ml-2" />
                      {article.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-3">{article.excerpt}</p>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Link href={`/aktuality/${article.id}`}>
                      <Button variant="outline" className="w-full bg-transparent">
                        Číst více
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-4 mt-8">
            <Button onClick={() => setPage((prev) => prev - 1)} disabled={page === 1 || loading}>
              Předchozí
            </Button>
            <Button onClick={() => setPage((prev) => prev + 1)} disabled={!hasMore || loading}>
              Další
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
