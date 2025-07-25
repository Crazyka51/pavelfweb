"use client"

import { useAdminStore } from "@/lib/admin-state"
import { useDataCache } from "@/lib/admin-state"
import { useCallback } from "react"

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

interface Subscriber {
  id: string
  email: string
  subscribedAt: string
  isActive: boolean
  source: string
}

export const useArticlesData = () => {
  const { articles, setArticles, setIsLoading } = useAdminStore()
  const { shouldRefresh, updateCache } = useDataCache()

  const loadArticles = useCallback(
    async (force = false) => {
      if (!force && !shouldRefresh("articles")) {
        return articles
      }

      setIsLoading(true)
      try {
        const adminToken = localStorage.getItem("adminToken")
        const response = await fetch("/api/admin/articles", {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setArticles(data)
          updateCache("articles")
          return data
        } else if (response.status === 401) {
          throw new Error("Unauthorized")
        } else {
          throw new Error("Failed to load articles")
        }
      } catch (error) {
        console.error("Error loading articles:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [articles, shouldRefresh, setArticles, setIsLoading, updateCache],
  )

  const createArticle = useCallback(
    async (articleData: Omit<Article, "id" | "createdAt" | "updatedAt">) => {
      try {
        const adminToken = localStorage.getItem("adminToken")
        const response = await fetch("/api/admin/articles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(articleData),
        })

        if (response.ok) {
          const newArticle = await response.json()
          setArticles([...articles, newArticle])
          updateCache("articles")
          return newArticle
        } else {
          throw new Error("Failed to create article")
        }
      } catch (error) {
        console.error("Error creating article:", error)
        throw error
      }
    },
    [articles, setArticles, updateCache],
  )

  const updateArticle = useCallback(
    async (id: string, articleData: Partial<Article>) => {
      try {
        const adminToken = localStorage.getItem("adminToken")
        const response = await fetch(`/api/admin/articles/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(articleData),
        })

        if (response.ok) {
          const updatedArticle = await response.json()
          setArticles(articles.map((article) => (article.id === id ? updatedArticle : article)))
          updateCache("articles")
          return updatedArticle
        } else {
          throw new Error("Failed to update article")
        }
      } catch (error) {
        console.error("Error updating article:", error)
        throw error
      }
    },
    [articles, setArticles, updateCache],
  )

  const deleteArticle = useCallback(
    async (id: string) => {
      try {
        const adminToken = localStorage.getItem("adminToken")
        const response = await fetch(`/api/admin/articles/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        })

        if (response.ok) {
          setArticles(articles.filter((article) => article.id !== id))
          updateCache("articles")
          return true
        } else {
          throw new Error("Failed to delete article")
        }
      } catch (error) {
        console.error("Error deleting article:", error)
        throw error
      }
    },
    [articles, setArticles, updateCache],
  )

  const bulkUpdateArticles = useCallback(
    async (ids: string[], updates: Partial<Article>) => {
      try {
        const adminToken = localStorage.getItem("adminToken")
        const response = await fetch("/api/admin/articles/bulk", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ ids, updates }),
        })

        if (response.ok) {
          const updatedArticles = await response.json()
          setArticles(
            articles.map((article) => {
              const updated = updatedArticles.find((u: Article) => u.id === article.id)
              return updated || article
            }),
          )
          updateCache("articles")
          return updatedArticles
        } else {
          throw new Error("Failed to bulk update articles")
        }
      } catch (error) {
        console.error("Error bulk updating articles:", error)
        throw error
      }
    },
    [articles, setArticles, updateCache],
  )

  return {
    articles,
    loadArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    bulkUpdateArticles,
  }
}

export const useSubscribersData = () => {
  const { subscribers, setSubscribers, setIsLoading } = useAdminStore()
  const { shouldRefresh, updateCache } = useDataCache()

  const loadSubscribers = useCallback(
    async (force = false) => {
      if (!force && !shouldRefresh("subscribers")) {
        return subscribers
      }

      setIsLoading(true)
      try {
        const adminToken = localStorage.getItem("adminToken")
        const response = await fetch("/api/admin/newsletter/subscribers", {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setSubscribers(data)
          updateCache("subscribers")
          return data
        } else {
          throw new Error("Failed to load subscribers")
        }
      } catch (error) {
        console.error("Error loading subscribers:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [subscribers, shouldRefresh, setSubscribers, setIsLoading, updateCache],
  )

  const updateSubscriber = useCallback(
    async (id: string, updates: Partial<Subscriber>) => {
      try {
        const adminToken = localStorage.getItem("adminToken")
        const response = await fetch(`/api/admin/newsletter/subscribers/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(updates),
        })

        if (response.ok) {
          const updatedSubscriber = await response.json()
          setSubscribers(subscribers.map((sub) => (sub.id === id ? updatedSubscriber : sub)))
          updateCache("subscribers")
          return updatedSubscriber
        } else {
          throw new Error("Failed to update subscriber")
        }
      } catch (error) {
        console.error("Error updating subscriber:", error)
        throw error
      }
    },
    [subscribers, setSubscribers, updateCache],
  )

  const deleteSubscriber = useCallback(
    async (id: string) => {
      try {
        const adminToken = localStorage.getItem("adminToken")
        const response = await fetch(`/api/admin/newsletter/subscribers/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        })

        if (response.ok) {
          setSubscribers(subscribers.filter((sub) => sub.id !== id))
          updateCache("subscribers")
          return true
        } else {
          throw new Error("Failed to delete subscriber")
        }
      } catch (error) {
        console.error("Error deleting subscriber:", error)
        throw error
      }
    },
    [subscribers, setSubscribers, updateCache],
  )

  const bulkUpdateSubscribers = useCallback(
    async (emails: string[], updates: Partial<Subscriber>) => {
      try {
        const adminToken = localStorage.getItem("adminToken")
        const response = await fetch("/api/admin/newsletter/bulk-actions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            action: "update",
            emails,
            updates,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          setSubscribers(
            subscribers.map((sub) => {
              if (emails.includes(sub.email)) {
                return { ...sub, ...updates }
              }
              return sub
            }),
          )
          updateCache("subscribers")
          return result
        } else {
          throw new Error("Failed to bulk update subscribers")
        }
      } catch (error) {
        console.error("Error bulk updating subscribers:", error)
        throw error
      }
    },
    [subscribers, setSubscribers, updateCache],
  )

  return {
    subscribers,
    loadSubscribers,
    updateSubscriber,
    deleteSubscriber,
    bulkUpdateSubscribers,
  }
}
