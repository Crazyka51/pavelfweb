
import 'dotenv/config'

// scripts/setup-schema.js
require('dotenv').config();

const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

/*
Pavel Fišer Portfolio - Database Schema Setup
=============================================

1. Připojení k Neon PostgreSQL databázi
2. Vytvoř tabulky pro správu obsahu:

🔹 articles (články / novinky)
🔹 subscribers (odběratelé)  
🔹 categories (volitelné štítky)

🔽 SQL dotazy ke spuštění:
*/

const createArticlesTable = `
  CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    published_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    author TEXT,
    category TEXT,
    tags TEXT[],
    published BOOLEAN DEFAULT FALSE,
    image_url TEXT
  );
`;

const createSubscribersTable = `
  CREATE TABLE IF NOT EXISTS subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMP DEFAULT NOW(),
    unsubscribed_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    source TEXT DEFAULT 'web',
    unsubscribe_token TEXT UNIQUE
  );
`;

const createCategoriesTable = `
  CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );
`;

const createAdminUsersTable = `
  CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
  );
`;

const createNewsletterCampaignsTable = `
  CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    html_content TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by TEXT,
    recipient_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0
  );
`;

/*
3. Spusť tyto dotazy po připojení k databázi.
4. Ověř, že tabulky byly vytvořeny
5. Vytvoř funkce pro INSERT článků, přidání odběratelů, výběr novinek podle kategorie.
*/

async function setupDatabase() {
  try {
    console.log('🔄 Connecting to Neon PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    console.log('\n📋 Creating database tables...');

    // Create tables
    console.log('🔹 Creating articles table...');
    await client.query(createArticlesTable);
    
    console.log('🔹 Creating subscribers table...');
    await client.query(createSubscribersTable);
    
    console.log('🔹 Creating categories table...');
    await client.query(createCategoriesTable);
    
    console.log('🔹 Creating admin_users table...');
    await client.query(createAdminUsersTable);
    
    console.log('� Creating newsletter_campaigns table...');
    await client.query(createNewsletterCampaignsTable);

    // Verify tables were created
    console.log('\n� Verifying tables were created...');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('articles', 'subscribers', 'categories', 'admin_users', 'newsletter_campaigns')
      ORDER BY table_name;
    `;
    
    const result = await client.query(tablesQuery);
    console.log('✅ Created tables:', result.rows.map(row => row.table_name).join(', '));

    // Insert sample data
    console.log('\n📝 Inserting sample data...');
    
    // Sample categories
    await client.query(`
      INSERT INTO categories (name, slug, description) 
      VALUES 
        ('Aktuality', 'aktuality', 'Nejnovější zprávy a aktuality'),
        ('Události', 'udalosti', 'Kulturní a společenské události'),
        ('Oznámení', 'oznameni', 'Důležitá oznámení pro občany')
      ON CONFLICT (slug) DO NOTHING;
    `);

    // Sample admin user (password: admin123)
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO admin_users (username, password_hash, email) 
      VALUES ('admin', $1, 'admin@pavelfiser.cz')
      ON CONFLICT (username) DO NOTHING;
    `, [hashedPassword]);

    // Sample article
    await client.query(`
      INSERT INTO articles (title, content, excerpt, author, category, published, tags) 
      VALUES (
        'Vítejte na novém webu!', 
        'Vítejte na našem novém webu. Zde najdete nejnovější aktuality a informace.',
        'Vítejte na našem novém webu...',
        'Pavel Fišer',
        'Aktuality',
        true,
        ARRAY['novinky', 'web']
      )
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Sample data inserted successfully!');

    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Count records
    const articleCount = await client.query('SELECT COUNT(*) FROM articles');
    const subscriberCount = await client.query('SELECT COUNT(*) FROM subscribers');
    const categoryCount = await client.query('SELECT COUNT(*) FROM categories');
    
    console.log(`📊 Statistics:`);
    console.log(`   📝 Articles: ${articleCount.rows[0].count}`);
    console.log(`   📧 Subscribers: ${subscriberCount.rows[0].count}`);
    console.log(`   🏷️  Categories: ${categoryCount.rows[0].count}`);

    console.log('\n🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Helper functions for basic operations
async function insertArticle(title, content, excerpt, author, category, published = false) {
  const query = `
    INSERT INTO articles (title, content, excerpt, author, category, published)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  return await client.query(query, [title, content, excerpt, author, category, published]);
}

async function addSubscriber(email, source = 'web') {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const query = `
    INSERT INTO subscribers (email, source, unsubscribe_token)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  return await client.query(query, [email, source, token]);
}

async function getArticlesByCategory(category, published = true) {
  const query = `
    SELECT * FROM articles 
    WHERE category = $1 AND published = $2
    ORDER BY published_at DESC;
  `;
  return await client.query(query, [category, published]);
}

// Export functions for use in other scripts
module.exports = {
  insertArticle,
  addSubscriber,
  getArticlesByCategory,
  setupDatabase
};

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}
