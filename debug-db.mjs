import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('=== Checking categories ===');
    const categories = await prisma.category.findMany();
    console.log('Categories:', categories);
    
    console.log('\n=== Checking users ===');
    const users = await prisma.user.findMany();
    console.log('Users:', users);
    
    console.log('\n=== Database connection test ===');
    console.log('Database connected successfully!');
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
