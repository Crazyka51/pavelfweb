import { neon } from "@neondatabase/serverless"
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Create Neon SQL client
const client = neon(process.env.DATABASE_URL!)
export const db: NeonHttpDatabase<typeof schema> = drizzle(client, { schema })

// Database connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await db`SELECT 1 as health_check`
    return result.length > 0
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

// Initialize database tables (run this once during deployment)
export async function initializeDatabase() {
  try {
    // Enable UUID extension
    await db`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    console.log("Database initialized successfully")
    return true
  } catch (error) {
    console.error("Database initialization failed:", error)
    return false
  }
}

// Types for database entities
export interface Article {
  id: string
  title: string
  content: string
  excerpt?: string | null
  category: string
  tags: string[]
  published: boolean
  image_url?: string | null
  published_at?: Date | null
  created_at: Date
  updated_at: Date
  created_by: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  is_active: boolean
  source: string
  unsubscribe_token?: string
  subscribed_at: Date
  unsubscribed_at?: Date
}

export interface NewsletterCampaign {
  id: string
  name: string
  subject: string
  content: string
  html_content: string
  text_content?: string
  template_id?: string
  status: "draft" | "scheduled" | "sending" | "sent" | "failed"
  scheduled_at?: Date
  sent_at?: Date
  recipient_count: number
  open_count: number
  click_count: number
  bounce_count: number
  unsubscribe_count: number
  created_at: Date
  updated_at: Date
  created_by: string
  tags: string[]
  segment_id?: string
}

export interface NewsletterTemplate {
  id: string
  name: string
  subject: string
  content: string
  html_content: string
  is_active: boolean
  created_at: Date
  updated_at: Date
  created_by: string
}

export interface AdminUser {
  id: string
  username: string
  password_hash: string
  email?: string
  role: string
  is_active: boolean
  last_login?: Date
  created_at: Date
  updated_at: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  color?: string | null
  icon?: string | null
  parent_id?: string | null
  display_order: number // Renamed from 'order' to avoid SQL keyword conflict
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface CMSSettings {
  id: string
  site_name: string
  site_description: string
  admin_email: string
  language: string
  timezone: string
  default_category_id?: string | null // Changed to ID
  auto_save_interval: number
  allow_image_upload: boolean
  max_file_size: number
  require_approval: boolean
  default_visibility: "public" | "draft"
  enable_scheduling: boolean
  email_notifications: boolean
  new_article_notification: boolean
  primary_color: string
  dark_mode: boolean
  session_timeout: number
  max_login_attempts: number
  updated_at: Date
}

export interface AnalyticsEvent {
  id: string
  type: "pageview" | "click" | "form_submit" | "download"
  path: string
  title?: string | null
  user_id?: string | null
  session_id: string
  user_agent: string
  referrer?: string | null
  timestamp: Date
  metadata?: Record<string, any> | null
}
