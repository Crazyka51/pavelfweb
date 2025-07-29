"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// Types pro state
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

interface AdminFilters {
  articles: {
    searchTerm: string
    selectedCategory: string
    selectedStatus: string
    sortBy: "updated" | "created" | "title"
    sortOrder: "asc" | "desc"
    selectedArticles: string[]
    currentPage: number
  }
  newsletter: {
    searchTerm: string
    selectedSource: string
    selectedStatus: string
    selectedEmails: string[]
    currentTab: "subscribers" | "campaigns" | "create"
  }
  analytics: {
    selectedPeriod: string
    selectedMetric: string
  }
}

interface AdminState {
  // Filters state
  filters: AdminFilters

  // Data cache
  articles: Article[]
  subscribers: Subscriber[]

  // UI state
  currentSection: string
  editingArticleId: string | null
  isLoading: boolean
  lastUpdated: Record<string, string>

  // Actions
  setArticleFilters: (filters: Partial<AdminFilters["articles"]>) => void
  setNewsletterFilters: (filters: Partial<AdminFilters["newsletter"]>) => void
  setAnalyticsFilters: (filters: Partial<AdminFilters["analytics"]>) => void

  setArticles: (articles: Article[]) => void
  setSubscribers: (subscribers: Subscriber[]) => void

  setCurrentSection: (section: string) => void
  setEditingArticleId: (id: string | null) => void
  setIsLoading: (loading: boolean) => void

  updateLastUpdated: (key: string) => void

  // Reset functions
  resetArticleFilters: () => void
  resetNewsletterFilters: () => void
  clearCache: () => void
}

const defaultFilters: AdminFilters = {
  articles: {
    searchTerm: "",
    selectedCategory: "all",
    selectedStatus: "all",
    sortBy: "updated",
    sortOrder: "desc",
    selectedArticles: [],
    currentPage: 1,
  },
  newsletter: {
    searchTerm: "",
    selectedSource: "all",
    selectedStatus: "all",
    selectedEmails: [],
    currentTab: "subscribers",
  },
  analytics: {
    selectedPeriod: "30d",
    selectedMetric: "pageviews",
  },
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Initial state
      filters: defaultFilters,
      articles: [],
      subscribers: [],
      currentSection: "dashboard",
      editingArticleId: null,
      isLoading: false,
      lastUpdated: {},

      // Filter actions
      setArticleFilters: (newFilters) =>
        set((state) => ({
          filters: {
            ...state.filters,
            articles: { ...state.filters.articles, ...newFilters },
          },
        })),

      setNewsletterFilters: (newFilters) =>
        set((state) => ({
          filters: {
            ...state.filters,
            newsletter: { ...state.filters.newsletter, ...newFilters },
          },
        })),

      setAnalyticsFilters: (newFilters) =>
        set((state) => ({
          filters: {
            ...state.filters,
            analytics: { ...state.filters.analytics, ...newFilters },
          },
        })),

      // Data actions
      setArticles: (articles) => set({ articles }),
      setSubscribers: (subscribers) => set({ subscribers }),

      // UI actions
      setCurrentSection: (section) => set({ currentSection: section }),
      setEditingArticleId: (id) => set({ editingArticleId: id }),
      setIsLoading: (loading) => set({ isLoading: loading }),

      updateLastUpdated: (key) =>
        set((state) => ({
          lastUpdated: {
            ...state.lastUpdated,
            [key]: new Date().toISOString(),
          },
        })),

      // Reset functions
      resetArticleFilters: () =>
        set((state) => ({
          filters: {
            ...state.filters,
            articles: defaultFilters.articles,
          },
        })),

      resetNewsletterFilters: () =>
        set((state) => ({
          filters: {
            ...state.filters,
            newsletter: defaultFilters.newsletter,
          },
        })),

      clearCache: () =>
        set({
          articles: [],
          subscribers: [],
          lastUpdated: {},
        }),
    }),
    {
      name: "admin-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        filters: state.filters,
        currentSection: state.currentSection,
        editingArticleId: state.editingArticleId,
        lastUpdated: state.lastUpdated,
      }),
    },
  ),
)

// Hook pro práci s cache
export const useDataCache = () => {
  const store = useAdminStore()

  const shouldRefresh = (key: string, maxAge: number = 5 * 60 * 1000) => {
    const lastUpdate = store.lastUpdated[key]
    if (!lastUpdate) return true

    const age = Date.now() - new Date(lastUpdate).getTime()
    return age > maxAge
  }

  return {
    shouldRefresh,
    updateCache: store.updateLastUpdated,
    clearCache: store.clearCache,
  }
}
