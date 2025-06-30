"use client"

import { useState, useEffect } from "react"
import AdminLayout from "./components/AdminLayout"
import AdminDashboard from "./components/AdminDashboard"
import ArticleManager from "./components/ArticleManager"
import ArticleEditor from "./components/ArticleEditor"
import NewsletterManager from "./components/NewsletterManager"
import SettingsManager from "./components/SettingsManager"
import LoginForm from "./components/LoginForm"

type AdminView = "dashboard" | "articles" | "editor" | "newsletter" | "settings"

export default function AdminPage() {
  const [currentView, setCurrentView] = useState<AdminView>("dashboard")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem("admin_token")
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
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem("admin_token")
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
    localStorage.setItem("admin_token", token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    setIsAuthenticated(false)
    setCurrentView("dashboard")
  }

  const handleCreateNew = () => {
    setEditingArticleId(null)
    setCurrentView("editor")
  }

  const handleEditArticle = (articleId: string) => {
    setEditingArticleId(articleId)
    setCurrentView("editor")
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
    setEditingArticleId(null)
  }

  const handleBackToArticles = () => {
    setCurrentView("articles")
    setEditingArticleId(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <AdminDashboard
            onCreateNew={handleCreateNew}
            onViewArticles={() => setCurrentView("articles")}
            onViewSettings={() => setCurrentView("settings")}
          />
        )
      case "articles":
        return <ArticleManager onEditArticle={handleEditArticle} onCreateNew={handleCreateNew} />
      case "editor":
        return (
          <ArticleEditor
            articleId={editingArticleId}
            onBack={editingArticleId ? handleBackToArticles : handleBackToDashboard}
            onSave={editingArticleId ? handleBackToArticles : handleBackToDashboard}
          />
        )
      case "newsletter":
        return <NewsletterManager />
      case "settings":
        return <SettingsManager />
      default:
        return (
          <AdminDashboard
            onCreateNew={handleCreateNew}
            onViewArticles={() => setCurrentView("articles")}
            onViewSettings={() => setCurrentView("settings")}
          />
        )
    }
  }

  return (
    <AdminLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      onLogout={handleLogout}
      onCreateNew={handleCreateNew}
    >
      {renderContent()}
    </AdminLayout>
  )
}
