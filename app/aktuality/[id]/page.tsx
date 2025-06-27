import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleDetailPage from './ArticleDetailPage'

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
    // V produkci by toto bylo načtení z databáze nebo API
    // Pro test použijeme mock data
    const mockArticles: Article[] = [
      {
        id: '1',
        title: 'Nová cyklostezka v Praze 4',
        content: `
          <h2>Nový úsek cyklostezky je dokončen</h2>
          <p>S radostí vám oznamujeme dokončení dalšího úseku cyklostezky v Praze 4, který významně zlepší podmínky pro cyklisty v naší městské části.</p>
          
          <h3>Detaily projektu</h3>
          <p>Nový úsek měří celkem 2,5 kilometru a propojuje centrum Prahy 4 s okrajovými částmi. Cyklostezka je vybavena moderním osvětlením, odpočívadly a informačními tabulemi.</p>
          
          <h3>Bezpečnost především</h3>
          <p>Při návrhu jsme kladli důraz především na bezpečnost cyklistů. Stezka je oddělena od automobilové dopravy a na křižovatkách jsou instalovány bezpečnostní prvky.</p>
          
          <h3>Investice do budoucnosti</h3>
          <p>Tento projekt představuje investici ve výši 15 milionů korun a je součástí dlouhodobé strategie rozvoje cyklistické infrastruktury v Praze 4.</p>
        `,
        excerpt: 'Dokončili jsme další úsek cyklostezky, který propojuje centrum s okrajovými částmi městské části.',
        category: 'Doprava',
        tags: ['doprava', 'cyklostezka', 'investice'],
        published: true,
        createdAt: '2025-06-20T10:00:00Z',
        updatedAt: '2025-06-20T10:00:00Z',
        imageUrl: '/placeholder.jpg'
      },
      {
        id: '2',
        title: 'Revitalizace parku Kamýk',
        content: `
          <h2>Park Kamýk dostává novou podobu</h2>
          <p>Zahájili jsme rozsáhlou revitalizaci parku Kamýk, která přinese nové prvky pro odpočinek, rekreaci i sport pro všechny věkové kategorie.</p>
          
          <h3>Co nového park nabídne</h3>
          <ul>
            <li>Nové dětské hřiště s moderními prvky</li>
            <li>Fitness zónu pod širým nebem</li>
            <li>Odpočinkové zóny s novým mobiliářem</li>
            <li>Rekonstruované chodníky a cesty</li>
          </ul>
          
          <h3>Harmonogram prací</h3>
          <p>Revitalizace bude probíhat ve třech etapách během letních měsíců. První etapa začala v červnu a zahrnuje výstavbu nového dětského hřiště.</p>
          
          <h3>Zapojení veřejnosti</h3>
          <p>Při plánování jsme aktivně zapojili místní obyvatele prostřednictvím veřejných setkání a online průzkumů. Jejich podněty byly zapracovány do finálního návrhu.</p>
        `,
        excerpt: 'Zahájili jsme rozsáhlou revitalizaci parku Kamýk, která přinese nové prvky pro odpočinek i sport.',
        category: 'Životní prostředí',
        tags: ['park', 'revitalizace', 'životní prostředí'],
        published: true,
        createdAt: '2025-06-18T14:30:00Z',
        updatedAt: '2025-06-18T14:30:00Z',
        imageUrl: '/placeholder.jpg'
      }
    ]

    return mockArticles.find(article => article.id === id) || null
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await getArticle(params.id)
  
  if (!article) {
    return {
      title: 'Článek nenalezen | Pavel Fišer - Praha 4'
    }
  }

  return {
    title: `${article.title} | Pavel Fišer - Praha 4`,
    description: article.excerpt,
    keywords: `Praha 4, ${article.category}, ${article.tags.join(', ')}, Pavel Fišer`,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
      authors: ['Pavel Fišer'],
      tags: article.tags,
      images: article.imageUrl ? [{ url: article.imageUrl, alt: article.title }] : []
    }
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id)
  
  if (!article) {
    notFound()
  }

  return <ArticleDetailPage article={article} />
}
