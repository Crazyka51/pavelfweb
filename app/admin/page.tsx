"use client"

import { useState, useEffect } from "react"
import LoginForm from "./components/LoginForm"
import AdminLayout from "./components/AdminLayout"
import Dashboard from "./components/Dashboard"
import ArticleManager from "./components/ArticleManager"
import ArticleEditor from "./components/ArticleEditor"
import CategoryManager from "./components/CategoryManager"
import NewsletterManager from "./components/NewsletterManager"
import SettingsManager from "./components/SettingsManager"
import AnalyticsManager from "./components/AnalyticsManager"

type AdminSection =
  | "dashboard"
  | "articles"
  | "new-article"
  | "categories"
  | "newsletter"
  | "analytics"
  | "backup"
  | "settings"

const categories = ["Aktuality", "Městská politika", "Doprava", "Životní prostředí", "Kultura", "Sport"]

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Změněno na false
  const [isLoading, setIsLoading] = useState(true) // Změněno na true
  const [currentSection, setCurrentSection] = useState<AdminSection>("dashboard")
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<{ username: string; displayName: string } | null>(null)
  const [article, setArticle] = useState<any | null>(null)

  useEffect(() => {
    checkAuthentication() // Nyní aktivujeme kontrolu autentizace
  }, [])

  useEffect(() => {
    const fetchArticle = async () => {
      if (editingArticleId) {
        try {
          const response = await fetch(`/api/admin/articles/${editingArticleId}`)
          if (response.ok) {
            const fetchedArticle = await response.json()
            setArticle(fetchedArticle.data) // Přístup k datům přes .data
          } else {
            setArticle(null)
          }
        } catch (error) {
          console.error("Error fetching article:", error)
          setArticle(null)
        }
      } else {
        setArticle(null)
      }
    }
    fetchArticle()
  }, [editingArticleId])

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/admin/auth/verify", {
        credentials: "include",
      })

      if (response.ok) {
        const userData = await response.json()
        setIsAuthenticated(true)
        setCurrentUser(userData.user)
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = (token: string) => {
    setIsAuthenticated(true)
    // Po úspěšném přihlášení by se měl uživatel načíst z API /api/admin/auth/verify
    checkAuthentication()
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsAuthenticated(false)
      setCurrentSection("dashboard")
      setCurrentUser(null)
    }
  }

  const handleSectionChange = (section: string) => {
    setCurrentSection(section as AdminSection)
    setEditingArticleId(null)
  }

  const handleCreateNew = () => {
    setEditingArticleId(null)
    setCurrentSection("new-article")
  }

  const handleEditArticle = (article: any) => {
    setEditingArticleId(article.id)
    setCurrentSection("new-article")
  }

  const handleBackToDashboard = () => {
    setCurrentSection("dashboard")
    setEditingArticleId(null)
  }

  const handleBackToArticles = () => {
    setCurrentSection("articles")
    setEditingArticleId(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Nyní je autentizace aktivní
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  const renderContent = () => {
    switch (currentSection) {
      case "dashboard":
        return <Dashboard onCreateNew={handleCreateNew} />
      case "articles":
        return <ArticleManager onEditArticle={handleEditArticle} onCreateNew={handleCreateNew} />
      case "new-article":
        return (
          <ArticleEditor
            article={article}
            categories={categories}
            onCancel={editingArticleId ? handleBackToArticles : handleBackToDashboard}
            onSave={async (articleData) => {
              console.log("Saving article:", articleData)
              let response
              if (editingArticleId) {
                response = await fetch(`/api/admin/articles/${editingArticleId}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(articleData),
                })
              } else {
                response = await fetch("/api/admin/articles", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(articleData),
                })
              }

              if (response.ok) {
                console.log("Article saved successfully!")
                ;(editingArticleId ? handleBackToArticles : handleBackToDashboard)()
              } else {
                try {
                  const errorData = await response.json()
                  console.error("Failed to save article:", errorData.error)
                  alert(`Chyba při ukládání článku: ${errorData.error || 'Neznámá chyba'}`)
                } catch (e) {
                  console.error("Failed to parse error response:", e)
                  alert(`Chyba při ukládání článku: Neočekávaná chyba serveru`)
                }
              }
            }}
          />
        )
      case "categories":
        return <CategoryManager />
      case "newsletter":
        return <NewsletterManager />
      case "analytics":
        return <AnalyticsManager />
      case "backup":
        return (
          <div className="p-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-4">Zálohy</h2>
              <p className="text-gray-600">Export a import dat systému</p>
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">Funkce zálohování bude implementována v budoucí verzi.</p>
              </div>
            </div>
          </div>
        )
      case "settings":
        return <SettingsManager />
      default:
        return <Dashboard onCreateNew={handleCreateNew} />
    }
  }

  return (
    <AdminLayout
      currentSection={currentSection}
      onSectionChange={handleSectionChange}
      onLogout={handleLogout}
      currentUser={currentUser}
    >
      {renderContent()}
    </AdminLayout>
  )
}
