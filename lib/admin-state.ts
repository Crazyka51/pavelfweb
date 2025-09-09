"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  subscribers: any[] // Newsletter subscribers

  // UI state
  currentSection: string
  editingArticleId: string | null
  isLoading: boolean
  lastUpdated: Record<string, string>

  // Actions
  setArticleFilters: (filters: Partial<AdminFilters["articles"]>) => void
  setAnalyticsFilters: (filters: Partial<AdminFilters["analytics"]>) => void

  setArticles: (articles: Article[]) => void
  setSubscribers: (subscribers: any[]) => void

  setCurrentSection: (section: string) => void
  setEditingArticleId: (id: string | null) => void
  setIsLoading: (loading: boolean) => void

  updateLastUpdated: (key: string) => void

  // Reset functions
  resetArticleFilters: () => void
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
  analytics: {
    selectedPeriod: "30d",
    selectedMetric: "pageviews",
  },
};

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

      clearCache: () =>
        set({
          articles: [],
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
);

// Hook pro práci s cache
export const useDataCache = () => {
  const store = useAdminStore();

  const shouldRefresh = (key: string, maxAge: number = 5 * 60 * 1000) => {
    const lastUpdate = store.lastUpdated[key];
    if (!lastUpdate) return true;

    const age = Date.now() - new Date(lastUpdate).getTime();
    return age > maxAge;
  };

  return {
    shouldRefresh,
    updateCache: store.updateLastUpdated,
    clearCache: store.clearCache,
  };
};
