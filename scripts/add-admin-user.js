import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function addNewAdmin() {
    try {
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);
        
        const newUser = await prisma.user.create({
            data: {
                email: 'jackvolat@gmail.com',
                name: 'Admin',
                password: hash,
                role: 'ADMIN'
            }
        });

        console.log('✅ Nový admin účet byl úspěšně vytvořen:');
        console.log({
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
        });
    } catch (error) {
        if (error.code === 'P2002') {
            console.error('❌ Email již existuje, pokusím se aktualizovat heslo...');
            
            const updatedUser = await prisma.user.update({
                where: {
                    email: 'jackvolat@gmail.com'
                },
                data: {
                    password: await bcrypt.hash('admin123', 10),
                    role: 'ADMIN'
                }
            });

            console.log('✅ Heslo bylo úspěšně aktualizováno pro:', updatedUser.email);
        } else {
            console.error('❌ Chyba:', error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

addNewAdmin();