import { pgTable, text, timestamp, boolean, uuid, varchar } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// Typy pro databázové entity
export interface NewsletterSubscriber {
  id: string
  email: string
  is_active: boolean
  source: string
  unsubscribe_token?: string
  subscribed_at: Date
  unsubscribed_at?: Date | null
}

export interface NewsletterCampaign {
  id: string
  name: string
  subject: string
  content: string
  html_content: string
  text_content?: string | null
  template_id?: string | null
  status: "draft" | "scheduled" | "sending" | "sent" | "failed"
  scheduled_at?: Date | null
  sent_at?: Date | null
  recipient_count: number
  open_count: number
  click_count: number
  bounce_count: number
  unsubscribe_count: number
  created_at: Date
  updated_at: Date
  created_by: string
  tags?: string[] | null
  segment_id?: string | null
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

/**
 * Postgres table definition for "newsletter_subscribers".
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
 * Postgres table definition for "newsletter_campaigns".
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
 * Postgres table definition for "newsletter_templates".
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

// Export schema
export const newsletterSchema = {
  newsletterSubscribers,
  newsletterCampaigns,
  newsletterTemplates,
}
