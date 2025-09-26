import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await hash('admin123', 10);
    
    const admin = await prisma.admin_users.upsert({
      where: { username: 'PavelFiseradmin' },
      update: {
        password_hash: hashedPassword,
        email: 'pavel.fiser@praha4.cz',
        role: 'admin',
        is_active: true
      },
      create: {
        username: 'PavelFiseradmin',
        password_hash: hashedPassword,
        email: 'pavel.fiser@praha4.cz',
        role: 'admin',
        is_active: true
      }
    });

    console.log('Admin user created/updated:', admin);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();