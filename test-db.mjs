import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function testConnection() {
  try {
    const result = await sql`SELECT version()`;
    console.log('Database version:', result);
    
    const users = await sql`SELECT * FROM admin_users`;
    console.log('Admin users:', users);
    
    const articles = await sql`SELECT * FROM articles`;
    console.log('Articles:', articles);
    
  } catch (error) {
    console.error('Database error:', error);
  }
}

testConnection();
