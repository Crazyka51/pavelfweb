/**
 * Complete Database Setup Script
 * Vytváří kompletní databázové schéma pro web Pavel Fišer
 * a vkládá počáteční data pro články, kategorie, newsletter a nastavení.
 *
 * Použití:
 * 1. Ujistěte se, že máte nastavenou proměnnou prostředí DATABASE_URL.
 * 2. Spusťte: node scripts/complete-setup.js
 */

// Používáme require pro dotenv, protože se jedná o Node.js skript, ne ES modul
require("dotenv").config({ path: ".env.local" })

// Importujeme neon a drizzle-orm
const { neon } = require("@neondatabase/serverless")
const { drizzle } = require("drizzle-orm/neon-http")
const { eq } = require("drizzle-orm")

// Importujeme schéma tabulek. Ujistěte se, že cesta je správná a že schema.ts exportuje tabulky.
// V Node.js skriptu je potřeba použít CommonJS syntaxi pro import, pokud schema.ts není transpilováno na CommonJS.
// Pro jednoduchost a kompatibilitu s Next.js aliasy použijeme relativní cestu,
// ale v reálném Node.js skriptu byste mohli potřebovat nastavit path aliases nebo použít absolutní cesty.
// Předpokládáme, že schema.ts je transpilováno nebo že Node.js podporuje ES moduly s .js příponou.
// Pokud by to selhalo, je potřeba zkontrolovat nastavení Babel/TypeScript pro kompilaci.
const {
  articles,
  categories,
  newsletterSubscribers,
  newsletterCampaigns,
  newsletterTemplates,
  cmsSettings,
} = require("../lib/schema")

