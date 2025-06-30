"use client"

import { useState, useEffect } from "react"
import AdminLayout from "./components/AdminLayout"
import AdminDashboard from "./components/AdminDashboard"
import ArticleManager from "./components/ArticleManager"
import ArticleEditor from "./components/ArticleEditor"
import SettingsManager from "./components/SettingsManager"
import NewsletterManager from "./components/NewsletterManager"
import LoginForm from "./components/LoginForm"

type View = "dashboard" | "articles" | "editor" | "settings" | "newsletter"

export default function AdminPage() {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingArticle, setEditingArticle] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      if (!token) {
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
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("admin_token")
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
    setEditingArticle(null)
    setCurrentView("editor")
  }

  const handleEditArticle = (articleId: string) => {
    setEditingArticle(articleId)
    setCurrentView("editor")
  }

  const handleBackToArticles = () => {
    setEditingArticle(null)
    setCurrentView("articles")
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
        return <ArticleEditor articleId={editingArticle} onBack={handleBackToArticles} />
      case "settings":
        return <SettingsManager />
      case "newsletter":
        return <NewsletterManager />
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
