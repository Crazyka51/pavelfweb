import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function addAdminUser() {
    try {
        // Heslo admin123
        const hash = await bcrypt.hash('admin123', 10);
        
        const admin = await prisma.admin_users.upsert({
            where: {
                username: 'PavelFiseradmin'
            },
            update: {
                password_hash: hash,
                email: 'jackvolat@gmail.com',
                role: 'admin',
                is_active: true
            },
            create: {
                username: 'PavelFiseradmin',
                password_hash: hash,
                email: 'jackvolat@gmail.com',
                role: 'admin',
                is_active: true
            }
        });

        console.log('✅ Admin účet byl úspěšně vytvořen/aktualizován:');
        console.log({
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role
        });
    } catch (error) {
        console.error('❌ Chyba:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addAdminUser();