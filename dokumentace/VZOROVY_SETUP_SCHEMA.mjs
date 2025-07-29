// setup-schema.mjs
import { neon } from "@neondatabase/serverless"
import 'dotenv/config'

/*
Pavel Fišer Portfolio - Database Schema Setup
=============================================

1. Připojení k Neon PostgreSQL databázi
2. Vytvoř tabulky pro správu obsahu:

🔹 articles (články / novinky)
🔹 categories (kategorie článků)
🔹 newsletter_subscribers (odběratelé newsletteru)
🔹 newsletter_campaigns (kampaně newsletteru)
🔹 newsletter_templates (šablony newsletteru)
🔹 admin_users (administrativní uživatelé)
🔹 cms_settings (nastavení CMS)

Určeno pro Neon PostgreSQL serverless databázi.
*/

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(connectionString);

async function setupSchema() {
  console.log('🚀 Starting database schema setup...');

  try {
    // 1. Vytvoření tabulky articles
    console.log('📝 Creating articles table...');
    await sql`
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
      )
    `;
    console.log('✅ Articles table created or already exists');

    // 2. Vytvoření tabulky categories
    console.log('🏷️ Creating categories table...');
    await sql`
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
      )
    `;
    console.log('✅ Categories table created or already exists');

    // 3. Vytvoření tabulky newsletter_subscribers
    console.log('📧 Creating newsletter_subscribers table...');
    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT TRUE,
        source VARCHAR(128) DEFAULT 'web',
        unsubscribe_token VARCHAR(255) UNIQUE,
        subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        unsubscribed_at TIMESTAMP WITH TIME ZONE
      )
    `;
    console.log('✅ Newsletter subscribers table created or already exists');

    // 4. Vytvoření tabulky newsletter_campaigns
    console.log('📢 Creating newsletter_campaigns table...');
    await sql`
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
      )
    `;
    console.log('✅ Newsletter campaigns table created or already exists');

    // 5. Vytvoření tabulky newsletter_templates
    console.log('📋 Creating newsletter_templates table...');
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
    `;
    console.log('✅ Newsletter templates table created or already exists');

    // 6. Vytvoření tabulky admin_users
    console.log('👤 Creating admin_users table...');
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
    `;
    console.log('✅ Admin users table created or already exists');

    // 7. Vytvoření tabulky cms_settings
    console.log('⚙️ Creating cms_settings table...');
    await sql`
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
      )
    `;
    console.log('✅ CMS settings table created or already exists');

    // 8. Vytvoření tabulky analytics_events
    console.log('📊 Creating analytics_events table...');
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
        metadata TEXT
      )
    `;
    console.log('✅ Analytics events table created or already exists');

    console.log('🎉 Database schema setup completed successfully!');
  } catch (error) {
    console.error('❌ Error during schema setup:', error);
    process.exit(1);
  }
}

setupSchema();
