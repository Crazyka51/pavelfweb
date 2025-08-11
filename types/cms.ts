// types/cms.ts
// Centrální místo pro definice typů používaných v CMS

export interface Category {
  id: string
  name: string
  slug?: string
  description?: string | null
  color?: string | null
  icon?: string | null
}

export interface Author {
  id: string
  name: string | null
  email?: string | null
  role?: string
}

export enum ArticleStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED"
}

export interface Article {
  id: string
  title: string
  content: string
  excerpt: string | null
  category: Category
  categoryId: string
  tags: string[]
  status: ArticleStatus
  published?: boolean // zpětná kompatibilita, preferovat status
  createdAt: string
  updatedAt: string
  author: Author
  authorId: string
  imageUrl?: string | null
  publishedAt?: string | null
  isFeatured?: boolean
  slug?: string
  metaTitle?: string | null
  metaDescription?: string | null
}

export interface ArticleListOptions {
  limit?: number
  offset?: number
  status?: ArticleStatus
  search?: string
  category?: string
}

export interface CreateArticleInput {
  title: string
  slug: string
  content: string
  excerpt?: string | null
  categoryId: string
  authorId: string
  tags?: string[]
  imageUrl?: string | null
  status?: ArticleStatus
  isFeatured?: boolean
  metaTitle?: string | null
  metaDescription?: string | null
  publishedAt?: Date | null
}

export interface UpdateArticleInput {
  title?: string
  slug?: string
  content?: string
  excerpt?: string | null
  categoryId?: string
  tags?: string[]
  imageUrl?: string | null
  status?: ArticleStatus
  isFeatured?: boolean
  metaTitle?: string | null
  metaDescription?: string | null
  publishedAt?: Date | null
}

export interface NewsletterSubscriber {
  id: string
  email: string
  isActive: boolean
  source: string
  unsubscribeToken?: string | null
  subscribedAt: string
  unsubscribedAt?: string | null
}

export interface NewsletterCampaign {
  id: string
  name: string
  subject: string
  body: string
  content: string
  htmlContent: string
  textContent?: string | null
  templateId?: string | null
  status: string
  scheduledAt?: string | null
  sentAt?: string | null
  recipientCount: number
  openCount: number
  clickCount: number
  bounceCount: number
  unsubscribeCount: number
  createdAt: string
  updatedAt: string
  createdBy: string
  tags?: string[] | null
  segmentId?: string | null
}

export interface NewsletterTemplate {
  id: string
  name: string
  subject: string
  body: string
  content: string
  htmlContent: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface AdminUser {
  id: string
  username: string
  email?: string | null
  role: string
  isActive: boolean
  lastLogin?: string | null
  displayName?: string | null
}

export interface DashboardStats {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  scheduledArticles: number
  totalWords: number
  avgWordsPerArticle: number
  lastWeekArticles: number
  newsletterSubscribers: number
  recentActivity: Array<{
    id: string
    type: "create" | "update" | "publish" | "draft"
    title: string
    timestamp: string
  }>
}
