import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting post-installation setup...');
console.log('=====================================');

async function runSetup() {
  try {
    // Check if .env file exists and has DATABASE_URL
    const envPath = join(__dirname, '..', '.env');
    const hasEnv = existsSync(envPath);
    
    if (!hasEnv && !process.env.DATABASE_URL) {
      console.log('⚠️  Environment setup required');
      console.log('');
      console.log('To complete the setup, you need to:');
      console.log('1. Create a .env file in the project root');
      console.log('2. Add your DATABASE_URL environment variable');
      console.log('3. Run this script again: node scripts/postinstall.js');
      console.log('');
      console.log('Example .env file content:');
      console.log('DATABASE_URL=postgres://username:password@host:port/database');
      console.log('');
      console.log('ℹ️  Post-installation setup skipped - environment not configured');
      return;
    }

    // Run the database setup script
    console.log('📦 Setting up database...');
    
    const setupScript = join(__dirname, 'setup-database-fixed.mjs');
    
    return new Promise((resolve, reject) => {
      const child = spawn('node', [setupScript], {
        stdio: 'inherit',
        cwd: join(__dirname, '..')
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Post-installation setup completed successfully!');
          console.log('   You can now start the development server with: npm run dev');
          resolve();
        } else {
          console.error(`\n❌ Setup failed with exit code ${code}`);
          reject(new Error(`Setup script exited with code ${code}`));
        }
      });

      child.on('error', (error) => {
        console.error('\n❌ Failed to run setup script:', error.message);
        reject(error);
      });
    });
    
  } catch (error) {
    console.error('\n❌ Post-installation setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSetup().catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

export { runSetup };
