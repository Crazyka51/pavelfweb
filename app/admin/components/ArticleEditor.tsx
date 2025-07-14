"use client"

import { useState, useEffect } from "react"
import { Save, X, Eye, FileText } from "lucide-react"
import SeoPreview from "./SeoPreview"
import SchedulePublishing from "./SchedulePublishing"
import DraftManager from "./DraftManager"
import TiptapEditor from "./TiptapEditor"

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
  article: Article | null
  categories: string[]
  onSave: (article: Partial<Article>) => void
  onCancel: () => void
}

export default function ArticleEditor({ article, categories, onSave, onCancel }: ArticleEditorProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")
  const [published, setPublished] = useState(false)
  const [publishedAt, setPublishedAt] = useState<string | undefined>()
  const [imageUrl, setImageUrl] = useState("")
  const [isPreview, setIsPreview] = useState(false)
  const [showSeoPreview, setShowSeoPreview] = useState(false)
  const [showDraftManager, setShowDraftManager] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved")
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [quillError, setQuillError] = useState<string | null>(null)
  const [editorMode, setEditorMode] = useState<"visual" | "simple" | "html">("visual")

  useEffect(() => {
    setIsMounted(true)
    // Clear any previous quill errors when component mounts
    setQuillError(null)
  }, [])

  useEffect(() => {
    if (article) {
      setTitle(article.title || "")
      // Ensure content is always a string and clean it if needed
      const cleanContent = typeof article.content === "string" ? article.content : ""
      setContent(cleanContent)
      setExcerpt(article.excerpt || "")
      setCategory(article.category || "")
      setTags(article.tags?.join(", ") || "")
      setPublished(article.published || false)
      setPublishedAt(article.publishedAt)
      setImageUrl(article.imageUrl || "")
    } else {
      // Reset form for new article
      setTitle("")
      setContent("")
      setExcerpt("")
      setCategory(categories[0] || "")
      setTags("")
      setPublished(false)
      setPublishedAt(undefined)
      setImageUrl("")
    }
  }, [article, categories])

  // Auto-save effect
  useEffect(() => {
    if (!title && !content) return // Don't auto-save empty articles

    setAutoSaveStatus("unsaved")

    const autoSaveTimer = setTimeout(() => {
      autoSaveArticle()
    }, 3000) // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer)
  }, [title, content, excerpt, category, tags, published, publishedAt, imageUrl])

  // Word count effect
  useEffect(() => {
    const textContent = content.replace(/<[^>]*>/g, "") // Remove HTML tags
    const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0
    const chars = textContent.length

    setWordCount(words)
    setCharCount(chars)
  }, [content])

  const autoSaveArticle = async () => {
    if (!title.trim() && !content.trim()) return

    setAutoSaveStatus("saving")

    try {
      // Save to localStorage as backup
      const draftData = {
        title,
        content,
        excerpt,
        category,
        tags,
        published,
        publishedAt,
        imageUrl,
        timestamp: new Date().toISOString(),
        articleId: article?.id || "new",
      }
      localStorage.setItem("article_draft", JSON.stringify(draftData))

      setAutoSaveStatus("saved")
    } catch (error) {
      console.error("Auto-save failed:", error)
      setAutoSaveStatus("unsaved")
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Název a obsah jsou povinné!")
      return
    }

    setIsSaving(true)

    const articleData = {
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || generateExcerpt(content),
      category,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      published,
      publishedAt,
      imageUrl: imageUrl.trim() || undefined,
    }

    await onSave(articleData)
    setIsSaving(false)
  }

  const generateExcerpt = (content: string) => {
    // Odstraň HTML tagy a vezmi prvních 150 znaků
    const textContent = content.replace(/<[^>]*>/g, "")
    return textContent.length > 150 ? textContent.substring(0, 150) + "..." : textContent
  }

  const handleLoadDraft = (draft: any) => {
    setTitle(draft.title)
    setContent(draft.content)
    setExcerpt(draft.excerpt)
    setCategory(draft.category)
    setTags(draft.tags)
    setPublished(draft.published)
    setPublishedAt(draft.publishedAt)
    setImageUrl(draft.imageUrl)
  }

  const handleScheduleChange = (scheduled: boolean, scheduledDate?: string, publishNow?: boolean) => {
    if (publishNow) {
      // Publikovat okamžitě
      setPublished(true)
      setPublishedAt(new Date().toISOString())
    } else if (scheduled && scheduledDate) {
      // Naplánovat publikování
      setPublished(false)
      setPublishedAt(scheduledDate)
    } else {
      // Uložit jako koncept
      setPublished(false)
      setPublishedAt(undefined)
    }
  }

  // Custom image handler - pouze URL, žádný drag & drop
  const imageHandler = () => {
    const url = prompt("Zadej URL obrázku:", "https://")

    if (url && url.startsWith("http")) {
      const alt = prompt("Alternativní text pro obrázek (pro SEO):", "") || "Obrázek"
      const imageHtml = `<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />`
      setContent((prevContent) => prevContent + `\n${imageHtml}\n`)
    } else if (url) {
      alert("Zadej prosím platnou URL začínající http:// nebo https://")
    }
  }

  // Helper function pro vložení textu na pozici kurzoru
  const insertAtCursor = (textToInsert: string) => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = content.substring(0, start) + textToInsert + content.substring(end)
      setContent(newValue)

      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length
        textarea.focus()
      }, 0)
    } else {
      // Fallback if textarea not found
      setContent((prev) => prev + textToInsert)
    }
  }

  if (isPreview) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Preview header */}
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

        {/* Preview content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="bg-white rounded-lg shadow-sm border p-8">
            {imageUrl && (
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                {category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
            {excerpt && <p className="text-xl text-gray-600 mb-6 font-medium">{excerpt}</p>}
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            {tags.trim() && (
              <div className="mt-8 pt-6 border-t">
                <div className="flex flex-wrap gap-2">
                  {tags.split(",").map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                      #{tag.trim()}
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
      {/* Editor header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">{article ? "Upravit článek" : "Nový článek"}</h1>

              {/* Auto-save status */}
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    autoSaveStatus === "saved"
                      ? "bg-green-500"
                      : autoSaveStatus === "saving"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />
                <span className="text-gray-600">
                  {autoSaveStatus === "saved" ? "Uloženo" : autoSaveStatus === "saving" ? "Ukládání..." : "Neuloženo"}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowDraftManager(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Koncepty
              </button>

              <button
                onClick={onCancel}
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
                disabled={isSaving || !title.trim() || !content.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4" />
                {isSaving ? "Ukládání..." : "Uložit"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Název článku *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Zadejte název článku..."
                required
              />
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">Obsah článku *</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Typ editoru:</span>
                  <button
                    type="button"
                    onClick={() => setEditorMode("visual")}
                    className={`px-3 py-1 text-sm rounded ${
                      editorMode === "visual" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    📝 Vizuální
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("simple")}
                    className={`px-3 py-1 text-sm rounded ${
                      editorMode === "simple" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    ✏️ Jednoduchý
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("html")}
                    className={`px-3 py-1 text-sm rounded ${
                      editorMode === "html" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    🔧 HTML
                  </button>
                </div>
              </div>

              <div className="min-h-[500px]">
                {editorMode === "visual" ? (
                  <div className="space-y-4">
                    <div className="border border-green-300 rounded-lg p-3 bg-green-50">
                      <div className="flex items-start space-x-2">
                        <span className="text-green-600 text-lg">✅</span>
                        <div>
                          <p className="text-sm text-green-800 font-medium">Tiptap Editor - Moderní WYSIWYG</p>
                          <p className="text-xs text-green-700 mt-1">
                            Plnohodnotný editor s intuitivním ovládáním. Ideální pro snadné psaní bez znalosti HTML.
                          </p>
                        </div>
                      </div>
                    </div>

                    <TiptapEditor
                      content={content || ""}
                      onChange={setContent}
                      placeholder="Začněte psát obsah článku..."
                    />
                  </div>
                ) : editorMode === "simple" ? (
                  // Jednoduchý editor pro Pavla
                  <div className="space-y-4">
                    <div className="border border-green-300 rounded-lg p-3 bg-green-50">
                      <div className="flex items-start space-x-2">
                        <span className="text-green-600 text-lg">✅</span>
                        <div>
                          <p className="text-sm text-green-800 font-medium">Jednoduchý editor</p>
                          <p className="text-xs text-green-700 mt-1">
                            Pište normálně jako v Word. Formátování se přidá automaticky.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Jednoduché formátovací tlačítka */}
                    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt("URL obrázku:", "https://")
                          if (url && url.startsWith("http")) {
                            setContent((prev) => prev + `\n\n[OBRÁZEK: ${url}]\n\n`)
                          }
                        }}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        📷 Přidat obrázek
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt("URL odkazu:", "https://")
                          const text = prompt("Text odkazu:", "")
                          if (url && text) {
                            setContent((prev) => prev + ` [ODKAZ: ${text} - ${url}] `)
                          }
                        }}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        🔗 Přidat odkaz
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Automatické formátování textu
                          const currentContent = content || ""
                          const paragraphs = currentContent.split("\n\n").filter((p) => p.trim())
                          const formatted = paragraphs
                            .map((paragraph) => {
                              let p = paragraph.trim()

                              // Převod speciálních značek
                              p = p.replace(
                                /\[OBRÁZEK: ([^\]]+)\]/g,
                                '<img src="$1" alt="Obrázek" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />',
                              )
                              p = p.replace(/\[ODKAZ: ([^-]+) - ([^\]]+)\]/g, '<a href="$2" target="_blank">$1</a>')

                              // Detekce nadpisů (řádky začínající velkým písmenem a kratší než 60 znaků)
                              if (p.length < 60 && p.match(/^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/)) {
                                return `<h2>${p}</h2>`
                              }

                              // Obyčejné odstavce
                              return `<p>${p}</p>`
                            })
                            .join("\n")

                          setContent(formatted)
                        }}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                      >
                        ✨ Převést na web
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Vymazat celý obsah?")) {
                            setContent("")
                          }
                        }}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        🗑️ Vymazat
                      </button>
                    </div>

                    <textarea
                      value={content || ""}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full min-h-[400px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base leading-relaxed"
                      placeholder="Začněte psát článek...

Pište normálně jako v textovém editoru. Například:

Nadpis článku

Toto je první odstavec článku. Pište normálně, formátování se přidá automaticky.

Toto je druhý odstavec. Pro přidání obrázku nebo odkazu použijte tlačítka výše.

Po napsání článku klikněte na 'Převést na web' a text se automaticky naformátuje pro zobrazení na webu."
                      style={{
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        lineHeight: "1.6",
                      }}
                    />

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="font-medium text-blue-800 mb-2">💡 Jak psát články:</p>
                      <ul className="text-blue-700 space-y-1 text-sm">
                        <li>• Pište normálně, každý odstavec oddělte prázdným řádkem</li>
                        <li>• Krátké řádky (do 60 znaků) se stanou nadpisy</li>
                        <li>• Pro obrázky a odkazy použijte tlačítka</li>
                        <li>• Na konci klikněte "Převést na web"</li>
                        <li>• Použijte "Náhled" pro kontrolu výsledku</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  // HTML editor pro pokročilé uživatele
                  <div className="space-y-4">
                    <div className="border border-amber-300 rounded-lg p-3 bg-amber-50">
                      <div className="flex items-start space-x-2">
                        <span className="text-amber-600 text-lg">⚠️</span>
                        <div>
                          <p className="text-sm text-amber-800 font-medium">HTML editor (pokročilý)</p>
                          <p className="text-xs text-amber-700 mt-1">
                            Vyžaduje znalost HTML. Pro začátečníky doporučujeme jednoduchý editor.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Formatting toolbar pro HTML editor */}
                    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <button
                        type="button"
                        onClick={() => imageHandler()}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        📷 Vložit obrázek
                      </button>
                      <button
                        type="button"
                        onClick={() => setContent((prev) => prev + "<p></p>")}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                      >
                        ¶ Odstavec
                      </button>
                      <button
                        type="button"
                        onClick={() => setContent((prev) => prev + "<h2></h2>")}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                      >
                        H2 Nadpis
                      </button>
                      <button
                        type="button"
                        onClick={() => setContent((prev) => prev + "<ul><li></li></ul>")}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                      >
                        • Seznam
                      </button>
                      <button
                        type="button"
                        onClick={() => setContent((prev) => prev + "<strong></strong>")}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                      >
                        <strong>B</strong> Tučně
                      </button>
                      <button
                        type="button"
                        onClick={() => setContent((prev) => prev + "<em></em>")}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                      >
                        <em>I</em> Kurzíva
                      </button>
                      <button
                        type="button"
                        onClick={() => setContent((prev) => prev + '<a href="" target="_blank"></a>')}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                      >
                        🔗 Odkaz
                      </button>
                    </div>

                    <textarea
                      value={content || ""}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full min-h-[400px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-y"
                      placeholder="HTML obsah článku..."
                      style={{
                        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                        lineHeight: "1.6",
                        tabSize: 2,
                      }}
                    />

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="font-medium text-blue-800 mb-2">🔧 Podporované HTML tagy:</p>
                      <div className="grid grid-cols-2 gap-1 text-blue-700 text-sm">
                        <span>&lt;p&gt; - odstavec</span>
                        <span>&lt;h1&gt;-&lt;h6&gt; - nadpisy</span>
                        <span>&lt;strong&gt; - tučně</span>
                        <span>&lt;em&gt; - kurzíva</span>
                        <span>&lt;ul&gt;&lt;li&gt; - seznam</span>
                        <span>&lt;a href=""&gt; - odkaz</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                Perex (automaticky se vygeneruje z obsahu, pokud nevyplníte)
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Krátký popis článku..."
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing */}
            <SchedulePublishing
              published={published}
              publishedAt={publishedAt}
              onScheduleChange={handleScheduleChange}
            />

            {/* SEO Preview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">SEO náhled</h3>
                <button
                  onClick={() => setShowSeoPreview(!showSeoPreview)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showSeoPreview ? "Skrýt" : "Zobrazit"}
                </button>
              </div>

              {showSeoPreview && <SeoPreview title={title} excerpt={excerpt || generateExcerpt(content)} />}
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiky</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Počet slov:</span>
                  <span className="font-medium text-gray-900">{wordCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Počet znaků:</span>
                  <span className="font-medium text-gray-900">{charCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Čas čtení:</span>
                  <span className="font-medium text-gray-900">{Math.ceil(wordCount / 200)} min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Auto-uložení:</span>
                  <span
                    className={`font-medium ${
                      autoSaveStatus === "saved"
                        ? "text-green-600"
                        : autoSaveStatus === "saving"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {autoSaveStatus === "saved" ? "Aktivní" : autoSaveStatus === "saving" ? "Ukládá..." : "Problém"}
                  </span>
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
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="praha4, doprava, životní prostředí"
              />
              <p className="text-sm text-gray-500 mt-1">Oddělte štítky čárkami</p>
            </div>

            {/* Featured image */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Obrázek článku
              </label>
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
              {imageUrl && (
                <div className="mt-2">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt="Náhled"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">URL adresa obrázku pro článek</p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showDraftManager && <DraftManager onLoadDraft={handleLoadDraft} onClose={() => setShowDraftManager(false)} />}
    </div>
  )
}
