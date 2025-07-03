// scripts/test-database.js
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const connectionString = process.env.STORAGE_URL;

if (!connectionString) {
  console.error('❌ STORAGE_URL environment variable is not set');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // V Neonu je SSL nutné, ale bez ověřování
  },
});

console.log('🔍 Testing Neon PostgreSQL connection...');

client
  .connect()
  .then(() => {
    console.log('✅ Successfully connected to the database!');
    return client.end();
  })
  .catch((err) => {
    console.error('❌ Database connection test failed:');
    console.error(err.message);
    process.exit(1);
  });
