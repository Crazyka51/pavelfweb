"use client"

import { useState, useEffect } from "react"
import AdminLayout from "./components/AdminLayout"
import AdminDashboard from "./components/AdminDashboard"
import ArticleManager from "./components/ArticleManager"
import ArticleEditor from "./components/ArticleEditor"
import CategoryManager from "./components/CategoryManager"
import NewsletterManager from "./components/NewsletterManager"
import SettingsManager from "./components/SettingsManager"
import LoginForm from "./components/LoginForm"

type AdminSection =
  | "dashboard"
  | "articles"
  | "editor"
  | "categories"
  | "newsletter"
  | "analytics"
  | "backup"
  | "settings"

export default function AdminPage() {
  const [currentSection, setCurrentSection] = useState<AdminSection>("dashboard")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<{ username: string; displayName: string } | null>(null)

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
        const userData = await response.json()
        setIsAuthenticated(true)
        setCurrentUser(userData.user || { username: "admin", displayName: "Pavel Fišer" })
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
    setCurrentUser({ username: "admin", displayName: "Pavel Fišer" })
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    setIsAuthenticated(false)
    setCurrentSection("dashboard")
    setCurrentUser(null)
  }

  const handleSectionChange = (section: string) => {
    console.log("Section changing to:", section)
    setCurrentSection(section as AdminSection)
    setEditingArticleId(null)
  }

  const handleCreateNew = () => {
    setEditingArticleId(null)
    setCurrentSection("editor")
  }

  const handleEditArticle = (articleId: string) => {
    setEditingArticleId(articleId)
    setCurrentSection("editor")
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
    console.log("Rendering content for section:", currentSection)

    switch (currentSection) {
      case "dashboard":
        return (
          <AdminDashboard
            onCreateNew={handleCreateNew}
            onViewArticles={() => setCurrentSection("articles")}
            onViewSettings={() => setCurrentSection("settings")}
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
      case "categories":
        return <CategoryManager />
      case "newsletter":
        return <NewsletterManager />
      case "analytics":
        return (
          <div className="p-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-4">Statistiky</h2>
              <p className="text-gray-600">Analytics dashboard bude zde...</p>
            </div>
          </div>
        )
      case "backup":
        return (
          <div className="p-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-4">Zálohy</h2>
              <p className="text-gray-600">Backup management bude zde...</p>
            </div>
          </div>
        )
      case "settings":
        return <SettingsManager />
      default:
        return (
          <AdminDashboard
            onCreateNew={handleCreateNew}
            onViewArticles={() => setCurrentSection("articles")}
            onViewSettings={() => setCurrentSection("settings")}
          />
        )
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
