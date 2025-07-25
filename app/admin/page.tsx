"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import LoginForm from "./components/LoginForm"
import AdminLayout from "./components/AdminLayout"
import AdminDashboard from "./components/AdminDashboard"
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
  const [currentUser, setCurrentUser] = useState<{ username: string; displayName: string } | null>(null)
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab")
  const articleId = searchParams.get("articleId")

  useEffect(() => {
    checkAuthentication() // Nyní aktivujeme kontrolu autentizace
  }, [])

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
      setCurrentUser(null)
    }
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
    if (tab === "articles" && articleId) {
      return <ArticleEditor articleId={articleId} categories={categories} />
    }
    switch (tab) {
      case "articles":
        return <ArticleManager />
      case "newsletter":
        return <NewsletterManager />
      case "analytics":
        return <AnalyticsManager />
      case "categories":
        return <CategoryManager />
      case "settings":
        return <SettingsManager />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <AdminLayout currentSection={tab as AdminSection} onLogout={handleLogout} currentUser={currentUser}>
      {renderContent()}
    </AdminLayout>
  )
}
