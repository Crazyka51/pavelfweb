// Core types for the application
export interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  author: string
  category_id: string
  category_name?: string
  featured_image?: string
  meta_title?: string
  meta_description?: string
  tags: string[]
  status: "draft" | "published" | "archived"
  published_at?: string
  created_at: string
  updated_at: string
  view_count: number
  reading_time: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  created_at: string
  updated_at: string
  article_count?: number
}

export interface NewsletterSubscriber {
  id: string
  email: string
  name?: string
  status: "active" | "unsubscribed" | "bounced"
  subscribed_at: string
  unsubscribed_at?: string
  tags: string[]
  metadata?: Record<string, any>
}

export interface NewsletterCampaign {
  id: string
  name: string
  subject: string
  content: string
  template_id?: string
  status: "draft" | "scheduled" | "sending" | "sent" | "failed"
  scheduled_at?: string
  sent_at?: string
  created_at: string
  updated_at: string
  recipient_count: number
  open_count: number
  click_count: number
  bounce_count: number
}

export interface NewsletterTemplate {
  id: string
  name: string
  content: string
  variables: string[]
  created_at: string
  updated_at: string
}

export interface SiteSettings {
  id: string
  key: string
  value: string
  type: "string" | "number" | "boolean" | "json"
  description?: string
  updated_at: string
}

export interface AnalyticsData {
  page_views: number
  unique_visitors: number
  bounce_rate: number
  avg_session_duration: number
  top_pages: Array<{
    path: string
    views: number
    title?: string
  }>
  traffic_sources: Array<{
    source: string
    visitors: number
    percentage: number
  }>
  device_breakdown: {
    desktop: number
    mobile: number
    tablet: number
  }
  date_range: {
    start: string
    end: string
  }
}

export interface FacebookPost {
  id: string
  message: string
  link?: string
  picture?: string
  created_time: string
  likes: number
  comments: number
  shares: number
}

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  phone?: string
  company?: string
}

export interface NewsletterFormData {
  email: string
  name?: string
  tags?: string[]
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Form validation types
export interface ValidationError {
  field: string
  message: string
}

export interface FormState {
  isSubmitting: boolean
  errors: ValidationError[]
  success: boolean
  message?: string
}

// Admin types
export interface AdminStats {
  articles: {
    total: number
    published: number
    drafts: number
    recent: Article[]
  }
  newsletter: {
    subscribers: number
    campaigns: number
    recent_campaigns: NewsletterCampaign[]
  }
  analytics: {
    page_views: number
    unique_visitors: number
    bounce_rate: number
  }
}

export interface BulkAction {
  action: "delete" | "publish" | "unpublish" | "archive"
  ids: string[]
}

// SEO types
export interface SEOData {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  og_title?: string
  og_description?: string
  og_image?: string
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string
}

// Timeline types
export interface TimelineEvent {
  id: string
  title: string
  description: string
  date: string
  type: "milestone" | "achievement" | "project" | "education"
  icon?: string
  link?: string
}

// Testimonial types
export interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  content: string
  avatar?: string
  rating: number
  featured: boolean
  created_at: string
}

// Project types
export interface Project {
  id: string
  title: string
  description: string
  image: string
  technologies: string[]
  github_url?: string
  demo_url?: string
  status: "completed" | "in-progress" | "planned"
  featured: boolean
  created_at: string
}
