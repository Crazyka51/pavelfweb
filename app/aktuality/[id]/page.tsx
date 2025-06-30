import type { Metadata } from "next"
import { notFound } from "next/navigation"
import ArticleDetailPage from "./ArticleDetailPage"

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
  slug: string
}

async function getArticle(id: string): Promise<Article | null> {
  try {
    // Pokus o načtení z API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/admin/public/articles`,
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

// -----------------------
//  React Page Component
// -----------------------
export default async function ArticlePage({
  params,
}: {
  params: { id: string }
}) {
  const article = await getArticle(params.id)

  if (!article) {
    notFound()
  }

  return <ArticleDetailPage article={article} />
}

// Generování statických cest pro lepší výkon
export async function generateStaticParams() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/admin/public/articles`,
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
