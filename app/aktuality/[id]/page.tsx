import type { Metadata } from "next";

// Tato stránka je vždy generována dynamicky (SSR), aby nedocházelo k chybám s fetch a cookies
export const dynamic = "force-dynamic";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";

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
    
    // Volání API pro získání konkrétního článku podle ID
    const response = await fetch(
      `${baseUrl}/api/admin/public/articles/${id}`,
      {
        cache: "no-store",
      },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.status}`);
    }

    const article: Article = await response.json();
    return article;
  } catch (error) {

    // Fallback na lokální data
    try {
      const fs = await import("fs");
      const path = await import("path");
      const articlesPath = path.join(process.cwd(), "data", "articles.json");

      if (fs.existsSync(articlesPath)) {
        const articlesData = fs.readFileSync(articlesPath, "utf8");
        const articles: Article[] = JSON.parse(articlesData);
        return articles.find((article) => article.id === id || article.slug === id) || null;
      }
    } catch (fallbackError) {
    }

    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Nejprve počkáme na params
  const resolvedParams = await params;
  const article = await getArticle(resolvedParams.id);

  if (!article) {
    return {
      title: "Článek nenalezen - Pavel Fišer",
      description: "Požadovaný článek nebyl nalezen.",
    };
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
  };
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  // Nejprve počkáme na params
  const resolvedParams = await params;
  const article = await getArticle(resolvedParams.id);

  if (!article) {
    notFound();
  }

  // Toto zajistí, že TypeScript ví, že article není null
  const articleData = article as Article;
  const sanitizedContent = DOMPurify.sanitize(articleData.content);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb navigation */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900">
            <Link href="/aktuality" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Zpět na aktuality
            </Link>
          </Button>
        </div>

        <Card className="bg-white border-gray-200 shadow-lg">
          <CardHeader className="space-y-4">
            {/* Article image */}
            {articleData.imageUrl && (
              <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
                <Image
                  src={articleData.imageUrl || "/placeholder.svg"}
                  alt={articleData.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Article metadata */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(articleData.publishedAt).toLocaleDateString("cs-CZ", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {articleData.author}
                </div>
                <Badge variant="secondary">{articleData.category}</Badge>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{articleData.title}</h1>

              {articleData.excerpt && <p className="text-lg text-gray-700 leading-relaxed">{articleData.excerpt}</p>}

              {/* Tags */}
              {articleData.tags && articleData.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-gray-600" />
                  {articleData.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-gray-600 border-gray-300">
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
              className="prose prose-gray prose-lg max-w-none
                prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 
                prose-strong:text-gray-900 prose-code:text-gray-800 prose-pre:bg-gray-100
                prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-700"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
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
  );
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
    );

    if (!response.ok) {
      throw new Error("Failed to fetch articles");
    }

    const data = await response.json();
    
    // Zjistit, jestli je odpověď pole nebo objekt s polem articles
    const articles = Array.isArray(data) ? data : data.articles;

    // Ensure articles is an array before mapping
    if (!Array.isArray(articles)) {
      return [];
    }

    return articles.map((article) => ({
      id: article.id,
    }));
  } catch (error) {

    // Fallback na lokální data
    try {
      const fs = await import("fs");
      const path = await import("path");
      const articlesPath = path.join(process.cwd(), "data", "articles.json");

      if (fs.existsSync(articlesPath)) {
        const articlesData = fs.readFileSync(articlesPath, "utf8");
        const articles: Article[] = JSON.parse(articlesData);

        // Ensure articles is an array before mapping
        if (!Array.isArray(articles)) {
          return [];
        }

        return articles.map((article) => ({
          id: article.id,
        }));
      }
    } catch (fallbackError) {
    }

    return [];
  }
}
