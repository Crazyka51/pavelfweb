import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Checking admin users...');
    const users = await prisma.$queryRaw`
      SELECT id, username, email, role, is_active
      FROM admin_users
    `;
    
    console.log('Found users:', users);
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
