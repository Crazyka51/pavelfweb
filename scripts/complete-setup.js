import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { promises as fs } from 'fs';
import path from 'path';

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(DATABASE_URL);

async function setupDatabase() {
  console.log('Starting database setup...');

  try {
    // Path to the schema.sql file
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    
    // Read the SQL schema file
    console.log(`Reading schema from: ${schemaPath}`);
    const schemaSql = await fs.readFile(schemaPath, 'utf-8');
    
    // Split the schema into individual statements and execute them
    const statements = schemaSql.split(';').filter(s => s.trim().length > 0);

    console.log(`Found ${statements.length} statements to execute.`);

    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      console.log(`Executing: ${trimmedStatement.substring(0, 70).replace(/\s+/g, ' ')}...`);
      await sql.raw(trimmedStatement);
    }

    
    console.log('Database setup complete. All tables created successfully.');

  } catch (error) {
    console.error('An error occurred during database setup:', error);
    process.exit(1);
  }
}

// Run the setup function if the script is executed directly
if (new URL(import.meta.url).pathname === process.argv[1]) {
  setupDatabase();
}
