"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Save, X, Eye, ArrowLeft } from "lucide-react"

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

interface ArticleEditorProps {
  articleId?: string | null
  onBack: () => void
  onSave: () => void
}

export default function ArticleEditor({ articleId, onBack, onSave }: ArticleEditorProps) {
  const [article, setArticle] = useState<Partial<Article>>({
    title: "",
    content: "",
    excerpt: "",
    category: "Aktuality",
    tags: [],
    published: false,
    imageUrl: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [tagInput, setTagInput] = useState("")

  const categories = ["Aktuality", "Městská politika", "Doprava", "Životní prostředí", "Kultura", "Sport"]

  useEffect(() => {
    if (articleId) {
      loadArticle()
    }
  }, [articleId])

  const loadArticle = async () => {
    if (!articleId) return

    setIsLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setArticle(data)
        setTagInput(data.tags?.join(", ") || "")
      }
    } catch (error) {
      console.error("Error loading article:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!article.title?.trim() || !article.content?.trim()) {
      alert("Název a obsah jsou povinné!")
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem("adminToken")
      const tags = tagInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag)

      const articleData = {
        ...article,
        tags,
        excerpt: article.excerpt || generateExcerpt(article.content || ""),
        updatedAt: new Date().toISOString(),
      }

      const url = articleId ? `/api/admin/articles/${articleId}` : "/api/admin/articles"
      const method = articleId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(articleData),
      })

      if (response.ok) {
        alert(articleId ? "Článek byl aktualizován" : "Článek byl vytvořen")
        onSave()
      } else {
        throw new Error("Chyba při ukládání")
      }
    } catch (error) {
      console.error("Error saving article:", error)
      alert("Chyba při ukládání článku")
    } finally {
      setIsSaving(false)
    }
  }

  const generateExcerpt = (content: string) => {
    const textContent = content.replace(/<[^>]*>/g, "")
    return textContent.length > 150 ? textContent.substring(0, 150) + "..." : textContent
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const newTag = tagInput.trim()
      if (newTag && !article.tags?.includes(newTag)) {
        setArticle((prev) => ({
          ...prev,
          tags: [...(prev.tags || []), newTag],
        }))
        setTagInput("")
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    setArticle((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }))
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (isPreview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl font-semibold text-gray-900">Náhled článku</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPreview(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Zpět k editaci
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? "Ukládání..." : "Uložit"}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="bg-white rounded-lg shadow-sm border p-8">
            {article.imageUrl && (
              <img
                src={article.imageUrl || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {article.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
            {article.excerpt && <p className="text-xl text-gray-600 mb-6 font-medium">{article.excerpt}</p>}
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: article.content || "" }} />
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" />
                Zpět
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{articleId ? "Upravit článek" : "Nový článek"}</h1>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Zrušit
              </button>

              <button
                onClick={() => setIsPreview(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Náhled
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving || !article.title?.trim() || !article.content?.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Ukládání..." : "Uložit"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Název článku *
              </label>
              <input
                id="title"
                type="text"
                value={article.title || ""}
                onChange={(e) => setArticle((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Zadejte název článku..."
                required
              />
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Obsah článku *
              </label>
              <textarea
                id="content"
                value={article.content || ""}
                onChange={(e) => setArticle((prev) => ({ ...prev, content: e.target.value }))}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Obsah článku v HTML formátu..."
                required
              />
              <p className="text-sm text-gray-500 mt-2">Můžete používat HTML tagy pro formátování textu.</p>
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                Perex (automaticky se vygeneruje z obsahu, pokud nevyplníte)
              </label>
              <textarea
                id="excerpt"
                value={article.excerpt || ""}
                onChange={(e) => setArticle((prev) => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Krátký popis článku..."
              />
            </div>
          </div>

          <div className="space-y-6">
            {/* Publishing */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Publikování</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    checked={article.published || false}
                    onChange={(e) => setArticle((prev) => ({ ...prev, published: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                    Publikovat článek
                  </label>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Kategorie
              </label>
              <select
                id="category"
                value={article.category || ""}
                onChange={(e) => setArticle((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Štítky
              </label>
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Zadejte štítek a stiskněte Enter"
              />
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 text-blue-600 hover:text-blue-800">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Featured image */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Obrázek článku
              </label>
              <input
                id="imageUrl"
                type="url"
                value={article.imageUrl || ""}
                onChange={(e) => setArticle((prev) => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
              {article.imageUrl && (
                <div className="mt-2">
                  <img
                    src={article.imageUrl || "/placeholder.svg"}
                    alt="Náhled"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
