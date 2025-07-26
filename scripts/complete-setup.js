/**
 * Complete Database Setup Script
 * Vytváří kompletní databázové schéma pro web Pavel Fišer
 * a vkládá počáteční data pro články, kategorie, newsletter a nastavení.
 *
 * Použití:
 * 1. Ujistěte se, že máte nastavenou proměnnou prostředí DATABASE_URL.
 * 2. Spusťte: node scripts/complete-setup.js
 */

const { neon } = require("@neondatabase/serverless")
const path = require("path")
const fs = require("fs")

// Načteme environment variables
require("dotenv").config({ path: ".env.local" })

async function runSetup() {
  // Kontrola DATABASE_URL - použijeme buď env variable nebo přímo Neon URL
  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    "postgres://neondb_owner:npg_gJ0BcDdb1sYN@ep-gentle-haze-a29ewvo3-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable is not set.")
    console.error(
      "Available env vars:",
      Object.keys(process.env).filter((key) => key.includes("DATABASE") || key.includes("POSTGRES")),
    )
    process.exit(1)
  }

  console.log("🔗 Using database URL:", databaseUrl.replace(/:[^:@]*@/, ":****@"))

  const sql = neon(databaseUrl)

  console.log("🚀 Starting complete database setup...")

  try {
    // 1. Test připojení k databázi
    console.log("🔗 Testing database connection...")
    const healthCheck = await sql`SELECT 1 as health_check, current_database() as db_name, current_user as user_name`
    console.log("✅ Database connection successful")
    console.log(`   Database: ${healthCheck[0].db_name}`)
    console.log(`   User: ${healthCheck[0].user_name}`)

    // 2. Vytvoření tabulek pomocí raw SQL
    console.log("📝 Creating database tables...")

    // Vytvoření tabulky articles
    await sql`
      CREATE TABLE IF NOT EXISTS articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(512) NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        category VARCHAR(128) NOT NULL,
        tags TEXT[] DEFAULT '{}',
        is_published BOOLEAN DEFAULT FALSE,
        image_url VARCHAR(2048),
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(128) NOT NULL
      )
    `
    console.log("✅ Articles table created")

    // Vytvoření tabulky categories
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(7) DEFAULT '#3b82f6',
        icon VARCHAR(255),
        parent_id UUID,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("✅ Categories table created")

    // Vytvoření tabulky newsletter_subscribers
    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT TRUE,
        source VARCHAR(128) DEFAULT 'web',
        unsubscribe_token VARCHAR(255) UNIQUE DEFAULT gen_random_uuid(),
        subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        unsubscribed_at TIMESTAMP WITH TIME ZONE
      )
    `
    console.log("✅ Newsletter subscribers table created")

    // Vytvoření tabulky newsletter_campaigns
    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(512) NOT NULL,
        content TEXT NOT NULL,
        html_content TEXT NOT NULL,
        text_content TEXT,
        template_id UUID,
        status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
        scheduled_at TIMESTAMP WITH TIME ZONE,
        sent_at TIMESTAMP WITH TIME ZONE,
        recipient_count INTEGER DEFAULT 0,
        open_count INTEGER DEFAULT 0,
        click_count INTEGER DEFAULT 0,
        bounce_count INTEGER DEFAULT 0,
        unsubscribe_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(128) NOT NULL,
        tags TEXT[] DEFAULT '{}',
        segment_id UUID
      )
    `
    console.log("✅ Newsletter campaigns table created")

    // Vytvoření tabulky newsletter_templates
    await sql`
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
      )
    `
    console.log("✅ Newsletter templates table created")

    // Vytvoření tabulky admin_users
    await sql`
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
      )
    `
    console.log("✅ Admin users table created")

    // Vytvoření tabulky cms_settings
    await sql`
      CREATE TABLE IF NOT EXISTS cms_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(255) NOT NULL UNIQUE,
        value TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("✅ CMS settings table created")

    // Vytvoření tabulky analytics_events
    await sql`
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
        metadata JSONB DEFAULT '{}'
      )
    `
    console.log("✅ Analytics events table created")

    // 3. Vytvoření indexů pro lepší výkon
    console.log("📊 Creating database indexes...")

    await sql`CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published, created_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category)`
    await sql`CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email)`
    await sql`CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(is_active)`
    await sql`CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC)`

    console.log("✅ Database indexes created")

    // 4. Vložení počátečních dat
    console.log("📋 Inserting initial data...")

    // Vložení kategorií
    const categories = [
      { name: "Aktuality", slug: "aktuality", description: "Nejnovější zprávy a události", color: "#3b82f6" },
      {
        name: "Městská politika",
        slug: "mestska-politika",
        description: "Informace o dění v městské radě",
        color: "#ef4444",
      },
      { name: "Doprava", slug: "doprava", description: "Novinky a změny v dopravě", color: "#10b981" },
      {
        name: "Životní prostředí",
        slug: "zivotni-prostredi",
        description: "Projekty pro lepší životní prostředí",
        color: "#f59e0b",
      },
      { name: "Kultura", slug: "kultura", description: "Přehled kulturních akcí a událostí", color: "#8b5cf6" },
      { name: "Sport", slug: "sport", description: "Sportovní události a úspěchy", color: "#06b6d4" },
    ]

    for (const category of categories) {
      try {
        await sql`
          INSERT INTO categories (name, slug, description, color, display_order)
          VALUES (${category.name}, ${category.slug}, ${category.description}, ${category.color}, 0)
          ON CONFLICT (name) DO NOTHING
        `
        console.log(`✅ Category inserted: ${category.name}`)
      } catch (error) {
        console.log(`⚠️  Category already exists: ${category.name}`)
      }
    }

    // Vložení ukázkových článků
    const articles = [
      {
        title: "Vítejte na webu Pavla Fišera",
        content:
          "<p>Vítejte na oficiálním webu zastupitele MČ Praha 4 Pavla Fišera. Zde najdete aktuální informace o dění v naší městské části, moje postoje k důležitým tématům a způsoby, jak se můžete zapojit do komunitního života.</p><p>Jako váš zastupitel se snažím být transparentní a dostupný. Neváhejte mě kontaktovat s vašimi podněty a připomínkami.</p>",
        excerpt: "Úvodní příspěvek na webu zastupitele Pavla Fišera s informacemi o jeho činnosti.",
        category: "Aktuality",
        tags: ["úvod", "praha4", "zastupitel", "komunita"],
        is_published: true,
        created_by: "Pavel Fišer",
      },
      {
        title: "Změny v MHD od září 2024",
        content:
          "<p>Od 1. září 2024 platí nové jízdní řády městské hromadné dopravy v Praze 4. Přinášíme vám přehled nejdůležitějších změn, které ovlivní vaše každodenní cestování.</p><p><strong>Hlavní změny:</strong></p><ul><li>Posílení spojů v ranních hodinách</li><li>Nové zastávky na trase 142</li><li>Změna trasy autobusu 213</li></ul><p>Detailní informace najdete na webu DPP nebo se můžete obrátit přímo na mě.</p>",
        excerpt: "Důležité informace pro cestující MHD o změnách platných od září 2024.",
        category: "Doprava",
        tags: ["mhd", "jízdní řády", "doprava", "praha4"],
        is_published: true,
        created_by: "Pavel Fišer",
      },
      {
        title: "Nový projekt třídění odpadu v Praze 4",
        content:
          "<p>Město Praha 4 spouští inovativní projekt pro efektivnější třídění odpadu v naší městské části. Cílem je zvýšit míru recyklace a snížit množství odpadu končícího na skládkách.</p><p><strong>Co projekt přináší:</strong></p><ul><li>Nové kontejnery s čipovým systémem</li><li>Mobilní aplikace pro sledování třídění</li><li>Odměny za správné třídění</li><li>Vzdělávací programy pro školy</li></ul><p>Projekt startuje v pilotní fázi v několika lokalitách a postupně se rozšíří po celé Praze 4.</p>",
        excerpt: "Krok k zelenějšímu městu - nový systém třídění odpadu s moderními technologiemi.",
        category: "Životní prostředí",
        tags: ["odpad", "třídění", "ekologie", "inovace", "praha4"],
        is_published: true,
        created_by: "Pavel Fišer",
      },
      {
        title: "Výsledky zasedání zastupitelstva - říjen 2024",
        content:
          "<p>Na posledním zasedání zastupitelstva MČ Praha 4 jsme projednali několik důležitých bodů, které přímo ovlivní život našich občanů.</p><p><strong>Schválené body:</strong></p><ul><li>Rozpočet na rekonstrukci dětského hřiště na Pankráci</li><li>Nová pravidla pro parkování rezidentů</li><li>Podpora místních kulturních akcí</li></ul><p><strong>Moje stanoviska:</strong></p><p>Hlasoval jsem pro všechny navržené body, protože věřím, že přinesou pozitivní změny pro naše občany. Zejména rekonstrukce dětského hřiště byla dlouho očekávaná.</p>",
        excerpt: "Přehled důležitých rozhodnutí z posledního zasedání zastupitelstva MČ Praha 4.",
        category: "Městská politika",
        tags: ["zastupitelstvo", "praha4", "rozpočet", "parkování"],
        is_published: true,
        created_by: "Pavel Fišer",
      },
      {
        title: "Festival místních kapel 2024",
        content:
          "<p>Tento víkend se koná již tradiční festival místních hudebních kapel v parku na Pankráci. Akce je zdarma a určena pro celou rodinu.</p><p><strong>Program:</strong></p><ul><li>14:00 - Dětský program s klauny</li><li>16:00 - Místní folkové kapely</li><li>18:00 - Rockové vystoupení</li><li>20:00 - Taneční hudba</li></ul><p>Bude zajištěno občerstvení a aktivity pro děti. Těším se na setkání s vámi!</p>",
        excerpt: "Nenechte si ujít hudební zážitek - festival místních kapel v parku na Pankráci.",
        category: "Kultura",
        tags: ["festival", "hudba", "pankrác", "kultura", "zdarma"],
        is_published: true,
        created_by: "Pavel Fišer",
      },
      {
        title: "Místní fotbalový tým FC Praha 4 postoupil!",
        content:
          "<p>Gratulujeme našemu fotbalovému týmu FC Praha 4 k historickému postupu do krajského přeboru! Po vynikající sezóně si tým zaslouží naši podporu.</p><p><strong>Statistiky sezóny:</strong></p><ul><li>18 vítězství z 22 zápasů</li><li>Nejlepší útok v soutěži</li><li>Pouze 3 prohry</li></ul><p>Jako zastupitel budu podporovat rozvoj sportu v naší městské části a pomohu týmu s hledáním sponzorů pro novou sezónu.</p>",
        excerpt: "Velký úspěch pro místní sport - FC Praha 4 postupuje do vyšší soutěže.",
        category: "Sport",
        tags: ["fotbal", "postup", "praha4", "sport", "úspěch"],
        is_published: true,
        created_by: "Pavel Fišer",
      },
    ]

    for (const article of articles) {
      try {
        await sql`
          INSERT INTO articles (title, content, excerpt, category, tags, is_published, published_at, created_by)
          VALUES (
            ${article.title}, 
            ${article.content}, 
            ${article.excerpt}, 
            ${article.category}, 
            ${article.tags}, 
            ${article.is_published}, 
            ${article.is_published ? new Date() : null}, 
            ${article.created_by}
          )
        `
        console.log(`✅ Article inserted: ${article.title}`)
      } catch (error) {
        console.log(`⚠️  Article might already exist: ${article.title}`)
      }
    }

    // Vložení základní newsletter šablony
    try {
      await sql`
        INSERT INTO newsletter_templates (name, subject, content, html_content, created_by)
        VALUES (
          'Základní šablona',
          'Newsletter z Prahy 4 - {subject}',
          'Vážení občané Prahy 4,\n\n{content}\n\nS pozdravem,\nPavel Fišer\nZastupitel MČ Praha 4',
          '<!DOCTYPE html><html><head><meta charset="utf-8"><title>{subject}</title></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><header style="background: #3b82f6; color: white; padding: 20px; text-align: center;"><h1>Newsletter z Prahy 4</h1></header><main style="padding: 20px;"><h2>{subject}</h2><div>{content}</div></main><footer style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 14px;"><p>S pozdravem,<br><strong>Pavel Fišer</strong><br>Zastupitel MČ Praha 4</p><p><a href="{unsubscribe_url}">Odhlásit odběr</a></p></footer></body></html>',
          'Pavel Fišer'
        )
        ON CONFLICT (name) DO NOTHING
      `
      console.log("✅ Newsletter template inserted")
    } catch (error) {
      console.log("⚠️  Newsletter template already exists")
    }

    // Vložení základních nastavení
    const settings = [
      { key: "site_name", value: "Pavel Fišer - Zastupitel Praha 4" },
      { key: "site_description", value: "Oficiální web zastupitele MČ Praha 4 Pavla Fišera" },
      { key: "admin_email", value: "pavel.fiser@praha4.cz" },
      { key: "language", value: "cs" },
      { key: "timezone", value: "Europe/Prague" },
      { key: "primary_color", value: "#3b82f6" },
      { key: "dark_mode", value: "false" },
      { key: "auto_save_interval", value: "30000" },
      { key: "max_file_size", value: "5242880" },
      { key: "enable_scheduling", value: "true" },
      { key: "email_notifications", value: "true" },
      { key: "session_timeout", value: "3600000" },
      { key: "max_login_attempts", value: "5" },
    ]

    for (const setting of settings) {
      try {
        await sql`
          INSERT INTO cms_settings (key, value)
          VALUES (${setting.key}, ${setting.value})
          ON CONFLICT (key) DO NOTHING
        `
        console.log(`✅ Setting inserted: ${setting.key}`)
      } catch (error) {
        console.log(`⚠️  Setting already exists: ${setting.key}`)
      }
    }

    // 5. Ověření vytvořených tabulek
    console.log("🔍 Verifying created tables...")
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `

    console.log("📋 Database tables:")
    tables.forEach((table) => {
      console.log(`   - ${table.table_name}`)
    })

    // 6. Statistiky dat
    console.log("📊 Data statistics:")
    const articleCount = await sql`SELECT COUNT(*) as count FROM articles`
    const categoryCount = await sql`SELECT COUNT(*) as count FROM categories`
    const templateCount = await sql`SELECT COUNT(*) as count FROM newsletter_templates`
    const settingCount = await sql`SELECT COUNT(*) as count FROM cms_settings`

    console.log(`   - Articles: ${articleCount[0].count}`)
    console.log(`   - Categories: ${categoryCount[0].count}`)
    console.log(`   - Newsletter templates: ${templateCount[0].count}`)
    console.log(`   - Settings: ${settingCount[0].count}`)

    console.log("🎉 Complete database setup finished successfully!")
    console.log("💡 You can now run your application with: npm run dev")
    console.log("🔗 Admin panel will be available at: http://localhost:3000/admin")
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    console.error("Stack trace:", error.stack)

    // Detailnější error reporting
    if (error.message.includes("connect")) {
      console.error("🔍 Connection issue - check your DATABASE_URL")
    } else if (error.message.includes("permission")) {
      console.error("🔍 Permission issue - check database user permissions")
    } else if (error.message.includes("syntax")) {
      console.error("🔍 SQL syntax issue - check the SQL queries")
    }

    process.exit(1)
  }
}

// Spuštění setup funkce
if (require.main === module) {
  runSetup()
}

module.exports = { runSetup }
