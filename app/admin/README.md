# Pavel Fišer CMS - Test Version

Jednoduché a bezpečné Content Management System pro správu novinek a článků Pavla Fišera.

## Funkce

✅ **Autentizace a bezpečnost**
- Přihlášení pomocí uživatelského jména a hesla
- JWT tokeny pro zabezpečené relace
- Automatické odhlášení po vypršení tokenu

✅ **Správa článků**
- Vytváření, úprava a mazání článků
- Rich text editor s formátováním
- Náhled článků před publikací
- Kategorizace a štítkování
- Publikování/koncepty

✅ **Uživatelské rozhraní**
- Responzivní design pro všechna zařízení
- Intuitivní ovládání
- Vyhledávání a filtrování článků
- Reálný náhled článků

✅ **API pro web**
- Veřejné API pro načítání publikovaných článků
- Podpora pro filtrování podle kategorií
- Pagination pro lepší výkon

## Instalace a spuštění

### 1. Nainstalujte závislosti
\`\`\`bash
npm install
# nebo
pnpm install
\`\`\`

### 2. Nastavte environment variables
Zkopírujte `.env.example` do `.env.local` a upravte hodnoty:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Upravte `.env.local`:
\`\`\`
ADMIN_USERNAME=pavel
ADMIN_PASSWORD=your_secure_password_here
JWT_SECRET=your_super_secret_jwt_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3001
\`\`\`

⚠️ **DŮLEŽITÉ**: V produkci změňte výchozí heslo a JWT secret!

### 3. Spusťte development server
\`\`\`bash
npm run dev
# nebo
pnpm dev
\`\`\`

Aplikace bude dostupná na: http://localhost:3001

## Přihlašovací údaje (test)

- **Uživatelské jméno**: pavel
- **Heslo**: test123

## Struktura projektu

\`\`\`
cms-test/
├── app/                      # Next.js app directory
│   ├── components/           # React komponenty
│   │   ├── Dashboard.tsx     # Hlavní dashboard
│   │   ├── LoginForm.tsx     # Přihlašovací formulář
│   │   ├── ArticleEditor.tsx # Editor článků
│   │   └── ArticlePreview.tsx # Náhled článků
│   ├── api/                  # API routes
│   │   ├── auth/             # Autentizace
│   │   ├── articles/         # Správa článků (admin)
│   │   └── public/           # Veřejné API
│   ├── globals.css           # Globální styly
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Hlavní stránka
├── data/                     # JSON databáze (auto-vytvoří se)
│   └── articles.json         # Články
├── public/                   # Statické soubory
├── .env.example              # Příklad environment variables
└── README.md                 # Tato dokumentace
\`\`\`

## API Endpoints

### Admin API (vyžaduje autentizace)

#### Autentizace
- `POST /api/auth/login` - Přihlášení
- `GET /api/auth/verify` - Ověření tokenu

#### Správa článků
- `GET /api/articles` - Seznam všech článků
- `POST /api/articles` - Vytvoření článku
- `GET /api/articles/[id]` - Detail článku
- `PUT /api/articles/[id]` - Aktualizace článku
- `DELETE /api/articles/[id]` - Smazání článku

### Veřejné API (bez autentizace)

#### Články pro web
- `GET /api/public/articles` - Seznam publikovaných článků
  - Query parametry: `category`, `limit`, `offset`
- `GET /api/public/articles/[id]` - Detail publikovaného článku

## Použití na hlavním webu

### Načítání článků do Next.js komponenty

\`\`\`javascript
// components/News.tsx
import { useState, useEffect } from 'react'

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
  imageUrl?: string
}

export default function News() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArticles() {
      try {
        const response = await fetch('http://localhost:3001/api/public/articles?limit=5')
        const data = await response.json()
        setArticles(data.articles)
      } catch (error) {
        console.error('Error loading articles:', error)
      } finally {
        setLoading(false)
      }
    }

    loadArticles()
  }, [])

  if (loading) return <div>Načítání novinek...</div>

  return (
    <div className="news-section">
      <h2>Nejnovější články</h2>
      {articles.map(article => (
        <article key={article.id} className="news-item">
          <h3>{article.title}</h3>
          <p>{article.excerpt}</p>
          <span className="category">{article.category}</span>
          <time>{new Date(article.updatedAt).toLocaleDateString('cs-CZ')}</time>
        </article>
      ))}
    </div>
  )
}
\`\`\`

### Server-side rendering (SSG/SSR)

\`\`\`javascript
// pages/news/index.tsx nebo app/news/page.tsx
export async function getStaticProps() {
  try {
    const response = await fetch('http://localhost:3001/api/public/articles')
    const data = await response.json()
    
    return {
      props: {
        articles: data.articles
      },
      revalidate: 300 // Obnovit každých 5 minut
    }
  } catch (error) {
    return {
      props: {
        articles: []
      }
    }
  }
}
\`\`\`

## Kategorie článků

Výchozí kategorie:
- Aktuality
- Městská politika
- Doprava
- Životní prostředí
- Kultura
- Sport

Kategorie lze upravit v souboru `app/components/Dashboard.tsx`.

## Bezpečnost

- JWT tokeny s vypršením (24 hodin)
- Autentizace všech admin endpoints
- Validace vstupních dat
- Oddělené veřejné a admin API
- CORS nastavení

## Databáze

Aplikace používá JSON soubory pro jednoduchost:
- `data/articles.json` - články
- Automatické zálohování při každé změně
- Snadno migrovatelné do databáze

## Produkční nasazení

### 1. Environment variables
\`\`\`
ADMIN_USERNAME=pavel
ADMIN_PASSWORD=very_secure_password_here
JWT_SECRET=super_secret_random_string_at_least_32_chars
NEXT_PUBLIC_APP_URL=https://your-cms-domain.com
\`\`\`

### 2. Doporučení
- Nastavte silné heslo
- Použijte HTTPS
- Pravidelně zálohujte data
- Monitorujte přístup

### 3. Možná rozšíření
- Migrace na databázi (PostgreSQL, MongoDB)
- Upload obrázků
- Více uživatelů
- Email notifikace
- Pokročilé SEO
- Výkonové optimalizace

## Podpora

Toto je test verze CMS systému vytvořená pro Pavla Fišera. 
Pro podporu nebo přizpůsobení kontaktujte vývojáře.

## Licence

Soukromé použití - Pavel Fišer
