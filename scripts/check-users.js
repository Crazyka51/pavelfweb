import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true
            }
        });

        console.log('Seznam uživatelů v databázi:');
        console.table(users);
    } catch (error) {
        console.error('❌ Chyba při načítání uživatelů:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();