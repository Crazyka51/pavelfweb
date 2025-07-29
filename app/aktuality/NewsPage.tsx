'use client'

import { useState, useEffect } from 'react'
import { Calendar, Tag, Search, Filter, ArrowLeft } from 'lucide-react'
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

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalArticles, setTotalArticles] = useState(0)
  
  const articlesPerPage = 6
  const categories = ['Aktuality', 'Městská politika', 'Doprava', 'Životní prostředí', 'Kultura', 'Sport']

  useEffect(() => {
    loadArticles()
  }, [currentPage, selectedCategory, searchTerm])

  const loadArticles = async () => {
    setIsLoading(true)
    try {
      // Použijeme správný API endpoint
      const response = await fetch('/api/admin/public/articles')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const articles: Article[] = await response.json()
      
      // Client-side filtering and pagination
      let filteredArticles = articles
      
      // Filter by category
      if (selectedCategory !== 'all') {
        filteredArticles = filteredArticles.filter(article => article.category === selectedCategory)
      }
      
      // Filter by search term
      if (searchTerm) {
        filteredArticles = filteredArticles.filter(article =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }
      
      // Apply pagination - FIXED
      const offset = (currentPage - 1) * articlesPerPage
      const paginatedArticles = filteredArticles.slice(offset, offset + articlesPerPage)
      
      setArticles(paginatedArticles)
      setTotalArticles(filteredArticles.length)
      setError(null) // Clear any previous errors
    } catch (error) {
      console.error('Error loading articles:', error)
      setError('Nepodařilo se načíst články')
      // Zobrazíme prázdný seznam místo mock dat
      setArticles([])
      setTotalArticles(0)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Aktuality': 'bg-blue-100 text-blue-800',
      'Městská politika': 'bg-purple-100 text-purple-800',
      'Doprava': 'bg-green-100 text-green-800',
      'Životní prostředí': 'bg-emerald-100 text-emerald-800',
      'Kultura': 'bg-pink-100 text-pink-800',
      'Sport': 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const totalPages = Math.ceil(totalArticles / articlesPerPage)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Zpět na hlavní stránku
            </Link>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Aktuální novinky</h1>
          <p className="text-xl text-gray-600">
            Sledujte nejnovější informace a aktuality z Prahy 4
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Hledat v článcích..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category filter */}
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Všechny kategorie</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-center">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm border animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Articles grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {articles.map((article) => (
                <article key={article.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow group">
                  {article.imageUrl && (
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                        {article.category}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(article.updatedAt)}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    
                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="flex items-center text-xs text-gray-500">
                            <Tag className="w-3 h-3 mr-1" />
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <Link 
                      href={`/aktuality/${article.id}`}
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      Číst celý článek →
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Error state */}
            {error && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-red-600 text-lg font-medium mb-2">Chyba při načítání článků</p>
                <p className="text-gray-500 text-sm">Zkuste obnovit stránku nebo se obraťte na administrátora.</p>
                <button 
                  onClick={loadArticles}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Zkusit znovu
                </button>
              </div>
            )}

            {/* No results */}
            {!error && articles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  {searchTerm ? 'Žádné články nevyhovují hledání.' : 'Zatím nejsou k dispozici žádné články.'}
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Předchozí
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Další
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
