import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePassword() {
    try {
        const result = await prisma.$executeRaw`
            UPDATE "User"
            SET password = '$2b$10$CHJSFCLPPb.5uFMGS7byLejoaLozfdDLXTlEmOyxToQ60pslvDPyK'
            WHERE email = 'pavel.fiser@example.com'
        `;

        console.log('✅ Heslo bylo úspěšně aktualizováno');
        console.log('Počet aktualizovaných záznamů:', result);
    } catch (error) {
        console.error('❌ Chyba při aktualizaci hesla:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updatePassword();