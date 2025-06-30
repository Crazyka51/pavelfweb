'use client'

import { Calendar, Tag, ArrowLeft, Share2, Facebook, Twitter as X } from 'lucide-react'
import Link from 'next/link'

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
}

interface ArticleDetailPageProps {
  article: Article
}

export default function ArticleDetailPage({ article }: ArticleDetailPageProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Aktuality': 'bg-blue-100 text-blue-800',
      'Městská politika': 'bg-purple-100 text-purple-800',
      'Doprava': 'bg-green-100 text-green-800',
      'Životní prostředí': 'bg-emerald-100 text-emerald-800',
      'Kultura': 'bg-pink-100 text-pink-800',
      'Sport': 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `${article.title} - ${article.excerpt}`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: shareUrl
        })
      } catch {
        console.log('Sharing cancelled')
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(shareUrl)
      alert('Odkaz byl zkopírován do schránky')
    }
  }

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareOnX = () => {
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/aktuality"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Zpět na novinky
            </Link>
          </div>
          
          {/* Article meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(article.category)}`}>
              {article.category}
            </span>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDate(article.updatedAt)}</span>
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>
          
          {/* Excerpt */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {article.excerpt}
          </p>
          
          {/* Share buttons */}
          <div className="flex items-center gap-4 pb-8 border-b">
            <span className="text-sm text-gray-600">Sdílet:</span>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Sdílet
            </button>
            <button
              onClick={shareOnFacebook}
              className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </button>
            <button
              onClick={shareOnX}
              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
              X
            </button>
          </div>
        </div>
      </div>

      {/* Article content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-lg shadow-sm border p-8">
          {/* Featured image */}
          {article.imageUrl && (
            <div className="mb-8">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}
          
          {/* Article content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          
          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Štítky</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
        
        {/* Author info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <img 
              src="/pf.png" 
              alt="Pavel Fišer" 
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pavel Fišer</h3>
              <p className="text-gray-600">Radní pro dopravu a místní rozvoj - Praha 4</p>
              <p className="text-sm text-gray-500 mt-1">
                Věnuji se zlepšování dopravní infrastruktury a rozvoji městské části Praha 4.
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <Link 
            href="/aktuality"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Zobrazit všechny novinky
          </Link>
        </div>
      </div>
    </div>
  )
}
