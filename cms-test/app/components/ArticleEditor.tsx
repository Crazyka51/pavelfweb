'use client'

import { useState, useEffect } from 'react'
import { Save, X, Upload, Eye, FileText, Calendar } from 'lucide-react'
import dynamic from 'next/dynamic'
import SeoPreview from './SeoPreview'
import SchedulePublishing from './SchedulePublishing'
import DraftManager from './DraftManager'

// Import React Quill CSS
import 'react-quill/dist/quill.snow.css'

// Dynamicky načíst ReactQuill pro client-side rendering
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-gray-500">Načítání editoru...</div>
  </div>
})

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
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [published, setPublished] = useState(false)
  const [publishedAt, setPublishedAt] = useState<string | undefined>()
  const [imageUrl, setImageUrl] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [showSeoPreview, setShowSeoPreview] = useState(false)
  const [showDraftManager, setShowDraftManager] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (article) {
      setTitle(article.title)
      setContent(article.content)
      setExcerpt(article.excerpt)
      setCategory(article.category)
      setTags(article.tags.join(', '))
      setPublished(article.published)
      setPublishedAt(article.publishedAt)
      setImageUrl(article.imageUrl || '')
    } else {
      // Reset form for new article
      setTitle('')
      setContent('')
      setExcerpt('')
      setCategory(categories[0] || '')
      setTags('')
      setPublished(false)
      setPublishedAt(undefined)
      setImageUrl('')
    }
  }, [article, categories])

  // Auto-save effect
  useEffect(() => {
    if (!title && !content) return // Don't auto-save empty articles
    
    setAutoSaveStatus('unsaved')
    
    const autoSaveTimer = setTimeout(() => {
      autoSaveArticle()
    }, 3000) // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer)
  }, [title, content, excerpt, category, tags, published, publishedAt, imageUrl])

  // Word count effect
  useEffect(() => {
    const textContent = content.replace(/<[^>]*>/g, '') // Remove HTML tags
    const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0
    const chars = textContent.length
    
    setWordCount(words)
    setCharCount(chars)
  }, [content])

  const autoSaveArticle = async () => {
    if (!title.trim() && !content.trim()) return
    
    setAutoSaveStatus('saving')
    
    try {
      // Save to localStorage as backup
      const draftData = {
        title, content, excerpt, category, tags, published, publishedAt, imageUrl,
        timestamp: new Date().toISOString(),
        articleId: article?.id || 'new'
      }
      localStorage.setItem('article_draft', JSON.stringify(draftData))
      
      setAutoSaveStatus('saved')
    } catch (error) {
      console.error('Auto-save failed:', error)
      setAutoSaveStatus('unsaved')
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Název a obsah jsou povinné!')
      return
    }

    setIsSaving(true)
    
    const articleData = {
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || generateExcerpt(content),
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      published,
      publishedAt,
      imageUrl: imageUrl.trim() || undefined
    }

    await onSave(articleData)
    setIsSaving(false)
  }

  const generateExcerpt = (content: string) => {
    // Odstraň HTML tagy a vezmi prvních 150 znaků
    const textContent = content.replace(/<[^>]*>/g, '')
    return textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent
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

  const handleScheduleChange = (scheduled: boolean, scheduledDate?: string) => {
    if (scheduled && scheduledDate) {
      setPublished(false)
      setPublishedAt(scheduledDate)
    } else {
      setPublishedAt(undefined)
    }
  }

  // Custom image handler - pouze URL, žádný drag & drop
  const imageHandler = () => {
    const url = prompt('Zadej URL obrázku:', 'https://')
    
    if (url && url.startsWith('http')) {
      // Získej quill instanci pomocí React ref
      const quillContainer = document.querySelector('.ql-container')
      if (quillContainer) {
        const quill = (quillContainer as any).__quill
        if (quill) {
          const range = quill.getSelection(true)
          const index = range ? range.index : quill.getLength()
          quill.insertEmbed(index, 'image', url)
          quill.setSelection(index + 1)
        }
      }
    } else if (url) {
      alert('Zadej prosím platnou URL začínající http:// nebo https://')
    }
  }

  const quillModules = {
    toolbar: {
      container: [
        // První řádek - Nadpisy a základní formátování
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        
        // Druhý řádek - Barvy a zarovnání
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        
        // Třetí řádek - Seznamy a speciální prvky
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        
        // Čtvrtý řádek - Média a nástroje
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        'image': imageHandler // Custom handler pro obrázky
      }
    },
    
    // Zakázání drag & drop obrázků a lepší clipboard handling
    clipboard: {
      matchVisual: false,
      matchers: [
        // Blokování automatického vkládání obrázků z clipboardu
        ['img', function() { return null; }]
      ]
    }
  }

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 
    'color', 'background',
    'script', 'align', 'indent', 'direction',
    'list', 'bullet', 'blockquote', 'code-block',
    'link', 'image'
  ]

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
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? 'Ukládání...' : 'Uložit'}
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
                src={imageUrl} 
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
            {excerpt && (
              <p className="text-xl text-gray-600 mb-6 font-medium">{excerpt}</p>
            )}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            {tags.trim() && (
              <div className="mt-8 pt-6 border-t">
                <div className="flex flex-wrap gap-2">
                  {tags.split(',').map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                    >
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
              <h1 className="text-xl font-semibold text-gray-900">
                {article ? 'Upravit článek' : 'Nový článek'}
              </h1>
              
              {/* Auto-save status */}
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  autoSaveStatus === 'saved' ? 'bg-green-500' : 
                  autoSaveStatus === 'saving' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-gray-600">
                  {autoSaveStatus === 'saved' ? 'Uloženo' :
                   autoSaveStatus === 'saving' ? 'Ukládání...' : 'Neuloženo'}
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
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Ukládání...' : 'Uložit'}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Obsah článku *
              </label>
              <div className="min-h-[500px]">
                {isMounted ? (
                  <ReactQuill
                    value={content}
                    onChange={setContent}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Začněte psát obsah článku..."
                    theme="snow"
                  />
                ) : (
                  <div className="h-48 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                    <div className="text-gray-500">Načítání editoru...</div>
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
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {showSeoPreview ? 'Skrýt' : 'Zobrazit'}
                </button>
              </div>
              
              {showSeoPreview && (
                <SeoPreview
                  title={title}
                  excerpt={excerpt || generateExcerpt(content)}
                />
              )}
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiky</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Počet slov:</span>
                  <span className="font-medium">{wordCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Počet znaků:</span>
                  <span className="font-medium">{charCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Čas čtení:</span>
                  <span className="font-medium">{Math.ceil(wordCount / 200)} min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Auto-uložení:</span>
                  <span className={`font-medium ${
                    autoSaveStatus === 'saved' ? 'text-green-600' : 
                    autoSaveStatus === 'saving' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {autoSaveStatus === 'saved' ? 'Aktivní' :
                     autoSaveStatus === 'saving' ? 'Ukládá...' : 'Problém'}
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
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
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
              <p className="text-sm text-gray-500 mt-1">
                Oddělte štítky čárkami
              </p>
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
                    src={imageUrl} 
                    alt="Náhled" 
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">
                URL adresa obrázku pro článek
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showDraftManager && (
        <DraftManager
          onLoadDraft={handleLoadDraft}
          onClose={() => setShowDraftManager(false)}
        />
      )}
    </div>
  )
}
