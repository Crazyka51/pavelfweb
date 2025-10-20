import fs from 'fs/promises';
import path from 'path';
import { saveArticlesToBlob, saveNewsletterSubscribersToBlob } from './blob-storage';

// Migrace článků z lokálního JSON do Blob storage
export async function migrateArticlesToBlob(): Promise<void> {
  try {
    const articlesPath = path.join(process.cwd(), 'data', 'articles.json');
    
    // Zkusíme načíst lokální soubor
    try {
      const articlesData = await fs.readFile(articlesPath, 'utf-8');
      const articles = JSON.parse(articlesData);
      
      await saveArticlesToBlob(articles);
      
    } catch {
      await saveArticlesToBlob([]);
    }
    
  } catch (error) {
    throw error;
  }
}

// Migrace newsletter subscribers z lokálního JSON do Blob storage
export async function migrateNewsletterSubscribersToBlob(): Promise<void> {
  try {
    const subscribersPath = path.join(process.cwd(), 'data', 'newsletter-subscribers.json');
    
    try {
      const subscribersData = await fs.readFile(subscribersPath, 'utf-8');
      const subscribers = JSON.parse(subscribersData);
      
      await saveNewsletterSubscribersToBlob(subscribers);
      
    } catch {
      await saveNewsletterSubscribersToBlob([]);
    }
    
  } catch (error) {
    throw error;
  }
}

// Kompletní migrace všech dat
export async function migrateAllDataToBlob(): Promise<void> {
  
  try {
    await migrateArticlesToBlob();
    await migrateNewsletterSubscribersToBlob();
    
  } catch (error) {
    throw error;
  }
}
