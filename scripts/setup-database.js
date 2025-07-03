const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  if (!process.env.STORAGE_URL) {
    console.error('❌ STORAGE_URL environment variable is not set');
    process.exit(1);
  }

  const sql = neon(process.env.STORAGE_URL);

  try {
    console.log('🔗 Testing database connection...');
    await sql`SELECT 1 as health_check`;
    console.log('✅ Database connection successful');

    console.log('📖 Reading schema file...');
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`   ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
          // Use raw string for DDL statements
          await sql.query(statement);
        } catch (error) {
          // Ignore "already exists" errors
          if (error.message.includes('already exists')) {
            console.log(`   ⚠️ Skipped (already exists)`);
          } else {
            throw error;
          }
        }
      }
    }

    console.log('✅ Database schema setup completed successfully!');
    
    // Test tables creation
    console.log('🔍 Verifying tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('📋 Created tables:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
