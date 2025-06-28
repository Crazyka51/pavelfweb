import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleDetailPage from './ArticleDetailPage'

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  published: boolean
  createdAt: string
  updatedAt: string
  imageUrl?: string
}

async function getArticle(id: string): Promise<Article | null> {
  try {
    // Načteme článek z API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/public/articles`, {
      cache: 'no-store' // Zajistíme aktuální data
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch articles')
    }
    
    const articles: Article[] = await response.json()
    
    // Najdeme článek podle ID a ověříme, že je publikovaný
    const article = articles.find(article => article.id === id && article.published)
    
    return article || null
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await getArticle(params.id)
  
  if (!article) {
    return {
      title: 'Článek nenalezen | Pavel Fišer - Praha 4'
    }
  }

  return {
    title: `${article.title} | Pavel Fišer - Praha 4`,
    description: article.excerpt,
    keywords: `Praha 4, ${article.category}, ${article.tags.join(', ')}, Pavel Fišer`,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
      authors: ['Pavel Fišer'],
      tags: article.tags,
      images: article.imageUrl ? [{ url: article.imageUrl, alt: article.title }] : []
    }
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id)
  
  if (!article) {
    notFound()
  }

  return <ArticleDetailPage article={article} />
}
