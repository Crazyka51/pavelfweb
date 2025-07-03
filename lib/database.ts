import { neon } from '@neondatabase/serverless';

if (!process.env.STORAGE_URL) {
  throw new Error('STORAGE_URL environment variable is not set');
}

// Create Neon SQL client
export const sql = neon(process.env.STORAGE_URL);

// Database connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT 1 as health_check`;
    return result.length > 0;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Initialize database tables (run this once during deployment)
export async function initializeDatabase() {
  try {
    // Enable UUID extension
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}

// Types for database entities
export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  category: string;
  tags: string[];
  published: boolean;
  image_url?: string | null;
  published_at?: Date | null;
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  source: string;
  unsubscribe_token?: string;
  subscribed_at: Date;
  unsubscribed_at?: Date;
}

export interface NewsletterCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  html_content: string;
  text_content?: string;
  template_id?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduled_at?: Date;
  sent_at?: Date;
  recipient_count: number;
  open_count: number;
  click_count: number;
  bounce_count: number;
  unsubscribe_count: number;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  tags: string[];
  segment_id?: string;
}

export interface NewsletterTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  html_content: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  email?: string;
  role: string;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}
