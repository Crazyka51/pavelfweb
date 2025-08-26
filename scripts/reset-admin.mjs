import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetAdmin() {
  try {
    console.log('Začínám resetování admin uživatelů...');

    // 1. Odstraníme všechny existující admin_users
    console.log('Odstraňuji všechny existující admin uživatele...');
    await prisma.admin_users.deleteMany({});
    console.log('Admin uživatelé byli odstraněni');

    // 2. Vytvoříme nového admin uživatele
    const hashedPassword = await bcrypt.hash('1T:V%uuYemJ', 10);
    const newAdmin = await prisma.admin_users.create({
      data: {
        username: 'Pavel',
        password_hash: hashedPassword,
        email: 'pavel@example.com',
        role: 'admin',
        is_active: true
      }
    });

    console.log(`Vytvořen nový admin uživatel s ID: ${newAdmin.id}`);
    console.log('Uživatelské jméno: Pavel');
    console.log('Heslo: 1T:V%uuYemJ');

    console.log('Resetování admin uživatelů dokončeno.');
  } catch (error) {
    console.error('Chyba při resetování admin uživatelů:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin().catch(console.error);
