const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function testDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🔗 Testing database connection...');
    const healthCheck = await sql`SELECT 1 as health_check`;
    console.log('✅ Database connection successful');

    console.log('📊 Testing tables...');
    
    // Test articles table
    const articleCount = await sql`SELECT COUNT(*) as count FROM articles`;
    console.log(`   📝 Articles: ${articleCount[0].count} rows`);

    // Test newsletter subscribers
    const subscriberCount = await sql`SELECT COUNT(*) as count FROM newsletter_subscribers`;
    console.log(`   📧 Newsletter subscribers: ${subscriberCount[0].count} rows`);

    // Test admin users
    const adminCount = await sql`SELECT COUNT(*) as count FROM admin_users`;
    console.log(`   👤 Admin users: ${adminCount[0].count} rows`);

    // Test newsletter campaigns
    const campaignCount = await sql`SELECT COUNT(*) as count FROM newsletter_campaigns`;
    console.log(`   📢 Newsletter campaigns: ${campaignCount[0].count} rows`);

    // Test newsletter templates
    const templateCount = await sql`SELECT COUNT(*) as count FROM newsletter_templates`;
    console.log(`   📄 Newsletter templates: ${templateCount[0].count} rows`);

    console.log('\n🎯 Testing CRUD operations...');
    
    // Test article creation
    const testArticle = await sql`
      INSERT INTO articles (title, content, excerpt, category, tags, published, created_by)
      VALUES ('Test Article', 'Test content', 'Test excerpt', 'Test', '["test"]'::jsonb, false, 'admin')
      RETURNING id, title
    `;
    console.log(`   ✅ Created test article: ${testArticle[0].title} (ID: ${testArticle[0].id})`);

    // Test article read
    const readArticle = await sql`
      SELECT title, content FROM articles WHERE id = ${testArticle[0].id}
    `;
    console.log(`   ✅ Read test article: ${readArticle[0].title}`);

    // Test article update
    await sql`
      UPDATE articles 
      SET title = 'Updated Test Article' 
      WHERE id = ${testArticle[0].id}
    `;
    console.log(`   ✅ Updated test article`);

    // Test article delete
    await sql`DELETE FROM articles WHERE id = ${testArticle[0].id}`;
    console.log(`   ✅ Deleted test article`);

    console.log('\n🎉 All database tests passed successfully!');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDatabase();
