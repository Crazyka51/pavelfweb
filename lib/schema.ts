import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

/**
 * Postgres table definition for "articles".
 */
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

/**
 * Postgres table definition for "categories".
 */
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  color: text("color"),
  icon: text("icon"),
  parent_id: uuid("parent_id"),
  display_order: text("display_order").notNull().default("0"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

/**
 * Postgres table definition for "newsletter_subscribers".
 */
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  is_active: boolean("is_active").notNull().default(true),
  source: text("source").notNull().default("web"),
  unsubscribe_token: text("unsubscribe_token").unique(),
  subscribed_at: timestamp("subscribed_at", { withTimezone: true }).defaultNow().notNull(),
  unsubscribed_at: timestamp("unsubscribed_at", { withTimezone: true }),
})

/**
 * Postgres table definition for "newsletter_campaigns".
 */
export const newsletterCampaigns = pgTable("newsletter_campaigns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  content: text("content").notNull(),
  html_content: text("html_content").notNull(),
  text_content: text("text_content"),
  template_id: uuid("template_id"),
  status: text("status").notNull().default("draft"),
  scheduled_at: timestamp("scheduled_at", { withTimezone: true }),
  sent_at: timestamp("sent_at", { withTimezone: true }),
  recipient_count: text("recipient_count").notNull().default("0"),
  open_count: text("open_count").notNull().default("0"),
  click_count: text("click_count").notNull().default("0"),
  bounce_count: text("bounce_count").notNull().default("0"),
  unsubscribe_count: text("unsubscribe_count").notNull().default("0"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  created_by: text("created_by").notNull(),
  tags: text("tags").array(),
  segment_id: uuid("segment_id"),
})

/**
 * Postgres table definition for "newsletter_templates".
 */
export const newsletterTemplates = pgTable("newsletter_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  content: text("content").notNull(),
  html_content: text("html_content").notNull(),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  created_by: text("created_by").notNull(),
})

/**
 * Postgres table definition for "admin_users".
 */
export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  email: text("email").unique(),
  role: text("role").notNull().default("editor"),
  is_active: boolean("is_active").notNull().default(true),
  last_login: timestamp("last_login", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

/**
 * Postgres table definition for "cms_settings".
 */
export const cmsSettings = pgTable("cms_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value"),
  site_name: text("site_name"),
  site_description: text("site_description"),
  admin_email: text("admin_email"),
  language: text("language").notNull().default("en"),
  timezone: text("timezone").notNull().default("UTC"),
  default_category_id: uuid("default_category_id"),
  auto_save_interval: text("auto_save_interval").notNull().default("30000"),
  allow_image_upload: boolean("allow_image_upload").notNull().default(true),
  max_file_size: text("max_file_size").notNull().default("5242880"),
  require_approval: boolean("require_approval").notNull().default(false),
  default_visibility: text("default_visibility").notNull().default("public"),
  enable_scheduling: boolean("enable_scheduling").notNull().default(true),
  email_notifications: boolean("email_notifications").notNull().default(true),
  new_article_notification: boolean("new_article_notification").notNull().default(true),
  primary_color: text("primary_color").notNull().default("#3b82f6"),
  dark_mode: boolean("dark_mode").notNull().default(false),
  session_timeout: text("session_timeout").notNull().default("3600000"),
  max_login_attempts: text("max_login_attempts").notNull().default("5"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

/**
 * Postgres table definition for "analytics_events".
 */
export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  event_name: text("event_name").notNull(),
  event_data: text("event_data"),
  type: text("type"),
  path: text("path"),
  title: text("title"),
  user_id: text("user_id"),
  session_id: text("session_id"),
  user_agent: text("user_agent"),
  referrer: text("referrer"),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
  metadata: text("metadata"),
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
