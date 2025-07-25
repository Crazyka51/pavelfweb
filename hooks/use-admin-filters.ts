"use client"

import { useAdminStore } from "@/lib/admin-state"
import { useCallback, useMemo } from "react"

export const useArticleFilters = () => {
  const {
    filters: { articles: filters },
    setArticleFilters,
    resetArticleFilters,
    articles,
  } = useAdminStore()

  const setSearchTerm = useCallback(
    (searchTerm: string) => {
      setArticleFilters({ searchTerm, currentPage: 1 })
    },
    [setArticleFilters],
  )

  const setCategory = useCallback(
    (selectedCategory: string) => {
      setArticleFilters({ selectedCategory, currentPage: 1 })
    },
    [setArticleFilters],
  )

  const setStatus = useCallback(
    (selectedStatus: string) => {
      setArticleFilters({ selectedStatus, currentPage: 1 })
    },
    [setArticleFilters],
  )

  const setSorting = useCallback(
    (sortBy: typeof filters.sortBy, sortOrder: typeof filters.sortOrder) => {
      setArticleFilters({ sortBy, sortOrder })
    },
    [setArticleFilters],
  )

  const setSelectedArticles = useCallback(
    (selectedArticles: string[]) => {
      setArticleFilters({ selectedArticles })
    },
    [setArticleFilters],
  )

  const toggleArticleSelection = useCallback(
    (articleId: string) => {
      const newSelection = filters.selectedArticles.includes(articleId)
        ? filters.selectedArticles.filter((id) => id !== articleId)
        : [...filters.selectedArticles, articleId]

      setArticleFilters({ selectedArticles: newSelection })
    },
    [filters.selectedArticles, setArticleFilters],
  )

  const selectAllArticles = useCallback(
    (articleIds: string[]) => {
      const allSelected = filters.selectedArticles.length === articleIds.length
      setArticleFilters({
        selectedArticles: allSelected ? [] : articleIds,
      })
    },
    [filters.selectedArticles.length, setArticleFilters],
  )

  const setPage = useCallback(
    (currentPage: number) => {
      setArticleFilters({ currentPage })
    },
    [setArticleFilters],
  )

  // Memoized filtered articles
  const filteredArticles = useMemo(() => {
    let filtered = [...articles]

    // Text search
    if (filters.searchTerm.trim()) {
      const search = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(search) ||
          article.excerpt.toLowerCase().includes(search) ||
          article.content.toLowerCase().includes(search) ||
          article.tags.some((tag) => tag.toLowerCase().includes(search)),
      )
    }

    // Category filter
    if (filters.selectedCategory !== "all") {
      filtered = filtered.filter((article) => article.category === filters.selectedCategory)
    }

    // Status filter
    if (filters.selectedStatus !== "all") {
      switch (filters.selectedStatus) {
        case "published":
          filtered = filtered.filter((article) => article.published && !article.publishedAt)
          break
        case "draft":
          filtered = filtered.filter((article) => !article.published && !article.publishedAt)
          break
        case "scheduled":
          filtered = filtered.filter((article) => article.publishedAt)
          break
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0

      switch (filters.sortBy) {
        case "title":
          compareValue = a.title.localeCompare(b.title)
          break
        case "created":
          compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case "updated":
        default:
          compareValue = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
      }

      return filters.sortOrder === "asc" ? compareValue : -compareValue
    })

    return filtered
  }, [articles, filters])

  return {
    filters,
    filteredArticles,
    setSearchTerm,
    setCategory,
    setStatus,
    setSorting,
    setSelectedArticles,
    toggleArticleSelection,
    selectAllArticles,
    setPage,
    resetFilters: resetArticleFilters,
  }
}

export const useNewsletterFilters = () => {
  const {
    filters: { newsletter: filters },
    setNewsletterFilters,
    resetNewsletterFilters,
    subscribers,
  } = useAdminStore()

  const setSearchTerm = useCallback(
    (searchTerm: string) => {
      setNewsletterFilters({ searchTerm })
    },
    [setNewsletterFilters],
  )

  const setSource = useCallback(
    (selectedSource: string) => {
      setNewsletterFilters({ selectedSource })
    },
    [setNewsletterFilters],
  )

  const setStatus = useCallback(
    (selectedStatus: string) => {
      setNewsletterFilters({ selectedStatus })
    },
    [setNewsletterFilters],
  )

  const setSelectedEmails = useCallback(
    (selectedEmails: string[]) => {
      setNewsletterFilters({ selectedEmails })
    },
    [setNewsletterFilters],
  )

  const toggleEmailSelection = useCallback(
    (email: string) => {
      const newSelection = filters.selectedEmails.includes(email)
        ? filters.selectedEmails.filter((e) => e !== email)
        : [...filters.selectedEmails, email]

      setNewsletterFilters({ selectedEmails: newSelection })
    },
    [filters.selectedEmails, setNewsletterFilters],
  )

  const selectAllEmails = useCallback(
    (emails: string[]) => {
      const allSelected = filters.selectedEmails.length === emails.length
      setNewsletterFilters({
        selectedEmails: allSelected ? [] : emails,
      })
    },
    [filters.selectedEmails.length, setNewsletterFilters],
  )

  const setCurrentTab = useCallback(
    (currentTab: typeof filters.currentTab) => {
      setNewsletterFilters({ currentTab })
    },
    [setNewsletterFilters],
  )

  // Memoized filtered subscribers
  const filteredSubscribers = useMemo(() => {
    let filtered = [...subscribers]

    // Text search
    if (filters.searchTerm.trim()) {
      const search = filters.searchTerm.toLowerCase()
      filtered = filtered.filter((subscriber) => subscriber.email.toLowerCase().includes(search))
    }

    // Source filter
    if (filters.selectedSource !== "all") {
      filtered = filtered.filter((subscriber) => subscriber.source === filters.selectedSource)
    }

    // Status filter
    if (filters.selectedStatus !== "all") {
      switch (filters.selectedStatus) {
        case "active":
          filtered = filtered.filter((subscriber) => subscriber.isActive)
          break
        case "inactive":
          filtered = filtered.filter((subscriber) => !subscriber.isActive)
          break
      }
    }

    return filtered
  }, [subscribers, filters])

  return {
    filters,
    filteredSubscribers,
    setSearchTerm,
    setSource,
    setStatus,
    setSelectedEmails,
    toggleEmailSelection,
    selectAllEmails,
    setCurrentTab,
    resetFilters: resetNewsletterFilters,
  }
}