async function runSetup() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set.")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)
  const db = drizzle(sql)

  console.log("Starting complete database setup...")

  try {
    // 1. Vytvoření tabulek (pokud neexistují)
    console.log("Creating tables...")
    // Používáme raw SQL pro CREATE TABLE, protože Drizzle ORM nemá přímou metodu pro "CREATE TABLE IF NOT EXISTS"
    // a migrace se obvykle řeší jinými nástroji (např. Drizzle Kit).
    // Toto je pro jednoduché počáteční nastavení.
    await db.execute(`
      CREATE TABLE IF NOT EXISTS articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(512) NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        category VARCHAR(128) NOT NULL,
        tags TEXT[],
        is_published BOOLEAN DEFAULT FALSE,
        image_url VARCHAR(2048),
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(128) NOT NULL
      );
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(7),
        icon VARCHAR(255),
        parent_id UUID,
        display_order VARCHAR(255) DEFAULT '0',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT TRUE,
        source VARCHAR(128) DEFAULT 'web',
        unsubscribe_token VARCHAR(255) UNIQUE,
        subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        unsubscribed_at TIMESTAMP WITH TIME ZONE
      );
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS newsletter_campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(512) NOT NULL,
        content TEXT NOT NULL,
        html_content TEXT NOT NULL,
        text_content TEXT,
        template_id UUID,
        status VARCHAR(50) DEFAULT 'draft',
        scheduled_at TIMESTAMP WITH TIME ZONE,
        sent_at TIMESTAMP WITH TIME ZONE,
        recipient_count VARCHAR(255) DEFAULT '0',
        open_count VARCHAR(255) DEFAULT '0',
        click_count VARCHAR(255) DEFAULT '0',
        bounce_count VARCHAR(255) DEFAULT '0',
        unsubscribe_count VARCHAR(255) DEFAULT '0',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(128) NOT NULL,
        tags TEXT[],
        segment_id UUID
      );
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS newsletter_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        subject VARCHAR(512) NOT NULL,
        content TEXT NOT NULL,
        html_content TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(128) NOT NULL
      );
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        role VARCHAR(50) DEFAULT 'editor',
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS cms_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_name VARCHAR(255) NOT NULL,
        site_description TEXT,
        admin_email VARCHAR(255) NOT NULL,
        language VARCHAR(10) DEFAULT 'en',
        timezone VARCHAR(100) DEFAULT 'UTC',
        default_category_id UUID,
        auto_save_interval VARCHAR(255) DEFAULT '30000',
        allow_image_upload BOOLEAN DEFAULT TRUE,
        max_file_size VARCHAR(255) DEFAULT '5242880',
        require_approval BOOLEAN DEFAULT FALSE,
        default_visibility VARCHAR(50) DEFAULT 'public',
        enable_scheduling BOOLEAN DEFAULT TRUE,
        email_notifications BOOLEAN DEFAULT TRUE,
        new_article_notification BOOLEAN DEFAULT TRUE,
        primary_color VARCHAR(7) DEFAULT '#3b82f6',
        dark_mode BOOLEAN DEFAULT FALSE,
        session_timeout VARCHAR(255) DEFAULT '3600000',
        max_login_attempts VARCHAR(255) DEFAULT '5',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        path VARCHAR(2048) NOT NULL,
        title VARCHAR(512),
        user_id UUID,
        session_id VARCHAR(255) NOT NULL,
        user_agent TEXT,
        referrer VARCHAR(2048),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT
      );
    `)

    console.log("Tables created successfully or already exist.")

    // 2. Vložení počátečních dat (pokud neexistují)
    console.log("Inserting initial data...")

    // Kategorie
    const initialCategories = [
      {
        id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        name: "Aktuality",
        slug: "aktuality",
        description: "Nejnovější zprávy a události.",
        color: "#3b82f6",
        displayOrder: "0",
        isActive: true,
      },
      {
        id: "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
        name: "Městská politika",
        slug: "mestska-politika",
        description: "Informace o dění v městské radě.",
        color: "#ef4444",
        displayOrder: "1",
        isActive: true,
      },
      {
        id: "c3d4e5f6-a7b8-9012-3456-7890abcdef01",
        name: "Doprava",
        slug: "doprava",
        description: "Novinky a změny v dopravě.",
        color: "#10b981",
        displayOrder: "2",
        isActive: true,
      },
      {
        id: "d4e5f6a7-b8c9-0123-4567-890abcdef012",
        name: "Životní prostředí",
        slug: "zivotni-prostredi",
        description: "Projekty a iniciativy pro lepší životní prostředí.",
        color: "#f59e0b",
        displayOrder: "3",
        isActive: true,
      },
      {
        id: "e5f6a7b8-c9d0-1234-5678-90abcdef0123",
        name: "Kultura",
        slug: "kultura",
        description: "Přehled kulturních akcí a událostí.",
        color: "#8b5cf6",
        displayOrder: "4",
        isActive: true,
      },
      {
        id: "f6a7b8c9-d0e1-2345-6789-0abcdef01234",
        name: "Sport",
        slug: "sport",
        description: "Sportovní události a úspěchy.",
        color: "#06b6d4",
        displayOrder: "5",
        isActive: true,
      },
    ]
    for (const cat of initialCategories) {
      const existing = await db.select().from(categories).where(eq(categories.id, cat.id))
      if (existing.length === 0) {
        await db.insert(categories).values(cat)
        console.log(`Inserted category: ${cat.name}`)
      } else {
        console.log(`Category already exists: ${cat.name}`)
      }
    }

    // Články
    const initialArticles = [
      {
        id: "art1-uuid-0001-0000-000000000001",
        title: "Otevření nového komunitního centra",
        content: "Dnes bylo slavnostně otevřeno nové komunitní centrum...",
        author: "Pavel Fišer",
        category: "Aktuality",
        excerpt: "Velká událost pro naši komunitu.",
        isPublished: true,
        createdBy: "Pavel Fišer",
        publishedAt: new Date(),
      },
      {
        id: "art1-uuid-0001-0000-000000000002",
        title: "Změny v MHD jízdních řádech",
        content: "Od 1. září platí nové jízdní řády městské hromadné dopravy...",
        author: "Pavel Fišer",
        category: "Doprava",
        excerpt: "Důležité informace pro cestující.",
        isPublished: true,
        createdBy: "Pavel Fišer",
        publishedAt: new Date(),
      },
      {
        id: "art1-uuid-0001-0000-000000000003",
        title: "Výsledky komunálních voleb",
        content: "Komunální volby přinesly několik překvapení...",
        author: "Pavel Fišer",
        category: "Městská politika",
        excerpt: "Přehled nového složení zastupitelstva.",
        isPublished: true,
        createdBy: "Pavel Fišer",
        publishedAt: new Date(),
      },
      {
        id: "art1-uuid-0001-0000-000000000004",
        title: "Nový projekt na podporu třídění odpadu",
        content: "Město spouští inovativní projekt pro efektivnější třídění odpadu...",
        author: "Pavel Fišer",
        category: "Životní prostředí",
        excerpt: "Krok k zelenějšímu městu.",
        isPublished: true,
        createdBy: "Pavel Fišer",
        publishedAt: new Date(),
      },
      {
        id: "art1-uuid-0001-0000-000000000005",
        title: "Festival místních kapel",
        content: "Tento víkend se koná tradiční festival místních hudebních kapel...",
        author: "Pavel Fišer",
        category: "Kultura",
        excerpt: "Nenechte si ujít hudební zážitek.",
        isPublished: true,
        createdBy: "Pavel Fišer",
        publishedAt: new Date(),
      },
      {
        id: "art1-uuid-0001-0000-000000000006",
        title: "Místní fotbalový tým postoupil do vyšší ligy",
        content: "Gratulujeme našemu fotbalovému týmu k historickému postupu...",
        author: "Pavel Fišer",
        category: "Sport",
        excerpt: "Velký úspěch pro místní sport.",
        isPublished: true,
        createdBy: "Pavel Fišer",
        publishedAt: new Date(),
      },
    ]
    for (const art of initialArticles) {
      const existing = await db.select().from(articles).where(eq(articles.id, art.id))
      if (existing.length === 0) {
        await db.insert(articles).values(art)
        console.log(`Inserted article: ${art.title}`)
      } else {
        console.log(`Article already exists: ${art.title}`)
      }
    }

    // Newsletter Subscribers
    const initialSubscribers = [
      { id: "sub1-uuid-0001-0000-000000000001", email: "test1@example.com", isActive: true, source: "web" },
      { id: "sub1-uuid-0001-0000-000000000002", email: "test2@example.com", isActive: true, source: "web" },
    ]
    for (const sub of initialSubscribers) {
      const existing = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.id, sub.id))
      if (existing.length === 0) {
        await db.insert(newsletterSubscribers).values(sub)
        console.log(`Inserted subscriber: ${sub.email}`)
      } else {
        console.log(`Subscriber already exists: ${sub.email}`)
      }
    }

    // Newsletter Campaigns
    const initialCampaigns = [
      {
        id: "camp1-uuid-0001-0000-000000000001",
        name: "Vítejte v newsletteru",
        subject: "Vítejte!",
        content: "Dobrý den, vítejte v našem newsletteru.",
        htmlContent: "<p>Dobrý den, vítejte v našem newsletteru.</p>",
        createdBy: "Pavel Fišer",
      },
    ]
    for (const camp of initialCampaigns) {
      const existing = await db.select().from(newsletterCampaigns).where(eq(newsletterCampaigns.id, camp.id))
      if (existing.length === 0) {
        await db.insert(newsletterCampaigns).values(camp)
        console.log(`Inserted campaign: ${camp.name}`)
      } else {
        console.log(`Campaign already exists: ${camp.name}`)
      }
    }

    // Newsletter Templates
    const initialTemplates = [
      {
        id: "temp1-uuid-0001-0000-000000000001",
        name: "Základní šablona",
        subject: "Předmět šablony",
        content: "<html><body><h1>{subject}</h1><p>{content}</p></body></html>",
        htmlContent: "<html><body><h1>{subject}</h1><p>{content}</p></body></html>",
        createdBy: "Pavel Fišer",
      },
    ]
    for (const temp of initialTemplates) {
      const existing = await db.select().from(newsletterTemplates).where(eq(newsletterTemplates.id, temp.id))
      if (existing.length === 0) {
        await db.insert(newsletterTemplates).values(temp)
        console.log(`Inserted template: ${temp.name}`)
      } else {
        console.log(`Template already exists: ${temp.name}`)
      }
    }

    // Settings
    const initialSettings = [
      {
        id: "set1-uuid-0001-0000-000000000001",
        siteName: "Pavel Fišer CMS",
        siteDescription: "Název webu",
        adminEmail: "admin@example.com",
        language: "cs",
        timezone: "Europe/Prague",
        autoSaveInterval: 30000,
        allowImageUpload: true,
        maxFileSize: 5242880,
        requireApproval: false,
        defaultVisibility: "public",
        enableScheduling: true,
        emailNotifications: true,
        newArticleNotification: true,
        primaryColor: "#3b82f6",
        darkMode: false,
        sessionTimeout: 3600000,
        maxLoginAttempts: 5,
        updatedAt: new Date(),
      },
    ]
    for (const set of initialSettings) {
      const existing = await db.select().from(cmsSettings).where(eq(cmsSettings.id, set.id))
      if (existing.length === 0) {
        await db.insert(cmsSettings).values(set)
        console.log(`Inserted setting: ${set.siteName}`)
      } else {
        console.log(`Setting already exists: ${set.siteName}`)
      }
    }

    console.log("Initial data inserted successfully.")
    console.log("Complete database setup finished.")
  } catch (error) {
    console.error("Error during complete database setup:", error)
    process.exit(1)
  } finally {
    // Drizzle automaticky uzavírá spojení pro serverless funkce,
    // takže zde není potřeba explicitní uzavření.
  }
}

runSetup()
