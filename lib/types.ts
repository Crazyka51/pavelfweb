export interface Article {
  id: string
  title: string
  content: string
  excerpt?: string | null
  category: string
  tags: string[]
  published: boolean
  imageUrl?: string | null
  publishedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  createdBy: string
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

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  color?: string | null
  icon?: string | null
  parent_id?: string | null
  display_order: number
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
  default_category_id?: string | null
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

export interface ConsentSettings {
  analytics: "granted" | "denied"
  personalization: "granted" | "denied"
  ad_storage: "granted" | "denied"
  ad_user_data: "granted" | "denied"
  ad_personalization: "granted" | "denied"
}

export interface FacebookPost {
  id: string
  message?: string
  full_picture?: string
  created_time: string
  permalink_url: string
}

export interface FacebookPostsResponse {
  posts: FacebookPost[]
  isMockData: boolean
  message?: string
}

export interface AnalyticsData {
  date: string
  views: number
  visitors: number
}
