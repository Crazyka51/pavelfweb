"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Copy,
  Tag,
  MoreVertical,
  Plus,
  Download,
  CheckSquare,
  Square,
  FileText,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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

interface ArticleManagerProps {
  onEditArticle?: (article: Article) => void
  onCreateNew?: () => void
  token?: string
}

export default function ArticleManager({ onEditArticle, onCreateNew, token }: ArticleManagerProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"updated" | "created" | "title">("updated")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isLoading, setIsLoading] = useState(true)
  const [showActions, setShowActions] = useState<string | null>(null)

  const categories = ["Aktuality", "Městská politika", "Doprava", "Životní prostředí", "Kultura", "Sport"]

  const loadArticles = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/articles")
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setArticles(data.data.articles)
      } else if (response.status === 401) {
        console.error("Unauthorized access - token may be invalid")
      } else {
        console.error("Error loading articles:", data.error)
      }
    } catch (error) {
      console.error("Error loading articles:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const filterArticles = useCallback(() => {
    let filtered = [...articles]

    // Text search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(search) ||
          article.excerpt.toLowerCase().includes(search) ||
          article.content.toLowerCase().includes(search) ||
          article.tags.some((tag) => tag.toLowerCase().includes(search)),
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((article) => article.category === selectedCategory)
    }

    // Status filter
    if (selectedStatus !== "all") {
      switch (selectedStatus) {
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

      switch (sortBy) {
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

      return sortOrder === "asc" ? compareValue : -compareValue
    })

    setFilteredArticles(filtered)
  }, [articles, searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder])

  useEffect(() => {
    loadArticles()
  }, [loadArticles])

  useEffect(() => {
    filterArticles()
  }, [filterArticles])

  const handleSelectAll = () => {
    if (selectedArticles.length === filteredArticles.length) {
      setSelectedArticles([])
    } else {
      setSelectedArticles(filteredArticles.map((article) => article.id))
    }
  }

  const handleSelectArticle = (articleId: string) => {
    setSelectedArticles((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId],
    )
  }

  const handleBulkDelete = async () => {
    if (selectedArticles.length === 0) {
      alert("Nejprve vyberte články ke smazání")
      return
    }

    if (confirm(`Opravdu chcete smazat ${selectedArticles.length} článků?`)) {
      try {
        for (const articleId of selectedArticles) {
          const response = await fetch(`/api/admin/articles/${articleId}`, {
            method: "DELETE",
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(`Chyba při mazání článku ${articleId}: ${errorData.message}`)
          }
        }
        await loadArticles()
        setSelectedArticles([])
        alert("Články byly úspěšně smazány")
      } catch (error) {
        console.error("Error deleting articles:", error)
        alert(`Chyba při mazání článků: ${error instanceof Error ? error.message : "Neznámá chyba"}`)
      }
    }
  }

  const handleBulkPublish = async () => {
    if (selectedArticles.length === 0) return

    try {
      for (const articleId of selectedArticles) {
        const article = articles.find((a) => a.id === articleId)
        if (article) {
          await fetch(`/api/admin/articles/${articleId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...article, published: true, publishedAt: undefined }),
          })
        }
      }
      await loadArticles()
      setSelectedArticles([])
      alert("Články byly úspěšně publikovány")
    } catch (error) {
      console.error("Error publishing articles:", error)
      alert("Chyba při publikování článků")
    }
  }

  const handleBulkUnpublish = async () => {
    if (selectedArticles.length === 0) return

    try {
      for (const articleId of selectedArticles) {
        const article = articles.find((a) => a.id === articleId)
        if (article) {
          await fetch(`/api/admin/articles/${articleId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...article, published: false, publishedAt: undefined }),
          })
        }
      }
      await loadArticles()
      setSelectedArticles([])
      alert("Články byly převedeny na koncepty")
    } catch (error) {
      console.error("Error unpublishing articles:", error)
      alert("Chyba při převádění na koncepty")
    }
  }

  const handleDeleteArticle = async (articleId: string) => {
    if (confirm("Opravdu chcete smazat tento článek?")) {
      try {
        const response = await fetch(`/api/admin/articles/${articleId}`, {
          method: "DELETE",
        })

        const data = await response.json()

        if (response.ok && data.success) {
          await loadArticles()
          alert(data.message || "Článek byl úspěšně smazán")
        } else {
          throw new Error(data.error || data.message || "Neznámá chyba při mazání článku")
        }
      } catch (error) {
        console.error("Error deleting article:", error)
        alert(`Chyba při mazání článku: ${error instanceof Error ? error.message : "Neznámá chyba"}`)
      }
    }
  }

  const handleDuplicateArticle = async (article: Article) => {
    try {
      const newArticle = {
        ...article,
        id: undefined,
        title: `${article.title} (kopie)`,
        published: false,
        publishedAt: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      }

      const response = await fetch("/api/admin/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newArticle),
      })

      if (response.ok) {
        await loadArticles()
        alert("Článek byl úspěšně duplikován")
      }
    } catch (error) {
      console.error("Error duplicating article:", error)
      alert("Chyba při duplikování článku")
    }
  }

  const exportArticles = () => {
    const dataStr = JSON.stringify(filteredArticles, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `articles_${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Neplatné datum"; // Vrátí informaci o neplatném datu
    }
    return date.toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const getStatusBadge = (article: Article) => {
    if (article.publishedAt) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">Naplánováno</span>
      )
    } else if (article.published) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Publikováno</span>
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Koncept</span>
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Správa článků</h2>
          <p className="text-gray-600 mt-1">
            Celkem {articles.length} článků • Zobrazeno {filteredArticles.length}
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={exportArticles}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={onCreateNew}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nový článek
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Hledat články..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Všechny kategorie</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Všechny stavy</option>
            <option value="published">Publikováno</option>
            <option value="draft">Koncepty</option>
            <option value="scheduled">Naplánováno</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-")
              setSortBy(field as "updated" | "created" | "title")
              setSortOrder(order as "asc" | "desc")
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="updated-desc">Nejnovější</option>
            <option value="updated-asc">Nejstarší</option>
            <option value="title-asc">Název A-Z</option>
            <option value="title-desc">Název Z-A</option>
            <option value="created-desc">Datum vytvoření ↓</option>
            <option value="created-asc">Datum vytvoření ↑</option>
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedArticles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900">Vybráno {selectedArticles.length} článků</span>
              <button onClick={() => setSelectedArticles([])} className="text-sm text-blue-600 hover:text-blue-700">
                Zrušit výběr
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkPublish}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Publikovat
              </button>
              <button
                onClick={handleBulkUnpublish}
                className="px-3 py-1 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                Koncept
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Smazat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Articles table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné články nenalezeny</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                ? "Zkuste změnit filtry nebo vyhledávací dotaz."
                : "Zatím nemáte žádné články. Vytvořte svůj první článek!"}
            </p>
            {!searchTerm && selectedCategory === "all" && selectedStatus === "all" && (
              <button
                onClick={onCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Vytvořit první článek
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button onClick={handleSelectAll} className="text-gray-400 hover:text-gray-600">
                      {selectedArticles.length === filteredArticles.length ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Článek
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stav
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktualizováno
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSelectArticle(article.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {selectedArticles.includes(article.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-4">
                        {article.imageUrl && (
                          <Image
                            src={article.imageUrl || "/placeholder.svg"}
                            alt={article.title}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{article.title}</h4>
                          <p className="text-sm text-gray-500 truncate">{article.excerpt}</p>
                          {article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {article.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                                >
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </span>
                              ))}
                              {article.tags.length > 3 && (
                                <span className="text-xs text-gray-400">+{article.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{article.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(article)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(article.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative">
                        <button
                          onClick={() => setShowActions(showActions === article.id ? null : article.id)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {showActions === article.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  onEditArticle?.(article)
                                  setShowActions(null)
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="w-4 h-4 mr-3" />
                                Upravit
                              </button>
                              <button
                                onClick={() => {
                                  handleDuplicateArticle(article)
                                  setShowActions(null)
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Copy className="w-4 h-4 mr-3" />
                                Duplikovat
                              </button>
                              <a
                                href={`/aktuality/${article.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowActions(null)}
                              >
                                <Eye className="w-4 h-4 mr-3" />
                                Náhled
                              </a>
                              <button
                                onClick={() => {
                                  handleDeleteArticle(article.id)
                                  setShowActions(null)
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-3" />
                                Smazat
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
