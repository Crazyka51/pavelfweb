'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from './components/LoginForm'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './components/AdminDashboard'
import ArticleEditor from './components/ArticleEditor'
import ArticleManager from './components/ArticleManager'
import CategoryManager from './components/CategoryManager'
import SettingsManager from './components/SettingsManager'

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<'dashboard' | 'articles' | 'editor' | 'categories' | 'analytics' | 'backup' | 'settings'>('dashboard')
  const [editingArticle, setEditingArticle] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('admin_token')
    if (token) {
      // Verify token with server
      fetch('/api/admin/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('admin_token')
        }
        setIsLoading(false)
      })
      .catch(() => {
        localStorage.removeItem('admin_token')
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleLogin = (token: string) => {
    localStorage.setItem('admin_token', token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setIsAuthenticated(false)
  }

  const handleNavigation = (view: string) => {
    setCurrentView(view as 'dashboard' | 'articles' | 'editor' | 'categories' | 'analytics' | 'backup' | 'settings')
    setEditingArticle(null)
  }

  const handleCreateNew = () => {
    setEditingArticle(null)
    setCurrentView('editor')
  }

  const handleEditArticle = (article: any) => {
    setEditingArticle(article)
    setCurrentView('editor')
  }

  const handleSaveArticle = async (articleData: any) => {
    try {
      const url = editingArticle 
        ? `/api/admin/articles/${editingArticle.id}`
        : '/api/admin/articles'
      
      const response = await fetch(url, {
        method: editingArticle ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(articleData)
      })

      if (response.ok) {
        setCurrentView('articles')
        setEditingArticle(null)
      } else {
        alert('Chyba při ukládání článku')
      }
    } catch (error) {
      console.error('Error saving article:', error)
      alert('Chyba při ukládání článku')
    }
  }

  const handleCancelEdit = () => {
    setCurrentView('articles')
    setEditingArticle(null)
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <AdminDashboard
            onCreateNew={handleCreateNew}
            onViewArticles={() => handleNavigation('articles')}
            onViewSettings={() => handleNavigation('settings')}
          />
        )
      case 'articles':
        return (
          <ArticleManager
            onCreateNew={handleCreateNew}
            onEditArticle={handleEditArticle}
            token={localStorage.getItem('admin_token') || ''}
          />
        )
      case 'editor':
        return (
          <ArticleEditor
            article={editingArticle}
            categories={['Aktuality', 'Městská politika', 'Doprava', 'Životní prostředí', 'Kultura', 'Sport']}
            onSave={handleSaveArticle}
            onCancel={handleCancelEdit}
          />
        )
      case 'categories':
        return <CategoryManager />
      case 'analytics':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Statistiky</h2>
            <p className="text-gray-600">Pokročilé statistiky budou přidány v budoucí verzi.</p>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 Pro aktuální návštěvnost a analytics použijte{' '}
                <a 
                  href="https://vercel.com/dashboard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Vercel Dashboard
                </a>
              </p>
            </div>
          </div>
        )
      case 'backup':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Zálohy</h2>
            <p className="text-gray-600">Export a import funkcionalita bude přidána v budoucí verzi.</p>
          </div>
        )
      case 'settings':
        return <SettingsManager />
      default:
        return (
          <AdminDashboard
            onCreateNew={handleCreateNew}
            onViewArticles={() => handleNavigation('articles')}
            onViewSettings={() => handleNavigation('settings')}
          />
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {isAuthenticated ? (
        <AdminLayout 
          currentSection={currentView}
          onSectionChange={handleNavigation}
          onLogout={handleLogout}
        >
          {renderContent()}
        </AdminLayout>
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  )
}
