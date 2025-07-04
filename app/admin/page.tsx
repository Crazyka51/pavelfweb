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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentSection, setCurrentSection] = useState<AdminSection>("dashboard")
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<{ username: string; displayName: string } | null>(null)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/admin/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setIsAuthenticated(true)
        setCurrentUser(userData.user || { username: "admin", displayName: "Pavel Fišer" })
      } else {
        localStorage.removeItem("adminToken")
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
    localStorage.setItem("adminToken", token)
    setIsAuthenticated(true)
    setCurrentUser({ username: "admin", displayName: "Pavel Fišer" })
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    setIsAuthenticated(false)
    setCurrentSection("dashboard")
    setCurrentUser(null)
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

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  const renderContent = () => {
    switch (currentSection) {
      case "dashboard":
        return <Dashboard />
      case "articles":
        return <ArticleManager onEditArticle={handleEditArticle} onCreateNew={handleCreateNew} />
      case "new-article":
        return (
          <ArticleEditor
            articleId={editingArticleId}
            onBack={editingArticleId ? handleBackToArticles : handleBackToDashboard}
            onSave={editingArticleId ? handleBackToArticles : handleBackToDashboard}
          />
        )
      case "categories":
        return <CategoryManager />
      case "newsletter":
        return <NewsletterManager token={localStorage.getItem("adminToken") || ""} />
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
        return <Dashboard />
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
