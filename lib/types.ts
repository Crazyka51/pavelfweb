// General types for the application

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  category_id: string
  published_at: Date | null
  created_at: Date
  updated_at: Date
  author_id: string
  status: "draft" | "published" | "archived"
  seo_title?: string
  seo_description?: string
  featured_image_url?: string
  tags?: string[]
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  created_at: Date
  updated_at: Date
}

export interface NewsletterSubscriber {
  id: string
  email: string
  subscribed_at: Date
  is_active: boolean
  source?: string
}

export interface NewsletterCampaign {
  id: string
  subject: string
  html_content: string
  plain_text_content: string
  scheduled_at: Date | null
  sent_at: Date | null
  status: "draft" | "scheduled" | "sent" | "failed"
  created_at: Date
  updated_at: Date
  template_id?: string
}

export interface NewsletterTemplate {
  id: string
  name: string
  html_content: string
  plain_text_content: string
  created_at: Date
  updated_at: Date
}

export interface User {
  id: string
  username: string
  email: string
  role: "admin" | "editor" | "viewer"
  created_at: Date
  updated_at: Date
}

export interface Settings {
  id: string
  key: string
  value: string
  description?: string
  created_at: Date
  updated_at: Date
}

export interface AnalyticsData {
  date: string
  page_views: number
  unique_visitors: number
  bounce_rate: number
  avg_session_duration: number
}

export interface FacebookPost {
  id: string
  message: string
  created_time: string
  full_picture?: string
  permalink_url?: string
}

export interface ContactFormSubmission {
  id: string
  name: string
  email: string
  subject: string
  message: string
  submitted_at: Date
  is_read: boolean
}

export interface Testimonial {
  id: string
  author: string
  text: string
  rating: number // 1-5
  image_url?: string
  created_at: Date
  updated_at: Date
  is_featured: boolean
}

export interface TimelineEvent {
  id: string
  year: number
  title: string
  description: string
  image_url?: string
}
