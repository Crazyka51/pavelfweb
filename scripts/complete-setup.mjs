import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { sql } from "drizzle-orm"
import * as schema from "../lib/schema.ts" // Umožní automatické načítání TypeScript souboru při použití tsx
import bcrypt from "bcryptjs"
import 'dotenv/config'
/**
 * Complete Database Setup Script
 * Vytváří kompletní databázové schéma pro web Pavel Fišer
 * a vkládá počáteční data.
 */

async function main() {
  console.log("Starting complete database setup...")

  if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL environment variable is not set.")
    process.exit(1)
  }

  const client = neon(process.env.DATABASE_URL)
  const db = drizzle(client, { schema })

  try {
    // 1. Drop existing tables (optional, for clean setup)
    console.log("Dropping existing tables (if any)...")
    await db.execute(sql`DROP TABLE IF EXISTS articles CASCADE;`)
    await db.execute(sql`DROP TABLE IF EXISTS categories CASCADE;`)
    await db.execute(sql`DROP TABLE IF EXISTS newsletter_subscribers CASCADE;`)
    await db.execute(sql`DROP TABLE IF EXISTS newsletter_campaigns CASCADE;`)
    await db.execute(sql`DROP TABLE IF EXISTS newsletter_templates CASCADE;`)
    await db.execute(sql`DROP TABLE IF EXISTS admin_users CASCADE;`)
    await db.execute(sql`DROP TABLE IF EXISTS cms_settings CASCADE;`)
    await db.execute(sql`DROP TABLE IF EXISTS analytics_events CASCADE;`)
    console.log("Existing tables dropped.")

    // 2. Create tables based on schema
    console.log("Creating new tables...")
    await db.execute(sql`
      CREATE TABLE articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        category TEXT NOT NULL,
        tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        is_published BOOLEAN NOT NULL DEFAULT FALSE,
        image_url TEXT,
        published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        created_by TEXT NOT NULL
      );
    `)
    await db.execute(sql`
      CREATE TABLE categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `)
    await db.execute(sql`
      CREATE TABLE newsletter_subscribers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        subscribed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE
      );
    `)
    await db.execute(sql`
      CREATE TABLE newsletter_campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        scheduled_at TIMESTAMPTZ,
        sent_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        created_by TEXT NOT NULL
      );
    `)
    await db.execute(sql`
      CREATE TABLE newsletter_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        body TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `)
    await db.execute(sql`
      CREATE TABLE admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'editor',
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `)
    await db.execute(sql`
      CREATE TABLE cms_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key TEXT NOT NULL UNIQUE,
        value TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `)
    await db.execute(sql`
      CREATE TABLE analytics_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_name TEXT NOT NULL,
        event_data TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        user_id TEXT,
        session_id TEXT
      );
    `)
    console.log("Tables created successfully.")

    // 3. Insert initial data
    console.log("Inserting initial data...")

    // Admin User
    const adminPassword = process.env.ADMIN_PAVEL_PASSWORD || "default_admin_password" // Fallback for local testing
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    await db.insert(schema.adminUsers).values({
      username: "Pavel",
      password_hash: hashedPassword,
      role: "admin",
    })
    console.log("Admin user 'Pavel' created.")

    // Categories
    await db.insert(schema.categories).values([
      { name: "Aktuality", slug: "aktuality", description: "Nejnovější zprávy a události" },
      { name: "Městská politika", slug: "mestska-politika", description: "Rozhodnutí a dění v zastupitelstvu" },
      { name: "Doprava", slug: "doprava", description: "Informace o dopravě a infrastruktuře" },
      {
        name: "Životní prostředí",
        slug: "zivotni-prostredi",
        description: "Projekty a iniciativy pro lepší životní prostředí",
      },
      { name: "Kultura", slug: "kultura", description: "Kulturní akce a dění v Praze 4" },
      { name: "Sport", slug: "sport", description: "Sportovní události a aktivity" },
    ])
    console.log("Initial categories inserted.")

    // Articles
    const now = new Date()
    await db.insert(schema.articles).values([
      {
        title: "Otevření nového komunitního centra",
        content: "Dne 15. července bylo slavnostně otevřeno nové komunitní centrum v srdci Prahy 4...",
        excerpt: "Nové komunitní centrum nabízí širokou škálu aktivit pro všechny věkové kategorie.",
        category: "Aktuality",
        tags: ["komunita", "akce", "Praha 4"],
        isPublished: true,
        imageUrl: "/placeholder.svg",
        published_at: now,
        created_by: "Pavel",
      },
      {
        title: "Změny v MHD: Nové linky a jízdní řády",
        content: "Od 1. srpna dochází k významným změnám v městské hromadné dopravě...",
        excerpt: "Připravte se na nové trasy a upravené jízdní řády, které zlepší dostupnost.",
        category: "Doprava",
        tags: ["MHD", "doprava", "jízdní řády"],
        isPublished: true,
        imageUrl: "/placeholder.svg",
        published_at: new Date(now.getTime() - 86400000), // 1 day ago
        created_by: "Pavel",
      },
      {
        title: "Výsadba nových stromů v parcích",
        content: "V rámci projektu Zelená Praha 4 bylo vysazeno přes 500 nových stromů...",
        excerpt: "Přispíváme k lepšímu ovzduší a příjemnějšímu prostředí pro obyvatele.",
        category: "Životní prostředí",
        tags: ["stromy", "parky", "ekologie"],
        isPublished: true,
        imageUrl: "/placeholder.svg",
        published_at: new Date(now.getTime() - 2 * 86400000), // 2 days ago
        created_by: "Pavel",
      },
      {
        title: "Zasedání zastupitelstva: Klíčová rozhodnutí",
        content: "Na posledním zasedání zastupitelstva byly schváleny důležité projekty...",
        excerpt: "Přehled hlavních bodů a dopadů na život v městské části.",
        category: "Městská politika",
        tags: ["zastupitelstvo", "rozhodnutí", "politika"],
        isPublished: false, // This one is not published
        imageUrl: "/placeholder.svg",
        published_at: null,
        created_by: "Pavel",
      },
    ])
    console.log("Initial articles inserted.")

    // Newsletter Subscribers
    await db.insert(schema.newsletterSubscribers).values([
      { email: "test1@example.com", is_active: true },
      { email: "test2@example.com", is_active: false },
    ])
    console.log("Initial newsletter subscribers inserted.")

    // CMS Settings
    await db.insert(schema.cmsSettings).values([
      { key: "site_name", value: "Pavel Fišer CMS" },
      { key: "contact_email", value: "info@pavelfiser.cz" },
    ])
    console.log("Initial CMS settings inserted.")

    console.log("Complete database setup finished successfully!")
  } catch (error) {
    console.error("Error during complete database setup:", error)
    process.exit(1)
  } finally {
    // It's good practice to close the client if it's not managed by a connection pool
    // For Neon serverless, the connection is typically short-lived and managed automatically.
  }
}

main()
