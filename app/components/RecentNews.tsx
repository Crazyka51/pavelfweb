'use client'

import { useState, useEffect } from 'react'
import { Calendar, Tag, ArrowRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'

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

interface ApiResponse {
  articles: Article[]
  total: number
  hasMore: boolean
}

export default function RecentNews() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRecentArticles()
  }, [])

  const loadRecentArticles = async () => {
    try {
      // Načti nejnovější 3 publikované články z admin API
      const response = await fetch('/api/admin/public/articles')
      
      if (!response.ok) {
        throw new Error('Chyba při načítání článků')
      }
      
      const articles: Article[] = await response.json()
      setArticles(articles.slice(0, 3)) // Vezmi pouze první 3 články
    } catch (error) {
      console.error('Error loading articles:', error)
      setError('Nepodařilo se načíst nejnovější články')
      // Fallback - mock data pro případ, že CMS není dostupný
      setArticles(getMockArticles())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockArticles = (): Article[] => [
    {
      id: '1',
      title: 'Nová cyklostezka v Praze 4',
      excerpt: 'Dokončili jsme další úsek cyklostezky, který propojuje centrum s okrajovými částmi městské části.',
      content: '',
      category: 'Doprava',
      tags: ['doprava', 'cyklostezka', 'investice'],
      published: true,
      createdAt: '2025-06-20T10:00:00Z',
      updatedAt: '2025-06-20T10:00:00Z',
      imageUrl: '/placeholder.jpg'
    },
    {
      id: '2',
      title: 'Revitalizace parku Kamýk',
      excerpt: 'Zahájili jsme rozsáhlou revitalizaci parku Kamýk, která přinese nové prvky pro odpočinek i sport.',
      content: '',
      category: 'Životní prostředí',
      tags: ['park', 'revitalizace', 'životní prostředí'],
      published: true,
      createdAt: '2025-06-18T14:30:00Z',
      updatedAt: '2025-06-18T14:30:00Z',
      imageUrl: '/placeholder.jpg'
    }
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Aktuality': 'bg-blue-100 text-blue-800 border border-blue-200',
      'Městská politika': 'bg-purple-100 text-purple-800 border border-purple-200',
      'Doprava': 'bg-green-100 text-green-800 border border-green-200',
      'Životní prostředí': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      'Kultura': 'bg-pink-100 text-pink-800 border border-pink-200',
      'Sport': 'bg-orange-100 text-orange-800 border border-orange-200'
    }
    return colors[category] || 'bg-gray-100 text-gray-800 border border-gray-200'
  }

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-10 bg-gray-200 rounded w-96 mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-128 mx-auto mb-8 animate-pulse"></div>
            <div className="w-24 h-1 bg-gray-200 mx-auto animate-pulse"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <div className="h-12 bg-gray-200 rounded-lg w-64 mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Aktuální novinky z Prahy 4</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Sledujte nejnovější informace o dění v naší městské části, projektech a rozhodnutích zastupitelstva
          </p>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>

        {error && (
          <div className="mb-12 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-yellow-800 font-medium">Upozornění</p>
                <p className="text-yellow-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {articles.map((article) => (
            <article key={article.id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group overflow-hidden">
              {article.imageUrl && (
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(article.category)}`}>
                    {article.category}
                  </span>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(article.updatedAt)}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>
                
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {article.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="inline-flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <Link 
                    href={`/aktuality/${article.id}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Číst více
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <a 
                    href={`http://localhost:3002/preview/${article.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Otevřít v novém okně"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {articles.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg">Zatím nejsou k dispozici žádné články.</p>
            <p className="text-gray-500 text-sm mt-2">Nové články budou zobrazeny automaticky po publikování.</p>
          </div>
        )}

        {/* Link na všechny články */}
        <div className="text-center">
          <Link 
            href="/aktuality"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Zobrazit všechny novinky
            <ArrowRight className="w-5 h-5 ml-3" />
          </Link>
        </div>
      </div>
    </section>
  )
}
