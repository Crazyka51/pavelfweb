'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, Filter, Calendar, Tag, User } from 'lucide-react'
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
  onEditArticle?: (id: string) => void
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
    setEditingArticle(article)
    setShowEditor(true)
  }

  const handleCreateNew = () => {
    setEditingArticle(null)
    setShowEditor(true)
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
