import { ArticleDetailPage } from "./ArticleDetailPage"
import { getArticleById } from "@/lib/services/article-service"
import type { Metadata } from "next"

interface ArticlePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleById(params.id)

  if (!article) {
    return {
      title: "Článek nenalezen",
      description: "Tento článek neexistuje nebo není k dispozici.",
    }
  }

  const title = article.metaTitle || article.title
  const description = article.metaDescription || article.excerpt || article.content.substring(0, 160)
  const imageUrl = article.imageUrl || "/og-image.svg" // Default OG image

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      type: "article",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/aktuality/${article.id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [imageUrl],
    },
  }
}

export default function ArticlePage({ params }: ArticlePageProps) {
  return <ArticleDetailPage articleId={params.id} />
}
