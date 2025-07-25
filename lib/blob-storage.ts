import { put, list, del } from '@vercel/blob'

// Interface pro články
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

// Interface pro newsletter subscribers
interface NewsletterSubscriber {
  id: string
  email: string
  subscribedAt: string
  isActive: boolean
}

// Načtení článků z Blob storage
export async function getArticlesFromBlob(): Promise<Article[]> {
  try {
    const { blobs } = await list({ prefix: 'articles-data' })
    
    if (blobs.length === 0) {
      // Pokud neexistuje žádný blob, vraťme prázdné pole
      return []
    }
    
    // Najdeme nejnovější blob s články
    const latestBlob = blobs.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0]
    
    const response = await fetch(latestBlob.url)
    const articles: Article[] = await response.json()
    
    return articles
  } catch (error) {
    console.error('Chyba při načítání článků z Blob storage:', error)
    return []
  }
}

// Uložení článků do Blob storage
export async function saveArticlesToBlob(articles: Article[]): Promise<void> {
  try {
    const timestamp = new Date().toISOString()
    const filename = `articles-data-${timestamp}.json`
    
    const blob = await put(filename, JSON.stringify(articles, null, 2), {
      access: 'public',
    })
    
    console.log('Články uloženy do Blob storage:', blob.url)
  } catch (error) {
    console.error('Chyba při ukládání článků do Blob storage:', error)
    throw error
  }
}

// Načtení newsletter subscribers z Blob storage
export async function getNewsletterSubscribersFromBlob(): Promise<NewsletterSubscriber[]> {
  try {
    const { blobs } = await list({ prefix: 'newsletter-subscribers' })
    
    if (blobs.length === 0) {
      return []
    }
    
    const latestBlob = blobs.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0]
    
    const response = await fetch(latestBlob.url)
    const subscribers: NewsletterSubscriber[] = await response.json()
    
    return subscribers
  } catch (error) {
    console.error('Chyba při načítání subscribers z Blob storage:', error)
    return []
  }
}

// Uložení newsletter subscribers do Blob storage
export async function saveNewsletterSubscribersToBlob(subscribers: NewsletterSubscriber[]): Promise<void> {
  try {
    const timestamp = new Date().toISOString()
    const filename = `newsletter-subscribers-${timestamp}.json`
    
    const blob = await put(filename, JSON.stringify(subscribers, null, 2), {
      access: 'public',
    })
    
    console.log('Newsletter subscribers uloženi do Blob storage:', blob.url)
  } catch (error) {
    console.error('Chyba při ukládání subscribers do Blob storage:', error)
    throw error
  }
}

// Pomocná funkce pro clean-up starých blobů (volitelné)
export async function cleanupOldBlobs(prefix: string, keepLatest: number = 5): Promise<void> {
  try {
    const { blobs } = await list({ prefix })
    
    if (blobs.length <= keepLatest) {
      return
    }
    
    // Seřadíme podle data a smažeme staré
    const sortedBlobs = blobs.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )
    
    const blobsToDelete = sortedBlobs.slice(keepLatest)
    
    for (const blob of blobsToDelete) {
      await del(blob.url)
      console.log('Smazán starý blob:', blob.pathname)
    }
  } catch (error) {
    console.error('Chyba při čištění starých blobů:', error)
  }
}
