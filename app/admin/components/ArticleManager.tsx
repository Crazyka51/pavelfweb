'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, Filter, Calendar, Tag, User, FileText } from 'lucide-react'
import ArticleEditor from './ArticleEditor'

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
  publishedAt?: string
}

interface ArticleManagerProps {
  onEditArticle?: (article: Article) => void
  onCreateNew?: () => void
}

export default function ArticleManager({ onEditArticle, onCreateNew }: ArticleManagerProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showPublished, setShowPublished] = useState<'all' | 'published' | 'unpublished'>('all')
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const articlesPerPage = 10

  useEffect(() => {
    loadArticles()
    loadCategories()
  }, [])

  const loadArticles = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/articles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setArticles(data.data || [])
      } else {
        console.error('Failed to load articles')
        setArticles([])
      }
    } catch (error) {
      console.error('Error loading articles:', error)
      setArticles([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || ['Obecné', 'Technologie', 'Design', 'Business'])
      } else {
        // Fallback categories
        setCategories(['Obecné', 'Technologie', 'Design', 'Business'])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      // Fallback categories
      setCategories(['Obecné', 'Technologie', 'Design', 'Business'])
    }
  }

  const handleEditArticle = (article: Article) => {
    if (onEditArticle) {
      onEditArticle(article)
    } else {
      setEditingArticle(article)
      setShowEditor(true)
    }
  }

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew()
    } else {
      setEditingArticle(null)
      setShowEditor(true)
    }
  }

  const handleSaveArticle = async (articleData: Partial<Article>) => {
    try {
      const token = localStorage.getItem('adminToken')
      const url = editingArticle 
        ? `/api/articles/${editingArticle.id}` 
        : '/api/articles'
      const method = editingArticle ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(articleData)
      })

      if (response.ok) {
        await loadArticles() // Reload articles
        setShowEditor(false)
        setEditingArticle(null)
      } else {
        const errorData = await response.json()
        alert(`Chyba při ukládání: ${errorData.error || 'Neznámá chyba'}`)
      }
    } catch (error) {
      console.error('Error saving article:', error)
      alert('Chyba při ukládání článku')
    }
  }

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Opravdu chcete smazat tento článek?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await loadArticles() // Reload articles
      } else {
        alert('Chyba při mazání článku')
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Chyba při mazání článku')
    }
  }

  const handleCancel = () => {
    setShowEditor(false)
    setEditingArticle(null)
  }

  // Filter articles based on search and filters
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || article.category === selectedCategory
    const matchesPublished = showPublished === 'all' || 
                           (showPublished === 'published' && article.published) ||
                           (showPublished === 'unpublished' && !article.published)
    
    return matchesSearch && matchesCategory && matchesPublished
  })

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage)
  const startIndex = (currentPage - 1) * articlesPerPage
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage)

  if (showEditor) {
    return (
      <ArticleEditor
        article={editingArticle}
        categories={categories}
        onSave={handleSaveArticle}
        onCancel={handleCancel}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Správa článků</h1>
          <p className="text-gray-600 mt-1">
            Vytvářejte a spravujte články pro váš web
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nový článek
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Hledat články..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Všechny kategorie</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Published filter */}
          <select
            value={showPublished}
            onChange={(e) => setShowPublished(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Všechny</option>
            <option value="published">Publikované</option>
            <option value="unpublished">Nepublikované</option>
          </select>

          {/* Stats */}
          <div className="text-sm text-gray-600">
            Zobrazeno: {filteredArticles.length} z {articles.length} článků
          </div>
        </div>
      </div>

      {/* Articles list */}
      <div className="bg-white rounded-lg shadow-sm border">
        {paginatedArticles.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <FileText className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné články</h3>
            <p className="text-gray-600">
              {articles.length === 0 ? 'Zatím nemáte žádné články.' : 'Nenalezeny žádné články odpovídající filtrům.'}
            </p>
            {articles.length === 0 && (
              <button
                onClick={handleCreateNew}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Vytvořit první článek
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {paginatedArticles.map((article) => (
                <div key={article.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{article.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          article.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {article.published ? 'Publikováno' : 'Koncept'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {article.category}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(article.createdAt).toLocaleDateString('cs-CZ')}
                        </div>
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span>{article.tags.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEditArticle(article)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Upravit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Smazat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {article.published && (
                        <a
                          href={`/aktuality/${article.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Zobrazit"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Předchozí
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Další
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalPageViews: 0,
    uniqueVisitors: 0,
    averageSessionDuration: '0:00',
    bounceRate: '0%',
    realTimeUsers: 0,
    conversions: 0,
    pageLoadTime: '0s',
    topPages: [],
    geographicData: [],
    deviceData: [],
    trafficSources: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7d')

  useEffect(() => {
    loadAnalyticsData()
  }, [dateRange])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/analytics?dateRange=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        console.error('Failed to load analytics data')
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Přehled návštěvnosti a chování uživatelů na vašich stránkách
          </p>
        </div>
        <div className="flex gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Posledních 7 dní</option>
            <option value="30d">Posledních 30 dní</option>
            <option value="90d">Posledních 90 dní</option>
          </select>
          <button 
            onClick={loadAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Obnovit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Celkem zobrazení</p>
              <p className="text-xl font-bold text-gray-900">{analyticsData.totalPageViews.toLocaleString()}</p>
            </div>
            <Eye className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Unikátní návštěvníci</p>
              <p className="text-xl font-bold text-gray-900">{analyticsData.uniqueVisitors.toLocaleString()}</p>
            </div>
            <Users className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Aktuálně online</p>
              <p className="text-xl font-bold text-gray-900">{analyticsData.realTimeUsers}</p>
            </div>
            <Globe className="h-6 w-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Průměrná relace</p>
              <p className="text-xl font-bold text-gray-900">{analyticsData.averageSessionDuration}</p>
            </div>
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Bounce Rate</p>
              <p className="text-xl font-bold text-gray-900">{analyticsData.bounceRate}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Konverze</p>
              <p className="text-xl font-bold text-gray-900">{analyticsData.conversions}</p>
            </div>
            <BarChart3 className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Nejnavštěvovanější stránky
          </h3>
          <div className="space-y-3">
            {analyticsData.topPages.map((page, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{page.title}</span>
                  <span className="text-xs text-gray-500">{page.page}</span>
                </div>
                <span className="font-semibold text-blue-600">{page.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Data */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Návštěvníci podle zemí
          </h3>
          <div className="space-y-3">
            {analyticsData.geographicData.map((country, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{country.country}</span>
                <span className="font-semibold">{country.visitors.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Device Data */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Zařízení návštěvníků</h3>
          <div className="space-y-3">
            {analyticsData.deviceData.map((device, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{device.device}</span>
                <span className="font-semibold">{device.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Zdroje návštěvnosti</h3>
          <div className="space-y-3">
            {analyticsData.trafficSources.map((source, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{source.source}</span>
                <span className="font-semibold">{source.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Rychlost načítání</p>
              <p className="text-2xl font-bold">{analyticsData.pageLoadTime}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Celkové konverze</p>
              <p className="text-2xl font-bold">{analyticsData.conversions}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Uživatelé nyní</p>
              <p className="text-2xl font-bold">{analyticsData.realTimeUsers}</p>
            </div>
            <Globe className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 rounded-full p-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 text-lg">Google Analytics 4 Integration</h4>
            <p className="text-blue-700 mt-2">
              Administrace je připojena k Google Analytics a zobrazuje aktuální metriky z vašich stránek. 
              Data se aktualizují automaticky a poskytují přehled o návštěvnosti a chování uživatelů.
            </p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Tracking ID:</span>
                <br />
                <span className="text-blue-600 font-mono">G-Z5Y3C04P25</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Posledně aktualizováno:</span>
                <br />
                <span className="text-blue-600">Před chvílí</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Stav:</span>
                <br />
                <span className="text-green-600 font-medium">✓ Aktivní</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Období:</span>
                <br />
                <span className="text-blue-600">{dateRange === '7d' ? '7 dní' : dateRange === '30d' ? '30 dní' : '90 dní'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}