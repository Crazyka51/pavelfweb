# Integrace CMS s hlavním webem

Tento dokument popisuje, jak integrovat články z CMS systému do hlavního webu Pavel Fišera.

## 📡 API Endpoint

CMS poskytuje veřejné API pro čtení publikovaných článků:

\`\`\`
GET http://localhost:3001/api/public/articles
\`\`\`

### Parametry

- `category` - filtrování podle kategorie (volitelné)
- `limit` - omezení počtu článků (volitelné)
- `published` - pouze publikované články (výchozí: true)

### Příklady použití

\`\`\`javascript
// Načtení posledních 3 článků
fetch('http://localhost:3001/api/public/articles?limit=3')
  .then(res => res.json())
  .then(data => console.log(data.articles))

// Načtení článků z kategorie "Aktuality"
fetch('http://localhost:3001/api/public/articles?category=Aktuality&limit=5')
  .then(res => res.json())
  .then(data => console.log(data.articles))
\`\`\`

### Struktura odpovědi

\`\`\`json
{
  "articles": [
    {
      "id": "1640995200000abc123",
      "title": "Název článku",
      "content": "<p>HTML obsah článku...</p>",
      "excerpt": "Krátký popis článku",
      "category": "Aktuality",
      "tags": ["praha4", "doprava"],
      "published": true,
      "createdAt": "2025-01-26T10:00:00.000Z",
      "updatedAt": "2025-01-26T12:30:00.000Z",
      "imageUrl": "https://example.com/image.jpg"
    }
  ],
  "total": 1,
  "metadata": {
    "generated": "2025-01-26T14:15:30.000Z",
    "filters": {
      "category": "Aktuality",
      "limit": 5,
      "published": true
    }
  }
}
\`\`\`

## 🔗 Integrace do hlavního webu

### 1. Vytvoření React komponenty

\`\`\`tsx
// app/components/LatestNews.tsx
'use client'

import { useState, useEffect } from 'react'
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

export default function LatestNews() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3001/api/public/articles?limit=3')
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || [])
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading articles:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Nejnovější články</h2>
      
      {articles.length === 0 ? (
        <p className="text-gray-600">Zatím nejsou žádné články.</p>
      ) : (
        <div className="space-y-4">
          {articles.map(article => (
            <article key={article.id} className="border-b border-gray-200 pb-4">
              <div className="flex items-start gap-4">
                {article.imageUrl && (
                  <img 
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                      {article.category}
                    </span>
                    <time className="text-xs text-gray-500">
                      {new Date(article.updatedAt).toLocaleDateString('cs-CZ')}
                    </time>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {article.excerpt}
                  </p>
                  
                  <Link 
                    href={`/clanky/${article.id}`}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block"
                  >
                    Číst více →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      
      <Link 
        href="/clanky"
        className="inline-block bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
      >
        Všechny články
      </Link>
    </div>
  )
}
\`\`\`

### 2. Stránka pro detail článku

\`\`\`tsx
// app/clanky/[id]/page.tsx
import { notFound } from 'next/navigation'

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

async function getArticle(id: string): Promise<Article | null> {
  try {
    const res = await fetch(`http://localhost:3001/api/public/articles`, {
      cache: 'no-store' // Always get fresh data
    })
    
    if (!res.ok) return null
    
    const data = await res.json()
    return data.articles.find((article: Article) => article.id === id) || null
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id)
  
  if (!article) {
    notFound()
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article>
        {article.imageUrl && (
          <img 
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}
        
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
            {article.category}
          </span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>
        
        <div className="text-gray-600 mb-6">
          <time>
            {new Date(article.updatedAt).toLocaleDateString('cs-CZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        </div>
        
        {article.excerpt && (
          <div className="text-xl text-gray-600 mb-6 font-medium border-l-4 border-primary-500 pl-6">
            {article.excerpt}
          </div>
        )}
        
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        
        {article.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
\`\`\`

### 3. Stránka se všemi články

\`\`\`tsx
// app/clanky/page.tsx
'use client'

import { useState, useEffect } from 'react'
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

const categories = ['Všechny', 'Aktuality', 'Městská politika', 'Doprava', 'Životní prostředí', 'Kultura', 'Sport']

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Všechny')

  useEffect(() => {
    const categoryParam = selectedCategory === 'Všechny' ? '' : `?category=${selectedCategory}`
    
    fetch(`http://localhost:3001/api/public/articles${categoryParam}`)
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || [])
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading articles:', error)
        setLoading(false)
      })
  }, [selectedCategory])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Všechny články</h1>
      
      {/* Category filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Articles grid */}
      {articles.length === 0 ? (
        <p className="text-gray-600 text-center py-8">
          {selectedCategory === 'Všechny' ? 'Zatím nejsou žádné články.' : `Žádné články v kategorii "${selectedCategory}".`}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map(article => (
            <Link key={article.id} href={`/clanky/${article.id}`}>
              <article className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
                {article.imageUrl && (
                  <img 
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                      {article.category}
                    </span>
                    <time className="text-xs text-gray-500">
                      {new Date(article.updatedAt).toLocaleDateString('cs-CZ')}
                    </time>
                  </div>
                  
                  <h2 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h2>
                  
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
\`\`\`

## 🚀 Produkční nasazení

Pro produkční nasazení změňte URL v fetch() volání:

\`\`\`javascript
// Místo localhost použijte produkční URL CMS
const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.pavelfiser.cz'

fetch(`${CMS_API_URL}/api/public/articles`)
\`\`\`

## 📝 Poznámky

- CMS běží na portu 3001, hlavní web na 3000
- Pro produkci nasaďte CMS na samostatnou subdoménu (např. cms.pavelfiser.cz)
- API je veřejné a nevyžaduje autentizaci pro čtení publikovaných článků
- Použijte CORS middleware pro povolení cross-origin requestů v produkci

---

**Integrace dokončena!** Nyní můžete zobrazovat články z CMS na hlavním webu.
