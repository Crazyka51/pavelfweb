import { execSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

async function generatePrismaClient() {
    try {
        console.log('🔄 Spouštím Prisma generování...');
        
        // Cesta k Prisma binárce v node_modules
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const prismaPath = join(process.cwd(), 'node_modules', '.bin', 'prisma');
        
        // Spuštění příkazu generate
        execSync(`${prismaPath} generate`, {
            stdio: 'inherit',
            encoding: 'utf-8'
        });

        console.log('✅ Prisma Client byl úspěšně vygenerován!');
    } catch (error) {
        console.error('❌ Chyba při generování Prisma Client:', error.message);
        process.exit(1);
    }
}

// Spuštění generování
generatePrismaClient();