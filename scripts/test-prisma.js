// test-prisma.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

async function main() {
  const prisma = new PrismaClient()
  
  try {
    // Přímý přístup k databázi pomocí Prisma Raw Queries, protože admin_users není v Prisma schématu
    console.log('Mažu všechny stávající admin_users záznamy...')
    const deleteAdminUsers = await prisma.$executeRaw`DELETE FROM admin_users;`
    console.log(`Smazáno ${deleteAdminUsers} admin_users záznamů`)
    
    // 2. Vytvoření nových admin uživatelů
    console.log('Vytvářím nové admin uživatele...')
    
    // Vytvoření uživatele Pavel
    const pavelPassword = await hashPassword('PavelHeslo123!')
    const now = new Date().toISOString()
    
    await prisma.$executeRaw`
      INSERT INTO admin_users (
        id, 
        username, 
        email, 
        password_hash, 
        role, 
        is_active, 
        created_at, 
        updated_at
      ) VALUES (
        gen_random_uuid(),
        'pavel',
        'pavel.fiser@example.com',
        ${pavelPassword},
        'admin',
        TRUE,
        ${now}::timestamptz,
        ${now}::timestamptz
      );
    `
    console.log('Vytvořen admin uživatel Pavel')
    
    // Vytvoření uživatele Crazyk
    const crazykPassword = await hashPassword('CrazykHeslo123!')
    await prisma.$executeRaw`
      INSERT INTO admin_users (
        id, 
        username, 
        email, 
        password_hash, 
        role, 
        is_active, 
        created_at, 
        updated_at
      ) VALUES (
        gen_random_uuid(),
        'crazyk',
        'crazyk@example.com',
        ${crazykPassword},
        'admin',
        TRUE,
        ${now}::timestamptz,
        ${now}::timestamptz
      );
    `
    console.log('Vytvořen admin uživatel Crazyk')
    
    // 3. Kontrola všech admin uživatelů
    console.log('\nKontrola všech admin uživatelů:')
    const adminUsers = await prisma.$queryRaw`SELECT id, username, email, role, is_active, created_at, updated_at FROM admin_users;`
    console.log(`Počet admin uživatelů: ${adminUsers.length}`)
    adminUsers.forEach((user, index) => {
      console.log(`Admin uživatel ${index + 1}:`, JSON.stringify(user, null, 2))
    })
    
    console.log('\nPřihlašovací údaje pro admin:')
    console.log('Pavel - username: pavel, heslo: PavelHeslo123!')
    console.log('Crazyk - username: crazyk, heslo: CrazykHeslo123!')
    
  } catch (error) {
    console.error('Chyba při práci s databází:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch(e => {
    console.error('Neošetřená chyba:', e)
    process.exit(1)
  })
