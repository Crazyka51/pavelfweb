import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    
    // Vygenerování hash hesla
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);
    
    const admin = await prisma.admin_users.create({
      data: {
        username: 'admin',
        password_hash: passwordHash,
        email: 'admin@example.com',
        role: 'admin',
        is_active: true
      }
    });
    
    console.log('Admin user created:', admin);
    
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
