/**
 * Database type definitions to ensure consistency between Prisma models and application code
 */

// Article Status Enum - use const assertion for literal types
export const ArticleStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED', 
  ARCHIVED: 'ARCHIVED'
} as const;

export type ArticleStatus = typeof ArticleStatus[keyof typeof ArticleStatus];

// Campaign Status Enum
export const CampaignStatus = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  SENDING: 'SENDING', 
  SENT: 'SENT',
  FAILED: 'FAILED'
} as const;

export type CampaignStatus = typeof CampaignStatus[keyof typeof CampaignStatus];

// Base interfaces for database entities
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Article interfaces
export interface Article extends BaseEntity {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  status: ArticleStatus;
  publishedAt?: Date;
  isFeatured: boolean;
  authorId: string;
  categoryId: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface CreateArticleInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  status?: ArticleStatus;
  publishedAt?: Date;
  isFeatured?: boolean;
  authorId: string;
  categoryId: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateArticleInput extends Partial<CreateArticleInput> {
  id: string;
}

// Category interfaces
export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  display_order: number;
  is_active: boolean;
  parent_id?: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  display_order?: number;
  is_active?: boolean;
  parent_id?: string;
}

// User interfaces
export interface User extends BaseEntity {
  email: string;
  password: string;
  name?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  email?: string;
  role?: string;
  is_active?: boolean;
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;
}

// Newsletter interfaces
export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  source?: string;
  unsubscribe_token?: string;
  subscribed_at: Date;
  unsubscribed_at?: Date;
}

export interface NewsletterCampaign extends BaseEntity {
  name: string;
  subject: string;
  content?: string;
  htmlContent: string;
  textContent?: string;
  status: CampaignStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  recipientCount: number;
  openCount: number;
  clickCount: number;
  bounceCount: number;
  unsubscribeCount: number;
  createdById?: string;
  templateId?: string;
  tags: string[];
  segmentId?: string;
}

export interface NewsletterTemplate extends BaseEntity {
  name: string;
  subject: string;
  content: string;
  htmlContent: string;
  isActive: boolean;
  createdById?: string;
}

// Database raw table interfaces (for direct SQL queries)
export interface RawArticle {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags?: any;
  published: boolean;
  image_url?: string;
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Pagination types
export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}