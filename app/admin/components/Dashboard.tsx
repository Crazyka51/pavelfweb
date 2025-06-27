'use client'

import { useState, useEffect } from 'react'
import { LogOut, Plus, Edit, Trash2, Eye, Calendar, Tag, Search } from 'lucide-react'
import SimpleArticleEditor from './SimpleArticleEditor'
import ArticlePreview from './ArticlePreview'
import QuickActions from './QuickActions'
import NotificationSystem, { useNotifications } from './NotificationSystem'

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

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [currentView, setCurrentView] = useState<'list' | 'edit' | 'preview'>('list')
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  
  const { notifications, removeNotification, notify } = useNotifications()

  const categories = ['Aktuality', 'Městská politika', 'Doprava', 'Životní prostředí', 'Kultura', 'Sport']

  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/articles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setArticles(data)
      }
    } catch (error) {
      console.error('Error loading articles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveArticle = async (article: Partial<Article>) => {
    try {
      const token = localStorage.getItem('admin_token')
      const method = editingArticle ? 'PUT' : 'POST'
      const url = editingArticle ? `/api/admin/articles/${editingArticle.id}` : '/api/admin/articles'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(article)
      })

      if (response.ok) {
        await loadArticles()
        setCurrentView('list')
        setEditingArticle(null)
        notify.success('Článek byl úspěšně uložen')
      } else {
        notify.error('Chyba při ukládání článku', 'Zkuste to prosím znovu')
      }
    } catch (error) {
      console.error('Error saving article:', error)
      notify.error('Chyba při ukládání článku', 'Zkuste to prosím znovu')
    }
  }

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tento článek?')) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await loadArticles()
        notify.success('Článek byl smazán')
      } else {
        notify.error('Chyba při mazání článku')
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      notify.error('Chyba při mazání článku')
    }
  }

  const handleTogglePublish = async (article: Article) => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...article,
          published: !article.published
        })
      })

      if (response.ok) {
        await loadArticles()
        notify.success(
          article.published ? 'Článek byl skryt' : 'Článek byl publikován'
        )
      } else {
        notify.error('Chyba při změně stavu publikování')
      }
    } catch (error) {
      console.error('Error toggling publish status:', error)
      notify.error('Chyba při změně stavu publikování')
    }
  }

  const handleDuplicateArticle = async (article: Article) => {
    try {
      const token = localStorage.getItem('admin_token')
      const duplicatedArticle = {
        title: `${article.title} (kopie)`,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        tags: article.tags,
        published: false,
        imageUrl: article.imageUrl
      }

      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(duplicatedArticle)
      })

      if (response.ok) {
        await loadArticles()
        notify.success('Článek byl duplikován')
      } else {
        notify.error('Chyba při duplikování článku')
      }
    } catch (error) {
      console.error('Error duplicating article:', error)
      notify.error('Chyba při duplikování článku')
    }
  }

  const handleCopyUrl = (article: Article) => {
    const url = `${window.location.origin}/articles/${article.id}`
    navigator.clipboard.writeText(url).then(() => {
      notify.success('URL byla zkopírována do schránky')
    }).catch(() => {
      notify.error('Nepodařilo se zkopírovat URL')
    })
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (currentView === 'edit') {
    return (
      <SimpleArticleEditor
        article={editingArticle}
        categories={categories}
        onSave={handleSaveArticle}
        onCancel={() => {
          setCurrentView('list')
          setEditingArticle(null)
        }}
      />
    )
  }

  if (currentView === 'preview' && previewArticle) {
    return (
      <ArticlePreview
        article={previewArticle}
        onClose={() => {
          setCurrentView('list')
          setPreviewArticle(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pavel Fišer CMS</h1>
              <p className="text-gray-600">Správa novinek a článků</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Odhlásit se
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Hledat články..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
                />
              </div>

              {/* Category filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Všechny kategorie</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* New article button */}
            <button
              onClick={() => {
                setEditingArticle(null)
                setCurrentView('edit')
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nový článek
            </button>
          </div>
        </div>

        {/* Articles list */}
        <div className="bg-white rounded-lg shadow-sm border">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Načítání článků...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm || selectedCategory !== 'all' ? 
                'Žádné články nevyhovují zadaným kritériům.' : 
                'Zatím nejsou žádné články.'
              }
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredArticles.map((article) => (
                <div key={article.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                          <span>{article.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(article.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <QuickActions
                        article={article}
                        onEdit={() => {
                          setEditingArticle(article)
                          setCurrentView('edit')
                        }}
                        onPreview={() => {
                          setPreviewArticle(article)
                          setCurrentView('preview')
                        }}
                        onDelete={() => handleDeleteArticle(article.id)}
                        onDuplicate={() => handleDuplicateArticle(article)}
                        onTogglePublish={() => handleTogglePublish(article)}
                        onCopyUrl={() => handleCopyUrl(article)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  )
}
