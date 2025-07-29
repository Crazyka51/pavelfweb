"use client"

import { useState, useEffect } from "react"
import { FileText, Eye, Edit3, Calendar, TrendingUp, Mail, BarChart3, Clock, PlusCircle, Activity } from "lucide-react"
import { TypewriterText } from "./TypewriterText"

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

interface DashboardStats {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  scheduledArticles: number
  totalWords: number
  avgWordsPerArticle: number
  lastWeekArticles: number
  newsletterSubscribers: number
  recentActivity: Array<{
    id: string
    type: "create" | "update" | "publish" | "draft"
    title: string
    timestamp: string
  }>
}

interface DashboardProps {
  onCreateNew?: () => void;
}

export default function Dashboard({ onCreateNew = () => {} }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    scheduledArticles: 0,
    totalWords: 0,
    avgWordsPerArticle: 0,
    lastWeekArticles: 0,
    newsletterSubscribers: 0,
    recentActivity: [],
  })
  const [recentArticles, setRecentArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem("adminToken")

      // Load articles
      const articlesResponse = await fetch("/api/admin/articles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (articlesResponse.ok) {
        const data = await articlesResponse.json()
        const articles: Article[] = data.articles

        // Calculate statistics
        const published = articles.filter((a) => a.published && !a.publishedAt)
        const drafts = articles.filter((a) => !a.published && !a.publishedAt)
        const scheduled = articles.filter((a) => a.publishedAt)

        // Count words
        const totalWords = articles.reduce((sum, article) => {
          const plainText = article.content.replace(/<[^>]*>/g, " ")
          const wordCount = plainText.split(/\s+/).filter((word) => word.length > 0).length
          return sum + wordCount
        }, 0)

        const avgWords = articles.length > 0 ? Math.round(totalWords / articles.length) : 0

        // Count articles from last week
        const lastWeek = new Date()
        lastWeek.setDate(lastWeek.getDate() - 7)
        const lastWeekCount = articles.filter((a) => new Date(a.createdAt) >= lastWeek).length

        // Get recent articles
        const recent = articles
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5)

        // Generate recent activity
        const activity = articles
          .slice(0, 8)
          .map((article) => ({
            id: article.id,
            type: article.published ? ("publish" as const) : ("draft" as const),
            title: article.title,
            timestamp: article.updatedAt,
          }))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        setStats({
          totalArticles: articles.length,
          publishedArticles: published.length,
          draftArticles: drafts.length,
          scheduledArticles: scheduled.length,
          totalWords: totalWords,
          avgWordsPerArticle: avgWords,
          lastWeekArticles: lastWeekCount,
          newsletterSubscribers: 127, // Mock data
          recentActivity: activity,
        })

        setRecentArticles(recent)
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffDays > 0) return `před ${diffDays} dny`
    if (diffHours > 0) return `před ${diffHours} h`
    if (diffMinutes > 0) return `před ${diffMinutes} min`
    return "právě teď"
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "publish":
        return <Eye className="w-4 h-4 text-green-600" />
      case "draft":
        return <Edit3 className="w-4 h-4 text-yellow-600" />
      case "create":
        return <PlusCircle className="w-4 h-4 text-blue-600" />
      case "update":
        return <Clock className="w-4 h-4 text-purple-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "publish":
        return "bg-green-50 border-green-200"
      case "draft":
        return "bg-yellow-50 border-yellow-200"
      case "create":
        return "bg-blue-50 border-blue-200"
      case "update":
        return "bg-purple-50 border-purple-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              <TypewriterText text="Vítejte zpět, Pavle! 👋" speed={35} />
            </h2>
            <p className="text-blue-100">Přehled vašeho CMS systému a posledních aktivit</p>
          </div>
          <div className="hidden lg:block">
            <button 
              onClick={onCreateNew}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              + Nový článek
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Celkem článků</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalArticles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Publikováno</p>
              <p className="text-2xl font-bold text-gray-900">{stats.publishedArticles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Edit3 className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Koncepty</p>
              <p className="text-2xl font-bold text-gray-900">{stats.draftArticles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Naplánováno</p>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduledArticles}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions for mobile */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onCreateNew}
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PlusCircle className="w-5 h-5 mr-2" />
            Nový článek
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="w-5 h-5 mr-2" />
            Správa článků
          </button>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent articles */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Nedávné články</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Zobrazit všechny →</button>
            </div>
          </div>
          <div className="p-6">
            {recentArticles.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Zatím nemáte žádné články</p>
                <button 
                  onClick={onCreateNew}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Vytvořit první článek
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {article.imageUrl && (
                      <img
                        src={article.imageUrl || "/placeholder.svg"}
                        alt={article.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{article.title}</h4>
                      <p className="text-sm text-gray-500 truncate">{article.excerpt}</p>
                      <div className="flex items-center mt-2 space-x-4 text-xs text-gray-400">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            article.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {article.published ? "Publikováno" : "Koncept"}
                        </span>
                        <span>{formatDate(article.updatedAt)}</span>
                        <span>{article.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Nedávná aktivita</h3>
          </div>
          <div className="p-6">
            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Žádná aktivita</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map((activity, index) => (
                  <div
                    key={`${activity.id}-${index}`}
                    className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        {activity.type === "publish" ? "Publikováno" : "Uloženo jako koncept"} •{" "}
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Celkem slov</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWords.toLocaleString("cs-CZ")}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-pink-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-pink-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Průměr slov/článek</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgWordsPerArticle}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nové za týden</p>
              <p className="text-2xl font-bold text-gray-900">{stats.lastWeekArticles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-teal-100 rounded-lg">
              <Mail className="w-6 h-6 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Newsletter odběratelé</p>
              <p className="text-2xl font-bold text-gray-900">{stats.newsletterSubscribers}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
