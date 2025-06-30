import fs from 'fs/promises'
import path from 'path'
import { saveArticlesToBlob, saveNewsletterSubscribersToBlob } from './blob-storage'

// Migrace článků z lokálního JSON do Blob storage
export async function migrateArticlesToBlob(): Promise<void> {
  try {
    const articlesPath = path.join(process.cwd(), 'data', 'articles.json')
    
    // Zkusíme načíst lokální soubor
    try {
      const articlesData = await fs.readFile(articlesPath, 'utf-8')
      const articles = JSON.parse(articlesData)
      
      console.log(`Migrace ${articles.length} článků do Blob storage...`)
      await saveArticlesToBlob(articles)
      console.log('Migrace článků dokončena!')
      
    } catch {
      console.log('Lokální soubor articles.json neexistuje, vytváříme prázdný blob...')
      await saveArticlesToBlob([])
    }
    
  } catch (error) {
    console.error('Chyba při migraci článků:', error)
    throw error
  }
}

// Migrace newsletter subscribers z lokálního JSON do Blob storage
export async function migrateNewsletterSubscribersToBlob(): Promise<void> {
  try {
    const subscribersPath = path.join(process.cwd(), 'data', 'newsletter-subscribers.json')
    
    try {
      const subscribersData = await fs.readFile(subscribersPath, 'utf-8')
      const subscribers = JSON.parse(subscribersData)
      
      console.log(`Migrace ${subscribers.length} newsletter subscribers do Blob storage...`)
      await saveNewsletterSubscribersToBlob(subscribers)
      console.log('Migrace newsletter subscribers dokončena!')
      
    } catch {
      console.log('Lokální soubor newsletter-subscribers.json neexistuje, vytváříme prázdný blob...')
      await saveNewsletterSubscribersToBlob([])
    }
    
  } catch (error) {
    console.error('Chyba při migraci newsletter subscribers:', error)
    throw error
  }
}

// Kompletní migrace všech dat
export async function migrateAllDataToBlob(): Promise<void> {
  console.log('🚀 Začíná migrace dat do Vercel Blob storage...')
  
  try {
    await migrateArticlesToBlob()
    await migrateNewsletterSubscribersToBlob()
    
    console.log('✅ Migrace všech dat dokončena úspěšně!')
  } catch (error) {
    console.error('❌ Chyba při migraci dat:', error)
    throw error
  }
}
