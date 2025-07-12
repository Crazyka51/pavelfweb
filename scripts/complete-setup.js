require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

// SQL dotazy pro vytvoření tabulek podle existujícího schématu
const createArticlesTable = `
  CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category TEXT DEFAULT 'Aktuality',
    tags TEXT[] DEFAULT '{}',
    published BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by TEXT DEFAULT 'Pavel Fišer'
  );
`;

const createSubscribersTable = `
  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    source TEXT DEFAULT 'web',
    unsubscribe_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    subscribed_at TIMESTAMP DEFAULT NOW(),
    unsubscribed_at TIMESTAMP
  );
`;

const createCategoriesTable = `
  CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    color TEXT DEFAULT '#3b82f6'
  );
`;

async function setupCompleteSchema() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔄 Connecting to Neon PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    console.log('\n📋 Creating core tables...');

    // Vytvoření základních tabulek
    console.log('   🔹 Creating articles table...');
    await client.query(createArticlesTable);

    console.log('   🔹 Creating newsletter_subscribers table...');
    await client.query(createSubscribersTable);

    console.log('   🔹 Creating categories table...');
    await client.query(createCategoriesTable);

    console.log('\n🔍 Verifying tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('✅ Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n🌱 Inserting seed data...');

    // Vložení základních kategorií
    await client.query(`
      INSERT INTO categories (name, slug, description, color) 
      VALUES 
        ('Aktuality', 'aktuality', 'Obecné aktuality a novinky', '#3b82f6'),
        ('Politika', 'politika', 'Politické aktuality', '#ef4444'),
        ('Komunální politika', 'komunalni-politika', 'Místní samospráva', '#10b981'),
        ('Události', 'udalosti', 'Akce a události', '#f59e0b'),
        ('Osobní', 'osobni', 'Osobní příspěvky', '#8b5cf6')
      ON CONFLICT (slug) DO NOTHING
    `);

    // Vložení ukázkového článku s kompatibilním schématem
    await client.query(`
      INSERT INTO articles (title, content, excerpt, category, published, created_by) 
      VALUES (
        'Vítejte na mém webu', 
        '<p>Vítejte na kompletně přepracovaném webu. Najdete zde aktuální informace z politiky, komunální práce i osobního života.</p><p>Web je nyní moderní, rychlý a plně responzivní.</p>', 
        'Nový web s aktuálními informacemi z politiky i osobního života',
        'Aktuality', 
        TRUE, 
        'Pavel Fišer'
      )
      ON CONFLICT DO NOTHING
    `);

    console.log('   ✅ Seed data inserted');

    // Statistiky podle skutečných tabulek
    const stats = await Promise.all([
      client.query('SELECT COUNT(*) FROM articles'),
      client.query('SELECT COUNT(*) FROM newsletter_subscribers'),
      client.query('SELECT COUNT(*) FROM categories')
    ]);

    console.log('\n📊 Database statistics:');
    console.log(`   📝 Articles: ${stats[0].rows[0].count}`);
    console.log(`   📧 Newsletter subscribers: ${stats[1].rows[0].count}`);
    console.log(`   🏷️  Categories: ${stats[2].rows[0].count}`);

    console.log('\n🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Testování CRUD operací
async function testOperations() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('\n🎯 Testing CRUD operations...');

    // CREATE - vložení článku s kompatibilním schématem
    const insertResult = await client.query(`
      INSERT INTO articles (title, content, category, created_by) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, title
    `, ['Test CRUD Article', 'Test content for CRUD operations', 'Aktuality', 'Test Author']);
    
    const articleId = insertResult.rows[0].id;
    console.log(`   ✅ Created: ${insertResult.rows[0].title} (ID: ${articleId})`);

    // READ - čtení s kompatibilním schématem
    const selectResult = await client.query('SELECT title, created_by FROM articles WHERE id = $1', [articleId]);
    console.log(`   ✅ Read: ${selectResult.rows[0].title} by ${selectResult.rows[0].created_by}`);

    // UPDATE
    await client.query('UPDATE articles SET title = $1, updated_at = NOW() WHERE id = $2', ['Updated CRUD Article', articleId]);
    console.log('   ✅ Updated article title');

    // DELETE
    await client.query('DELETE FROM articles WHERE id = $1', [articleId]);
    console.log('   ✅ Deleted test article');

    // Test subscriber operations s kompatibilní tabulkou
    const emailResult = await client.query(`
      INSERT INTO newsletter_subscribers (email, source) 
      VALUES ($1, $2) 
      RETURNING id, email, unsubscribe_token
    `, ['test@example.com', 'test']);
    
    const subscriberId = emailResult.rows[0].id;
    console.log(`   ✅ Added subscriber: ${emailResult.rows[0].email}`);
    
    await client.query('DELETE FROM newsletter_subscribers WHERE id = $1', [subscriberId]);
    console.log('   ✅ Removed test subscriber');

    console.log('\n🎉 All CRUD operations successful!');

  } catch (error) {
    console.error('❌ CRUD operations failed:', error.message);
  } finally {
    await client.end();
  }
}

// Spuštění celého procesu
async function main() {
  await setupCompleteSchema();
  await testOperations();
  console.log('\n✨ Database is ready for Pavel Fišer portfolio website!');
}

main();
