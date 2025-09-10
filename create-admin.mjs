import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  // Získání uživatelského jména a hesla z argumentů příkazové řádky
  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'admin123';
  const email = process.argv[4] || `${username}@example.com`;
  
  try {
    console.log(`Creating admin user "${username}"...`);
    
    // Vygenerování hash hesla
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const admin = await prisma.admin_users.create({
      data: {
        username: username,
        password_hash: passwordHash,
        email: email,
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
