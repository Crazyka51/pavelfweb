"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "../../components/ui/badge";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: Date | string | null;
  createdAt: Date | string;
  category: {
    id: string;
    name: string;
  };
}

export default function RecentArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentArticles() {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/articles?page=1&limit=3`);
        if (!response.ok) {
          throw new Error(`Chyba při načítání článků: ${response.status}`);
        }
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentArticles();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Nedávné články</h2>
        <div className="animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-4 pb-4 border-b last:border-b-0">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Nedávné články</h2>
        <p className="text-red-500">Nepodařilo se načíst články: {error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Nedávné články</h2>
        <p>Žádné články k zobrazení.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Nedávné články</h2>
        <Link 
          href="/aktuality" 
          className="text-blue-600 hover:underline flex items-center"
        >
          Zobrazit všechny &rarr;
        </Link>
      </div>

      <div className="space-y-4">
        {articles.map((article) => (
          <div key={article.id} className="pb-4 border-b last:border-b-0">
            <Link href={`/aktuality/${article.slug || article.id}`}>
              <h3 className="font-semibold hover:text-blue-600">{article.title}</h3>
            </Link>
            <p className="text-sm text-gray-500 line-clamp-2">
              {article.excerpt || article.title}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                {article.category?.name || "Koncept"}
              </Badge>
              <span className="text-sm text-gray-500">
                {new Date(article.publishedAt || article.createdAt).toLocaleDateString("cs-CZ", {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric"
                })}
              </span>
              <span className="text-sm text-gray-500">Aktuality</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
