"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, TagIcon, ArrowLeftIcon, Loader2 } from "lucide-react"
import { getArticleById, type Article } from "@/lib/services/article-service"
import { useToast } from "@/components/ui/use-toast"
import DOMPurify from "dompurify"

interface ArticleDetailPageProps {
  articleId: string
}

export function ArticleDetailPage({ articleId }: ArticleDetailPageProps) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetchedArticle = await getArticleById(articleId)
        if (!fetchedArticle || fetchedArticle.status !== "published") {
          throw new Error("Článek nenalezen nebo není publikován.")
        }
        setArticle(fetchedArticle)
      } catch (err: any) {
        console.error("Error fetching article:", err)
        setError(err.message || "Nepodařilo se načíst článek.")
        toast({
          title: "Chyba",
          description: err.message || "Nepodařilo se načíst článek.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [articleId, toast])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("cs-CZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const createMarkup = (htmlString: string) => {
    return { __html: DOMPurify.sanitize(htmlString) }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-950">
        <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        <p className="ml-4 text-lg font-medium text-gray-500">Načítání článku...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gray-100 px-4 py-12 text-center dark:bg-gray-950">
        <p className="text-red-500 text-lg">{error}</p>
        <Link href="/aktuality">
          <Button className="mt-6">Zpět na aktuality</Button>
        </Link>
      </div>
    )
  }

  if (!article) {
    return null // Should not happen if error is handled
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <Link href="/aktuality">
            <Button variant="ghost" className="mb-8 flex items-center gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              Zpět na aktuality
            </Button>
          </Link>

          <Card className="overflow-hidden">
            {article.imageUrl && (
              <div className="relative w-full aspect-video overflow-hidden">
                <Image
                  src={article.imageUrl || "/placeholder.svg"}
                  alt={article.title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                />
              </div>
            )}
            <CardContent className="p-6 md:p-8 lg:p-10">
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDate(article.publishedAt?.toISOString() || article.createdAt.toISOString())}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TagIcon className="h-4 w-4" />
                  <span>{article.category}</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-4">
                {article.title}
              </h1>
              {article.excerpt && <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">{article.excerpt}</p>}
              <div
                className="prose prose-lg max-w-none text-gray-800 dark:text-gray-200"
                dangerouslySetInnerHTML={createMarkup(article.content)}
              />
              {article.tags && article.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Štítky:</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
