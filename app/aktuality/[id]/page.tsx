import type { Metadata } from "next"

// Tato stránka je vždy generována dynamicky (SSR), aby nedocházelo k chybám s fetch a cookies
export const dynamic = "force-dynamic"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, User, Tag } from "lucide-react"
import { Card, CardContent, CardHeader } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  publishedAt: string
  category: string
  tags: string[]
  imageUrl?: string
  slug?: string
}

async function getArticle(id: string): Promise<Article | null> {
  try {
    // Získání BASE_URL, v produkci musí být nastavena
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined);
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_BASE_URL není nastavena. Nastavte ji na https://fiserpavel.cz v prostředí Vercelu.");
    }
    const response = await fetch(
      `${baseUrl}/api/admin/public/articles`,
      {
        cache: "no-store",
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch articles")
    }

    const articles: Article[] = await response.json()
    return articles.find((article) => article.id === id || article.slug === id) || null
  } catch (error) {
    console.error("Error fetching article:", error)

    // Fallback na lokální data
    try {
      const fs = await import("fs")
      const path = await import("path")
      const articlesPath = path.join(process.cwd(), "data", "articles.json")

      if (fs.existsSync(articlesPath)) {
        const articlesData = fs.readFileSync(articlesPath, "utf8")
        const articles: Article[] = JSON.parse(articlesData)
        return articles.find((article) => article.id === id || article.slug === id) || null
      }
    } catch (fallbackError) {
      console.error("Error loading fallback data:", fallbackError)
    }

    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await getArticle(params.id)

  if (!article) {
    return {
      title: "Článek nenalezen - Pavel Fišer",
      description: "Požadovaný článek nebyl nalezen.",
    }
  }

  return {
    title: `${article.title} - Pavel Fišer`,
    description: article.excerpt || article.content.substring(0, 160),
    openGraph: {
      title: article.title,
      description: article.excerpt || article.content.substring(0, 160),
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags,
      images: article.imageUrl
        ? [
            {
              url: article.imageUrl,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt || article.content.substring(0, 160),
      images: article.imageUrl ? [article.imageUrl] : undefined,
    },
    keywords: article.tags.join(", "),
    authors: [{ name: article.author }],
    category: article.category,
  }
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id)

  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb navigation */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="text-gray-400 hover:text-white">
            <Link href="/aktuality" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Zpět na aktuality
            </Link>
          </Button>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="space-y-4">
            {/* Article image */}
            {article.imageUrl && (
              <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
                <Image
                  src={article.imageUrl || "/placeholder.svg"}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Article metadata */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.publishedAt).toLocaleDateString("cs-CZ", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {article.author}
                </div>
                <Badge variant="secondary">{article.category}</Badge>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">{article.title}</h1>

              {article.excerpt && <p className="text-lg text-gray-300 leading-relaxed">{article.excerpt}</p>}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-gray-400 border-gray-600">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* Article content */}
            <div
              className="prose prose-invert prose-lg max-w-none
                prose-headings:text-white prose-p:text-gray-300 prose-a:text-blue-400 
                prose-strong:text-white prose-code:text-gray-300 prose-pre:bg-slate-700
                prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-300"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </CardContent>
        </Card>

        {/* Navigation back */}
        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/aktuality">Zobrazit všechny aktuality</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined);
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_BASE_URL není nastavena. Nastavte ji na https://fiserpavel.cz v prostředí Vercelu.");
    }
    const response = await fetch(
      `${baseUrl}/api/admin/public/articles`,
      {
        cache: "no-store",
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch articles")
    }

    const articles: Article[] = await response.json()

    return articles.map((article) => ({
      id: article.id,
    }))
  } catch (error) {
    console.error("Error generating static params:", error)

    // Fallback na lokální data
    try {
      const fs = await import("fs")
      const path = await import("path")
      const articlesPath = path.join(process.cwd(), "data", "articles.json")

      if (fs.existsSync(articlesPath)) {
        const articlesData = fs.readFileSync(articlesPath, "utf8")
        const articles: Article[] = JSON.parse(articlesData)

        return articles.map((article) => ({
          id: article.id,
        }))
      }
    } catch (fallbackError) {
      console.error("Error loading fallback data for static params:", fallbackError)
    }

    return []
  }
}
