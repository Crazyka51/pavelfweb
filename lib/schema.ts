<<<<<<< HEAD
import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: text("category").notNull(),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  isPublished: boolean("is_published").notNull().default(false),
  image_url: text("image_url"),
  published_at: timestamp("published_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  created_by: text("created_by").notNull(),
})

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  subscribed_at: timestamp("subscribed_at", { withTimezone: true }).defaultNow().notNull(),
  is_active: boolean("is_active").notNull().default(true),
})

export const newsletterCampaigns = pgTable("newsletter_campaigns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("draft"),
  scheduled_at: timestamp("scheduled_at", { withTimezone: true }),
  sent_at: timestamp("sent_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  created_by: text("created_by").notNull(),
})

export const newsletterTemplates = pgTable("newsletter_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  body: text("body").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  role: text("role").notNull().default("editor"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export const cmsSettings = pgTable("cms_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  event_name: text("event_name").notNull(),
  event_data: text("event_data"),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
  user_id: text("user_id"),
  session_id: text("session_id"),
})
=======
import { pgTable, uuid, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core"

/**
 * Postgres table definition for “articles”.
 * Only the columns that are currently used in the code base are included.
 * Extend it at any time – every field you add will automatically
 * be available through the generated types.
 */
export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 512 }).notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: varchar("category", { length: 128 }).notNull(),
  tags: text("tags").array(), // Stored as TEXT[]
  isPublished: boolean("is_published").notNull().default(false),
  imageUrl: varchar("image_url", { length: 2048 }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: varchar("created_by", { length: 128 }).notNull(),
})

/**
 * Postgres table definition for “categories”.
 */
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 7 }), // e.g., #RRGGBB
  icon: varchar("icon", { length: 255 }), // e.g., Lucide icon name
  parentId: uuid("parent_id"), // Self-referencing for nested categories
  displayOrder: varchar("display_order", { length: 255 }).notNull().default("0"), // Using varchar for simplicity, can be integer
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

/**
 * Postgres table definition for “newsletter_subscribers”.
 */
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  source: varchar("source", { length: 128 }).notNull().default("web"),
  unsubscribeToken: varchar("unsubscribe_token", { length: 255 }).unique(),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).notNull().defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
})

/**
 * Postgres table definition for “newsletter_campaigns”.
 */
export const newsletterCampaigns = pgTable("newsletter_campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 512 }).notNull(),
  content: text("content").notNull(), // Markdown content
  htmlContent: text("html_content").notNull(), // HTML content
  textContent: text("text_content"), // Plain text content
  templateId: uuid("template_id"), // Foreign key to newsletterTemplates
  status: varchar("status", { length: 50 }).notNull().default("draft"), // 'draft', 'scheduled', 'sending', 'sent', 'failed'
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  recipientCount: varchar("recipient_count", { length: 255 }).notNull().default("0"), // Using varchar for simplicity
  openCount: varchar("open_count", { length: 255 }).notNull().default("0"),
  clickCount: varchar("click_count", { length: 255 }).notNull().default("0"),
  bounceCount: varchar("bounce_count", { length: 255 }).notNull().default("0"),
  unsubscribeCount: varchar("unsubscribe_count", { length: 255 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: varchar("created_by", { length: 128 }).notNull(),
  tags: text("tags").array(),
  segmentId: uuid("segment_id"), // For targeting specific subscriber segments
})

/**
 * Postgres table definition for “newsletter_templates”.
 */
export const newsletterTemplates = pgTable("newsletter_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  subject: varchar("subject", { length: 512 }).notNull(),
  content: text("content").notNull(), // Markdown content
  htmlContent: text("html_content").notNull(), // HTML content
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: varchar("created_by", { length: 128 }).notNull(),
})

/**
 * Postgres table definition for “admin_users”.
 */
export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  role: varchar("role", { length: 50 }).notNull().default("editor"), // 'admin', 'editor', 'viewer'
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

/**
 * Postgres table definition for “cms_settings”.
 */
export const cmsSettings = pgTable("cms_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteName: varchar("site_name", { length: 255 }).notNull(),
  siteDescription: text("site_description"),
  adminEmail: varchar("admin_email", { length: 255 }).notNull(),
  language: varchar("language", { length: 10 }).notNull().default("en"),
  timezone: varchar("timezone", { length: 100 }).notNull().default("UTC"),
  defaultCategoryId: uuid("default_category_id"), // Foreign key to categories
  autoSaveInterval: varchar("auto_save_interval", { length: 255 }).notNull().default("30000"), // in milliseconds
  allowImageUpload: boolean("allow_image_upload").notNull().default(true),
  maxFileSize: varchar("max_file_size", { length: 255 }).notNull().default("5242880"), // in bytes (5MB)
  requireApproval: boolean("require_approval").notNull().default(false),
  defaultVisibility: varchar("default_visibility", { length: 50 }).notNull().default("public"), // 'public', 'draft'
  enableScheduling: boolean("enable_scheduling").notNull().default(true),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  newArticleNotification: boolean("new_article_notification").notNull().default(true),
  primaryColor: varchar("primary_color", { length: 7 }).notNull().default("#3b82f6"),
  darkMode: boolean("dark_mode").notNull().default(false),
  sessionTimeout: varchar("session_timeout", { length: 255 }).notNull().default("3600000"), // in milliseconds (1 hour)
  maxLoginAttempts: varchar("max_login_attempts", { length: 255 }).notNull().default("5"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

/**
 * Postgres table definition for “analytics_events”.
 */
export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type", { length: 50 }).notNull(), // 'pageview', 'click', 'form_submit', 'download'
  path: varchar("path", { length: 2048 }).notNull(),
  title: varchar("title", { length: 512 }),
  userId: uuid("user_id"),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  userAgent: text("user_agent"),
  referrer: varchar("referrer", { length: 2048 }),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  metadata: text("metadata"), // Stored as JSON string or similar
})

/**
 * 🎁  Namespace export expected elsewhere:
 *   import { schema } from "@/lib/schema"
 *
 * It contains every table you export above.
 */
export const schema = {
  articles,
  categories,
  newsletterSubscribers,
  newsletterCampaigns,
  newsletterTemplates,
  adminUsers,
  cmsSettings,
  analyticsEvents,
}
>>>>>>> e2ce699b71320c848c521e54fad10a96370f4230
